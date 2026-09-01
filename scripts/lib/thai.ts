/** แปลงเลขไทยและคำลำดับในเลขมาตรา ให้เป็นรูปแบบมาตรฐานของโปรเจกต์ */

const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

/** "๑๒๓" → "123" (ตัวอักษรอื่นคงเดิม) */
export function toArabicDigits(input: string): string {
  return input.replace(/[๐-๙]/g, (ch) => String(THAI_DIGITS.indexOf(ch)));
}

/**
 * คำลำดับที่ใช้ต่อท้ายเลขมาตราในกฎหมายไทย
 * เช่น "มาตรา ๑๓๗๕ ทวิ" = มาตรา 1375 ลำดับที่ 2
 */
export const ORDINAL_WORDS: Record<string, number> = {
  ทวิ: 2,
  ตรี: 3,
  จัตวา: 4,
  เบญจ: 5,
  ฉ: 6,
  สัตต: 7,
  อัฏฐ: 8,
  นว: 9,
  ทศ: 10,
  เอกาทศ: 11,
  ทวาทศ: 12,
  เตรส: 13,
  จตุทศ: 14,
  ปัณรส: 15,
};

const ORDINAL_PATTERN = Object.keys(ORDINAL_WORDS).join('|');

/** regex สำหรับจับเลขมาตราทุกรูปแบบที่พบใน ป.พ.พ. */
export const ARTICLE_NUMBER_RE = new RegExp(
  `([๐-๙\\d]+)` + // เลขหลัก
    `(?:\\s*/\\s*([๐-๙\\d]+))?` + // แบบ 1598/1
    `(?:\\s+(${ORDINAL_PATTERN}))?`, // แบบ 1375 ทวิ
);

export interface ParsedArticleNumber {
  /** id ที่ใช้เป็น key เช่น "150", "1598/1", "1375 ทวิ" */
  id: string;
  /** ใช้เรียงลำดับ: [เลขหลัก, ลำดับย่อย] */
  sortKey: [number, number];
}

export function parseArticleNumber(raw: string): ParsedArticleNumber | null {
  const match = ARTICLE_NUMBER_RE.exec(raw.trim());
  if (!match) return null;

  const main = toArabicDigits(match[1]);
  const slashSub = match[2] ? toArabicDigits(match[2]) : null;
  const word = match[3];

  if (slashSub) {
    return { id: `${main}/${slashSub}`, sortKey: [Number(main), Number(slashSub)] };
  }
  if (word) {
    return { id: `${main} ${word}`, sortKey: [Number(main), ORDINAL_WORDS[word]] };
  }
  return { id: main, sortKey: [Number(main), 1] };
}

/** แยกเลขมาตราเป็นคีย์เรียงลำดับ รองรับ "150", "1598/1", "1375 ทวิ" */
function sortKey(id: string): [number, number] {
  const [head, slashSub] = id.split('/');
  const [mainText, word] = head.trim().split(/\s+/);
  const main = Number(mainText);
  if (slashSub) return [main, Number(slashSub)];
  if (word && ORDINAL_WORDS[word]) return [main, ORDINAL_WORDS[word]];
  return [main, 1];
}

export function compareArticleIds(a: string, b: string): number {
  const [aMain, aSub] = sortKey(a);
  const [bMain, bSub] = sortKey(b);
  return aMain - bMain || aSub - bSub;
}
