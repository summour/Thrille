import { toArabicDigits } from './thai';

/**
 * บรรทัดขยะที่ติดมาจากการ copy PDF ของกฤษฎีกา
 * เพิ่มรูปแบบใหม่ได้ที่นี่ที่เดียว
 */
const NOISE_PATTERNS: RegExp[] = [
  /^สำนักงานคณะกรรมการกฤษฎีกา$/,
  /^-\s*[๐-๙\d]+\s*-$/, // - ๑๒ -
  /^หน้า\s*[๐-๙\d]+/, // หน้า ๑๒
  /^เล่ม\s*[๐-๙\d]+\s*ตอน/, // เล่ม ๑๓๘ ตอนที่ …
  /^ราชกิจจานุเบกษา/,
  /^[๐-๙\d]{1,3}$/, // เลขหน้าลอย ๆ
  /^_{3,}$/,
  /^\[[๐-๙\d]+\]/, // บรรทัดเชิงอรรถ เช่น [1] ราชกิจจานุเบกษา..., [5] มาตรา ๑...
];

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF\u00AD]/g;

/** normalize + ตัดขยะ คืนค่าเป็น array ของบรรทัดที่ใช้งานได้ */
export function cleanLines(rawText: string): string[] {
  return rawText
    .replace(/\r\n?/g, '\n')
    .replace(ZERO_WIDTH, '')
    .replace(/\u00A0/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length === 0 || !NOISE_PATTERNS.some((pattern) => pattern.test(line)))
    .map((line) => line.replace(/\[[๐-๙\d]+\]/g, '')); // ลบเลขเชิงอรรถในบรรทัด เช่น [2], [๓] หลังจากกรองบรรทัดเชิงอรรถแล้ว
}

/** ใช้ตรวจว่าบรรทัดว่างหรือไม่ ก่อนถูก filter ออก (สำหรับแบ่งย่อหน้า) */
export function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

export { toArabicDigits };
