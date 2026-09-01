/**
 * ระบบอ่านออกเสียงตัวบทกฎหมายและโครงสร้างสารบัญ (Web Speech API)
 * พร้อมฟังก์ชันแปลงข้อความตัวบทให้ถูกหลักการอ่านภาษากฎหมายไทย
 */

import {
  getAdjacentArticleIds,
  getArticle,
  getArticleNode,
  getLawIdForArticle,
  getLawMeta,
  getNodePath,
} from '@/lib/lawIndex';

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
 * ตรวจสอบว่าข้อความย่อหน้านี้เป็น "อนุมาตรา / ข้อย่อย" หรือไม่
 * เช่น ขึ้นต้นด้วย (๑), (๒), (1), (2), (ก), (ข)
 */
export function isSubClauseParagraph(paragraph: string): boolean {
  return /^\s*\(([๐-๙\d]+|[ก-ฮa-zA-Z]+)\)/.test(paragraph.trim());
}

/**
 * ปรับปรุงข้อความตัวบทให้อ่านออกเสียงได้อย่างถูกต้องตามหลักการอ่านภาษากฎหมาย
 */
export function formatLawTextForSpeech(text: string): string {
  let spoken = text;

  // ตัดหมายเหตุจำลองของต้นแบบออก ไม่ต้องอ่าน
  spoken = spoken.replace(/\(ข้อความย่อสำหรับต้นแบบ\)/g, '');

  // คำย่อประมวลกฎหมายและกฎหมาย
  spoken = spoken.replace(/ป\.พ\.พ\./g, 'ประมวลกฎหมายแพ่งและพาณิชย์');
  spoken = spoken.replace(/ป\.อ\./g, 'ประมวลกฎหมายอาญา');
  spoken = spoken.replace(/ป\.วิ\.พ\./g, 'ประมวลกฎหมายวิธีพิจารณาความแพ่ง');
  spoken = spoken.replace(/ป\.วิ\.อ\./g, 'ประมวลกฎหมายวิธีพิจารณาความอาญา');
  spoken = spoken.replace(/พ\.ร\.บ\./g, 'พระราชบัญญัติ');
  spoken = spoken.replace(/พ\.ร\.ก\./g, 'พระราชกำหนด');
  spoken = spoken.replace(/พ\.ร\.ด\./g, 'พระราชกฤษฎีกา');
  spoken = spoken.replace(/พ\.ศ\.\s*([๐-๙\d]+)/g, (_, yearStr) => {
    const arabicYear = yearStr.replace(/[๐-๙]/g, (d: string) => String(d.charCodeAt(0) - 3664));
    return `พุทธศักราช ${arabicYear}`;
  });

  // อนุมาตรา เช่น (๑), (1), (2), (๓)
  spoken = spoken.replace(/\(([๐-๙\d]+)\)/g, (_, numStr) => {
    const arabic = numStr.replace(/[๐-๙]/g, (d: string) => String(d.charCodeAt(0) - 3664));
    const n = parseInt(arabic, 10);
    return isNaN(n) ? `ข้อ ${numStr} ` : `อนุ${numberToThaiWords(n)} `;
  });

  // ข้อย่อยตัวอักษร เช่น (ก), (ข), (ค)
  spoken = spoken.replace(/\(([ก-ฮa-zA-Z])\)/g, (_, char) => `ข้อย่อย ${char} `);

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
 * สร้างรายการข้อความที่จะอ่านของมาตราแบบแยกชิ้น (Chunk)
 * เพื่อให้อ่านได้อย่างถูกต้องตามหลักการอ่านกฎหมาย (แยก วรรค และ อนุมาตรา)
 */
export function buildArticleSpeechChunks(params: {
  lawTitle: string;
  articleId: string;
  contextBreadcrumbs?: string[];
  paragraphs: string[];
}): string[] {
  const parts: string[] = [];

  const currentContextKey = (params.contextBreadcrumbs || []).join(' > ');

  // ถ้ามีการเปลี่ยน บรรพ/ลักษณะ/หมวด/ส่วน หรือเป็นการอ่านครั้งแรก
  if (currentContextKey && currentContextKey !== lastSpokenContextKey) {
    parts.push(params.contextBreadcrumbs!.join(' '));
    lastSpokenContextKey = currentContextKey;
  }

  // หัวข้อมาตรา
  parts.push(`มาตรา ${params.articleId}`);

  // นับจำนวนวรรคหลักจริงที่ไม่ใช่อนุมาตรา
  const mainParagraphs = params.paragraphs.filter((p) => !isSubClauseParagraph(p));
  const hasMultipleMainParagraphs = mainParagraphs.length > 1;

  let currentMainParagraphIndex = 0;

  // เนื้อหาแต่ละวรรค / อนุมาตรา
  params.paragraphs.forEach((p) => {
    const isSub = isSubClauseParagraph(p);
    const formattedParagraph = formatLawTextForSpeech(p);
    if (!formattedParagraph) return;

    if (isSub) {
      // เป็นอนุมาตรา (เช่น อนุหนึ่ง, อนุสอง) ให้อ่านตัวบทอนุมาตราโดยไม่นับเป็นวรรคใหม่
      parts.push(formattedParagraph);
    } else {
      currentMainParagraphIndex++;
      // ถ้ามาตรานี้มีหลายวรรคหลักจริง ให้ระบุเลขวรรค เช่น วรรคหนึ่ง, วรรคสอง
      if (hasMultipleMainParagraphs) {
        const ord =
          PARAGRAPH_ORDINALS[currentMainParagraphIndex - 1] ||
          numberToThaiWords(currentMainParagraphIndex);
        parts.push(`วรรค${ord}. ${formattedParagraph}`);
      } else {
        // กรณีมีวรรคหลักเพียงวรรคเดียว (แม้จะมีอนุมาตราหลายข้อ) ให้อ่านเนื้อหาทันที
        parts.push(formattedParagraph);
      }
    }
  });

  return parts;
}

/**
 * สร้างสคริปต์เสียงอ่านแบบสมบูรณ์ของมาตรา
 */
export function buildArticleSpeechScript(params: {
  lawTitle: string;
  articleId: string;
  contextBreadcrumbs?: string[];
  paragraphs: string[];
}): string {
  return buildArticleSpeechChunks(params).join('\n\n');
}

export interface LawSpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  currentArticleId: string | null;
  currentLawId: string | null;
  rate: number;
  isAutoPlay: boolean;
}

/**
 * สร้าง element เสียงเงียบแบบวนซ้ำ (Silent Audio Loop)
 * เพื่อรักษา session เสียงของเบราว์เซอร์ให้ทำงานในพื้นหลัง (Background Execution)
 * แม้ผู้ใช้จะสลับไปแอปอื่น ล็อกหน้าจอ หรือปิดจอโทรศัพท์
 */
function createSilentAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  try {
    const sampleRate = 8000;
    const numSamples = sampleRate; // 1 second
    const buffer = new Uint8Array(44 + numSamples);

    buffer.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
    const fileSize = 36 + numSamples;
    buffer[4] = fileSize & 0xff;
    buffer[5] = (fileSize >> 8) & 0xff;
    buffer[6] = (fileSize >> 16) & 0xff;
    buffer[7] = (fileSize >> 24) & 0xff;
    buffer.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

    buffer.set([0x66, 0x6d, 0x74, 0x20], 12); // "fmt "
    buffer[16] = 16; buffer[17] = 0; buffer[18] = 0; buffer[19] = 0;
    buffer[20] = 1; buffer[21] = 0; // PCM
    buffer[22] = 1; buffer[23] = 0; // Mono
    buffer[24] = sampleRate & 0xff; buffer[25] = (sampleRate >> 8) & 0xff; buffer[26] = 0; buffer[27] = 0;
    buffer[28] = sampleRate & 0xff; buffer[29] = (sampleRate >> 8) & 0xff; buffer[30] = 0; buffer[31] = 0;
    buffer[32] = 1; buffer[33] = 0;
    buffer[34] = 8; buffer[35] = 0;

    buffer.set([0x64, 0x61, 0x74, 0x61], 36); // "data"
    buffer[40] = numSamples & 0xff;
    buffer[41] = (numSamples >> 8) & 0xff;
    buffer[42] = (numSamples >> 16) & 0xff;
    buffer[43] = (numSamples >> 24) & 0xff;

    for (let i = 0; i < numSamples; i++) {
      buffer[44 + i] = 128; // PCM 8-bit center/silence
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.01;
    return audio;
  } catch {
    return null;
  }
}

/**
 * คลาสสำหรับจัดการ Speech Synthesis (Web Speech API) พร้อมระบบ Background Audio & MediaSession
 */
class LawSpeechReader {
  private onStateChangeListeners: Array<(state: LawSpeechState) => void> = [];
  private currentRate = 1.0;
  private isSpeakingState = false;
  private isPausedState = false;
  private autoPlayContinuous = false;
  private currentArticleId: string | null = null;
  private currentLawId: string | null = null;

  private silentAudio: HTMLAudioElement | null = null;
  private keepAliveTimer: number | null = null;
  private pendingChunks: string[] = [];
  private chunkIndex = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voice list ready
      };
    }

    if (typeof document !== 'undefined') {
      // เมื่อสลับแท็บหรือกลับมาจากแอปอื่น ตรวจสอบให้เสียงยังคงเล่นต่อเนื่อง
      document.addEventListener('visibilitychange', () => {
        if (this.isSpeakingState && !this.isPausedState) {
          this.ensureAudioAnchorRunning();
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          }
        }
      });
    }
  }

  private ensureAudioAnchorRunning() {
    if (!this.silentAudio) {
      this.silentAudio = createSilentAudioElement();
    }
    if (this.silentAudio && this.silentAudio.paused) {
      this.silentAudio.play().catch(() => {});
    }
  }

  private stopAudioAnchor() {
    if (this.silentAudio) {
      try {
        this.silentAudio.pause();
        this.silentAudio.currentTime = 0;
      } catch (e) {
        void e;
      }
    }
  }

  private startKeepAliveWatchdog() {
    this.stopKeepAliveWatchdog();
    // Watchdog ป้องกัน Chromium / Safari Speech Synthesis หลับหรือตัดสัญญาณหลังผ่านไป ~10-14 วินาที
    if (typeof window !== 'undefined') {
      this.keepAliveTimer = window.setInterval(() => {
        if (this.isSpeakingState && !this.isPausedState && 'speechSynthesis' in window) {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }
      }, 9000);
    }
  }

  private stopKeepAliveWatchdog() {
    if (this.keepAliveTimer !== null && typeof window !== 'undefined') {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
    );
  }

  public getState(): LawSpeechState {
    return {
      isPlaying: this.isSpeakingState,
      isPaused: this.isPausedState,
      currentArticleId: this.currentArticleId,
      currentLawId: this.currentLawId,
      rate: this.currentRate,
      isAutoPlay: this.autoPlayContinuous,
    };
  }

  public getRate(): number {
    return this.currentRate;
  }

  public isAutoPlay(): boolean {
    return this.autoPlayContinuous;
  }

  public setAutoPlay(enabled: boolean) {
    this.autoPlayContinuous = enabled;
    this.notifyState();
  }

  public setRate(rate: number) {
    this.currentRate = rate;
    this.notifyState();
    // หากกำลังอ่านอยู่ ให้รีสตาร์ท chunk ปัจจุบันด้วยความเร็วใหม่
    if (this.isSpeakingState && !this.isPausedState && this.currentArticleId) {
      const artId = this.currentArticleId;
      const lawId = this.currentLawId || undefined;
      this.playArticle(artId, lawId);
    }
  }

  public isPlaying(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  public getCurrentArticleId(): string | null {
    return this.currentArticleId;
  }

  public getCurrentLawId(): string | null {
    return this.currentLawId;
  }

  public subscribe(listener: (state: LawSpeechState) => void) {
    this.onStateChangeListeners.push(listener);
    listener(this.getState());
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notifyState() {
    const state = this.getState();
    this.onStateChangeListeners.forEach((l) => l(state));
  }

  private updateMediaSession(articleId: string, lawId?: string) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const lawMeta = getLawMeta(lawId);
      const article = getArticle(articleId, lawId);
      const node = article ? getArticleNode(article.id, lawId) : undefined;
      const ancestors = node ? getNodePath(node.id) : [];
      const breadcrumbNames = ancestors.map((a) => {
        const prefix = a.type === 'ส่วน' ? 'ส่วนที่' : a.type;
        return `${prefix} ${a.number} ${a.title}`.trim();
      });

      navigator.mediaSession.metadata = new MediaMetadata({
        title: `มาตรา ${articleId}`,
        artist: `${lawMeta.title} (${lawMeta.code})`,
        album: breadcrumbNames.length > 0 ? breadcrumbNames.join(' > ') : 'Thrille — ประมวลกฎหมายไทย',
        artwork: [
          { src: './favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: './favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      });

      navigator.mediaSession.playbackState = 'playing';

      // ตั้งค่าปุ่มควบคุมในหน้าจอล็อก (Lock screen), Dynamic Island, ศูนย์ควบคุม และหูฟังบลูทูธ
      const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
        ['play', () => this.resume()],
        ['pause', () => this.pause()],
        ['stop', () => this.stop()],
        ['nexttrack', () => this.playNext()],
        ['previoustrack', () => this.playPrevious()],
      ];

      handlers.forEach(([action, handler]) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (e) {
          void e;
        }
      });
    } catch (e) {
      void e;
    }
  }

  /**
   * เล่นเสียงอ่านมาตราที่ระบุ พร้อมสนับสนุน Background Audio ต่อเนื่อง
   */
  public playArticle(articleId: string, lawId?: string) {
    if (!this.isSupported()) return;

    const resolvedLawId = getLawIdForArticle(articleId, lawId);
    const article = getArticle(articleId, resolvedLawId);
    if (!article) return;

    const lawMeta = getLawMeta(resolvedLawId);
    const node = getArticleNode(article.id, resolvedLawId);
    const ancestors = node ? getNodePath(node.id) : [];
    const breadcrumbNames = ancestors.map((a) => {
      const prefix = a.type === 'ส่วน' ? 'ส่วนที่' : a.type;
      return `${prefix} ${a.number} ${a.title}`.trim();
    });

    const chunks = buildArticleSpeechChunks({
      lawTitle: lawMeta.title,
      articleId: article.id,
      contextBreadcrumbs: breadcrumbNames,
      paragraphs: article.paragraphs,
    });

    this.currentArticleId = article.id;
    this.currentLawId = resolvedLawId;
    this.pendingChunks = chunks;
    this.chunkIndex = 0;
    this.isPausedState = false;

    // เริ่มต้นระบบรักษาการทำงานเบื้องหลัง (Background Audio Anchor & Watchdog)
    this.ensureAudioAnchorRunning();
    this.startKeepAliveWatchdog();
    this.updateMediaSession(article.id, resolvedLawId);

    this.speakCurrentChunk();
  }

  private speakCurrentChunk() {
    if (!this.isSupported()) return;

    if (this.chunkIndex >= this.pendingChunks.length) {
      // อ่านจบครบทุก chunk ของมาตรานี้แล้ว
      if (this.autoPlayContinuous && this.currentArticleId) {
        const adjacent = getAdjacentArticleIds(this.currentArticleId, this.currentLawId || undefined);
        if (adjacent.next) {
          // อ่านมาตราถัดไปต่อเนื่องอัตโนมัติ
          this.playArticle(adjacent.next, this.currentLawId || undefined);
          return;
        }
      }

      // จบสิ้นสุดการอ่านทั้งหมด
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.stopKeepAliveWatchdog();
      this.stopAudioAnchor();
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      this.notifyState();
      return;
    }

    const chunkText = this.pendingChunks[this.chunkIndex];
    if (!chunkText.trim()) {
      this.chunkIndex++;
      this.speakCurrentChunk();
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = 'th-TH';
    utterance.rate = this.currentRate;
    utterance.pitch = 1.0;

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
      this.isPausedState = false;
      this.notifyState();
    };

    utterance.onend = () => {
      this.chunkIndex++;
      this.speakCurrentChunk();
    };

    utterance.onerror = (e) => {
      // ถ้าถูกยกเลิกเพราะเปลี่ยน chunk หรือ stop ไม่ต้องทำอะไร
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      this.chunkIndex++;
      this.speakCurrentChunk();
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (!this.isSupported()) return;
    if (window.speechSynthesis.speaking && !this.isPausedState) {
      window.speechSynthesis.pause();
      this.isPausedState = true;
      if (this.silentAudio) {
        try {
          this.silentAudio.pause();
        } catch (e) {
          void e;
        }
      }
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      this.notifyState();
    }
  }

  public resume() {
    if (!this.isSupported()) return;
    if (this.isPausedState) {
      this.ensureAudioAnchorRunning();
      window.speechSynthesis.resume();
      this.isPausedState = false;
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      this.notifyState();
    } else if (this.currentArticleId) {
      this.playArticle(this.currentArticleId, this.currentLawId || undefined);
    }
  }

  public playNext() {
    if (!this.currentArticleId) return;
    const adjacent = getAdjacentArticleIds(this.currentArticleId, this.currentLawId || undefined);
    if (adjacent.next) {
      this.playArticle(adjacent.next, this.currentLawId || undefined);
    }
  }

  public playPrevious() {
    if (!this.currentArticleId) return;
    const adjacent = getAdjacentArticleIds(this.currentArticleId, this.currentLawId || undefined);
    if (adjacent.previous) {
      this.playArticle(adjacent.previous, this.currentLawId || undefined);
    }
  }

  public stop() {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.stopKeepAliveWatchdog();
    this.stopAudioAnchor();
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.pendingChunks = [];
    this.chunkIndex = 0;
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
    this.notifyState();
  }

  /** ฟังก์ชันเดิมสำหรับความเข้ากันได้ */
  public speak(text: string, onEnd?: () => void) {
    if (!this.isSupported()) return;
    this.stop();

    this.pendingChunks = [text];
    this.chunkIndex = 0;
    this.ensureAudioAnchorRunning();
    this.startKeepAliveWatchdog();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = this.currentRate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find((v) => v.lang.startsWith('th')) || voices[0];
    if (thaiVoice) utterance.voice = thaiVoice;

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.isPausedState = false;
      this.notifyState();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.stopKeepAliveWatchdog();
      this.stopAudioAnchor();
      this.notifyState();
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.stopKeepAliveWatchdog();
      this.stopAudioAnchor();
      this.notifyState();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const speechReader = new LawSpeechReader();

