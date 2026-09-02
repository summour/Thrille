import type { HighlightStyle, KeywordRule } from '@/types/highlight';

export interface TextSegment {
  text: string;
  isMatch: boolean;
  style?: HighlightStyle;
  word?: string;
}

interface MatchInterval {
  start: number;
  end: number;
  style: HighlightStyle;
  word: string;
}

/**
 * แปลงข้อความตัวบทให้เป็น segment ต่างๆ ตาม KeywordRule
 * จัดการเรื่องคำซ้อนกันอย่างถูกต้อง (เลือกคำที่ยาวกว่าก่อน เช่น "อสังหาริมทรัพย์" มาก่อน "ทรัพย์")
 */
export function parseHighlightedText(
  text: string,
  rules: KeywordRule[],
  enabled = true,
): TextSegment[] {
  if (!enabled || !rules || rules.length === 0 || !text) {
    return [{ text, isMatch: false }];
  }

  // กรองคำที่ว่าง และเรียงลำดับจากคำที่ยาวที่สุดไปสั้นที่สุด
  const validRules = rules
    .filter((r) => r.word && r.word.trim().length > 0)
    .map((r) => ({ ...r, word: r.word.trim() }))
    .sort((a, b) => b.word.length - a.word.length);

  if (validRules.length === 0) {
    return [{ text, isMatch: false }];
  }

  const allMatches: MatchInterval[] = [];

  // ค้นหาตำแหน่งทั้งหมดของแต่ละคำ
  for (const rule of validRules) {
    const word = rule.word;
    let fromIndex = 0;
    while (fromIndex < text.length) {
      const idx = text.indexOf(word, fromIndex);
      if (idx === -1) break;
      allMatches.push({
        start: idx,
        end: idx + word.length,
        style: rule.style,
        word,
      });
      fromIndex = idx + Math.max(1, word.length);
    }
  }

  if (allMatches.length === 0) {
    return [{ text, isMatch: false }];
  }

  // เรียงลำดับ matches ตาม start เล็กไปใหญ่ ถ้า start เท่ากันเลือก match ที่ยาวกว่า
  allMatches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });

  // คัดกรอง match ที่ไม่ซ้อนทับกัน (Greedy non-overlapping)
  const nonOverlapping: MatchInterval[] = [];
  let lastEnd = 0;

  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      nonOverlapping.push(match);
      lastEnd = match.end;
    }
  }

  // ตัด text ออกเป็น segments
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const match of nonOverlapping) {
    if (match.start > cursor) {
      segments.push({
        text: text.slice(cursor, match.start),
        isMatch: false,
      });
    }
    segments.push({
      text: text.slice(match.start, match.end),
      isMatch: true,
      style: match.style,
      word: match.word,
    });
    cursor = match.end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      isMatch: false,
    });
  }

  return segments;
}
