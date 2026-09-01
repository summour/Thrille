/**
 * ระบบอ่านออกเสียงตัวบทกฎหมายและโครงสร้างสารบัญ (Web Speech API)
 * พร้อมฟังก์ชันแปลงข้อความตัวบทให้ถูกหลักการอ่านภาษากฎหมายไทย
 */

const THAI_NUM_WORDS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];

/** แปลงตัวเลขเป็นคำอ่านภาษาไทยแบบลำดับ/จำนวน (เช่น 1 -> หนึ่ง, 2 -> สอง, 12 -> สิบสอง) */
function numberToThaiWords(num: number): string {
  if (num < 0) return `ลบ ${numberToThaiWords(Math.abs(num))}`;
  if (num < 10) return THAI_NUM_WORDS[num];
  if (num < 20) return num === 10 ? 'สิบ' : `สิบ${num === 11 ? 'เอ็ด' : THAI_NUM_WORDS[num % 10]}`;
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const unit = num % 10;
    const tensText = tens === 2 ? 'ยี่สิบ' : `${THAI_NUM_WORDS[tens]}สิบ`;
    if (unit === 0) return tensText;
    if (unit === 1) return `${tensText}เอ็ด`;
    return `${tensText}${THAI_NUM_WORDS[unit]}`;
  }
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    return `${THAI_NUM_WORDS[hundreds]}ร้อย${rest > 0 ? numberToThaiWords(rest) : ''}`;
  }
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const rest = num % 1000;
    return `${numberToThaiWords(thousands)}พัน${rest > 0 ? numberToThaiWords(rest) : ''}`;
  }
  return num.toString();
}

/** แปลงเลขวรรคเป็นคำอ่าน เช่น วรรค 1 -> วรรคหนึ่ง, วรรค 2 -> วรรคสอง */
const PARAGRAPH_ORDINALS = ['หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ'];

// เก็บจำตำแหน่งระดับชั้นล่าสุดที่อ่านไป เพื่อไม่ให้อ่านซ้ำซ้อนถ้ายังอยู่ในหมวด/ส่วนเดิม
let lastSpokenContextKey = '';

/**
 * รีเซ็ต context จำตำแหน่งโครงสร้าง (ใช้เมื่อเริ่มเซสชันใหม่ หรือเปลี่ยนประมวล)
 */
export function resetSpokenContext() {
  lastSpokenContextKey = '';
}

/**
 * ปรับปรุงข้อความตัวบทให้อ่านออกเสียงได้อย่างถูกต้องตามหลักการอ่านภาษากฎหมาย
 */
export function formatLawTextForSpeech(text: string): string {
  let spoken = text;

  // ตัดหมายเหตุจำลองของต้นแบบออก ไม่ต้องอ่าน
  spoken = spoken.replace(/\(ข้อความย่อสำหรับต้นแบบ\)/g, '');

  // คำย่อประมวลกฎหมาย
  spoken = spoken.replace(/ป\.พ\.พ\./g, 'ประมวลกฎหมายแพ่งและพาณิชย์');
  spoken = spoken.replace(/ป\.อ\./g, 'ประมวลกฎหมายอาญา');
  spoken = spoken.replace(/ป\.วิ\.พ\./g, 'ประมวลกฎหมายวิธีพิจารณาความแพ่ง');
  spoken = spoken.replace(/ป\.วิ\.อ\./g, 'ประมวลกฎหมายวิธีพิจารณาความอาญา');
  spoken = spoken.replace(/พ\.ร\.บ\./g, 'พระราชบัญญัติ');
  spoken = spoken.replace(/พ\.ร\.ก\./g, 'พระราชกำหนด');
  spoken = spoken.replace(/พ\.ศ\.\s*(\d+)/g, (_, year) => `พุทธศักราช ${year}`);

  // อนุมาตรา เช่น (๑), (1), (2), (ก)
  spoken = spoken.replace(/\(([๑-๙\d]+)\)/g, (_, numStr) => {
    const arabic = numStr.replace(/[๑-๙]/g, (d: string) => String(d.charCodeAt(0) - 3664));
    const n = parseInt(arabic, 10);
    return isNaN(n) ? `ข้อ ${numStr} ` : `อนุมาตรา ${numberToThaiWords(n)} `;
  });

  // ทวิ / ตรี / จัตวา / ทับ
  spoken = spoken.replace(/(\d+)\/(\d+)/g, (_, main, sub) => `${main} ทับ ${sub}`);

  // เครื่องหมายวรรคตอนและการตัดคำ
  spoken = spoken.replace(/ฯลฯ/g, ' และอื่นๆ ');
  spoken = spoken.replace(/ฯ/g, '');
  spoken = spoken.replace(/["“”'‘’]/g, ' ');
  spoken = spoken.replace(/\s+/g, ' ');

  return spoken.trim();
}

/**
 * สร้างสคริปต์เสียงอ่านแบบสมบูรณ์ของมาตรา
 * - อ่าน บรรพ/ลักษณะ/หมวด/ส่วน เฉพาะ "ครั้งแรกที่เปลี่ยนหมวด/ส่วน" เท่านั้น
 * - หลังจากนั้นจะขึ้น "มาตรา ..." ทันที
 */
export function buildArticleSpeechScript(params: {
  lawTitle: string;
  articleId: string;
  contextBreadcrumbs?: string[]; // เช่น ["บรรพ 1", "ลักษณะ 1", "หมวด 1"]
  paragraphs: string[];
}): string {
  const parts: string[] = [];

  const currentContextKey = (params.contextBreadcrumbs || []).join(' > ');

  // ถ้ามีการเปลี่ยน บรรพ/ลักษณะ/หมวด/ส่วน หรือเป็นการอ่านครั้งแรก
  if (currentContextKey && currentContextKey !== lastSpokenContextKey) {
    parts.push(params.contextBreadcrumbs!.join(' '));
    lastSpokenContextKey = currentContextKey;
  }

  // หัวข้อมาตรา
  parts.push(`มาตรา ${params.articleId}`);

  // เนื้อหาแต่ละวรรค
  params.paragraphs.forEach((p, index) => {
    const formattedParagraph = formatLawTextForSpeech(p);
    if (!formattedParagraph) return;

    if (params.paragraphs.length > 1) {
      const ord = PARAGRAPH_ORDINALS[index] || numberToThaiWords(index + 1);
      parts.push(`วรรค${ord}. ${formattedParagraph}`);
    } else {
      parts.push(formattedParagraph);
    }
  });

  return parts.join('\n\n');
}

/**
 * คลาสสำหรับจัดการ Speech Synthesis (Web Speech API)
 */
class LawSpeechReader {
  private onStateChangeListeners: Array<(isPlaying: boolean, rate: number) => void> = [];
  private currentRate = 1.0;
  private isSpeakingState = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voice list ready
      };
    }
  }

  private autoPlayContinuous = false;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public getRate(): number {
    return this.currentRate;
  }

  public isAutoPlay(): boolean {
    return this.autoPlayContinuous;
  }

  public setAutoPlay(enabled: boolean) {
    this.autoPlayContinuous = enabled;
  }

  public setRate(rate: number) {
    this.currentRate = rate;
    this.notifyState();
  }

  public isPlaying(): boolean {
    return this.isSpeakingState;
  }

  public subscribe(listener: (isPlaying: boolean, rate: number) => void) {
    this.onStateChangeListeners.push(listener);
    listener(this.isSpeakingState, this.currentRate);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notifyState() {
    this.onStateChangeListeners.forEach((l) => l(this.isSpeakingState, this.currentRate));
  }

  public stop() {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.isSpeakingState = false;
    this.notifyState();
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.isSupported()) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = this.currentRate;
    utterance.pitch = 1.0;

    // หาเสียงภาษาไทยที่ดีที่สุดในเครื่อง macOS/iOS (เช่น Siri, Kanya, Narisa, Google Thai)
    const voices = window.speechSynthesis.getVoices();
    const thaiVoices = voices.filter(
      (v) =>
        v.lang === 'th-TH' ||
        v.lang === 'th_TH' ||
        v.lang.startsWith('th') ||
        v.name.toLowerCase().includes('thai') ||
        v.name.toLowerCase().includes('kanya') ||
        v.name.toLowerCase().includes('narisa')
    );

    // ลำดับความเพราะ: Siri / Enhanced / Premium > Compact macOS Voices > Google > ค่าเริ่มต้น
    const thaiVoice =
      thaiVoices.find((v) => v.name.includes('Siri') || v.name.includes('Premium') || v.name.includes('Enhanced')) ||
      thaiVoices.find((v) => v.name.includes('Kanya') || v.name.includes('Narisa')) ||
      thaiVoices.find((v) => v.name.includes('Google')) ||
      thaiVoices[0];

    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.notifyState();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.notifyState();
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
      this.notifyState();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const speechReader = new LawSpeechReader();
