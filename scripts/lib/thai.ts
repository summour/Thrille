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
  อัฎฐ: 8,
  นว: 9,
  ทศ: 10,
  เอกาทศ: 11,
  ทวาทศ: 12,
  เตรส: 13,
  จตุทศ: 14,
  ปัณรส: 15,
};

const ORDINAL_PATTERN = Object.keys(ORDINAL_WORDS).join('|');

/** regex สำหรับจับเลขมาตราทุกรูปแบบที่พบใน ป.พ.พ., ป.อ., ป.วิ.พ., ป.วิ.อ. */
export const ARTICLE_NUMBER_RE = new RegExp(
  `([๐-๙\\d]+)` + // เลขหลัก
    `(?:\\s+(${ORDINAL_PATTERN}))?` + // แบบ 1375 ทวิ
    `(?:\\s*/\\s*([๐-๙\\d]+))?`, // แบบ 1598/1 หรือ 172 ทวิ/1
);

export interface ParsedArticleNumber {
  /** id ที่ใช้เป็น key เช่น "150", "1598/1", "1375 ทวิ", "172 ทวิ/1" */
  id: string;
  /** ใช้เรียงลำดับ: [เลขหลัก, ลำดับย่อย] */
  sortKey: [number, number];
}

export function parseArticleNumber(raw: string): ParsedArticleNumber | null {
  const match = ARTICLE_NUMBER_RE.exec(raw.trim());
  if (!match) return null;

  const main = toArabicDigits(match[1]);
  const word = match[2];
  const slashSub = match[3] ? toArabicDigits(match[3]) : null;

  if (word && slashSub) {
    const normalizedWord = word === 'อัฎฐ' ? 'อัฏฐ' : word;
    return {
      id: `${main} ${normalizedWord}/${slashSub}`,
      sortKey: [Number(main), (ORDINAL_WORDS[word] ?? 1) + Number(slashSub) * 0.01],
    };
  }
  if (slashSub) {
    return { id: `${main}/${slashSub}`, sortKey: [Number(main), Number(slashSub)] };
  }
  if (word) {
    const normalizedWord = word === 'อัฎฐ' ? 'อัฏฐ' : word;
    return { id: `${main} ${normalizedWord}`, sortKey: [Number(main), ORDINAL_WORDS[word]] };
  }
  return { id: main, sortKey: [Number(main), 1] };
}

/** แยกเลขมาตราเป็นคีย์เรียงลำดับ รองรับ "150", "1598/1", "1375 ทวิ", "172 ทวิ/1" */
function sortKey(id: string): [number, number] {
  const [head, slashSub] = id.split('/');
  const [mainText, word] = head.trim().split(/\s+/);
  const main = Number(mainText);
  if (word && ORDINAL_WORDS[word] && slashSub) {
    return [main, ORDINAL_WORDS[word] + Number(slashSub) * 0.01];
  }
  if (slashSub) return [main, Number(slashSub)];
  if (word && ORDINAL_WORDS[word]) return [main, ORDINAL_WORDS[word]];
  return [main, 1];
}

export function compareArticleIds(a: string, b: string): number {
  const [aMain, aSub] = sortKey(a);
  const [bMain, bSub] = sortKey(b);
  return aMain - bMain || aSub - bSub;
}
