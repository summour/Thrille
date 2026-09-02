import type {
  HighlightColor,
  HighlightStyle,
  KeywordRule,
  PresetHighlightColor,
  UnderlineStyle,
} from '@/types/highlight';

export interface TextSegment {
  text: string;
  isMatch: boolean;
  color?: HighlightColor | null;
  underline?: UnderlineStyle | null;
  style?: HighlightStyle;
  word?: string;
}

interface MatchInterval {
  start: number;
  end: number;
  color: HighlightColor | null;
  underline: UnderlineStyle | null;
  word: string;
}

export const PRESET_COLORS: PresetHighlightColor[] = ['yellow', 'green', 'blue', 'pink'];

export function isPresetColor(color?: string | null): color is PresetHighlightColor {
  if (!color) return false;
  return PRESET_COLORS.includes(color as PresetHighlightColor);
}

/**
 * คำนวณสีข้อความ (ขาวหรือดำ) ให้ตัดกับสีพื้นหลัง hex เพื่อให้อ่านง่าย
 */
export function getContrastTextColor(hex?: string | null): string {
  if (!hex || !hex.startsWith('#')) return 'inherit';
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length < 6) return '#000000';
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? '#000000' : '#ffffff';
}

/**
 * สร้าง inline style สำหรับ custom hex color
 */
export function getCustomColorStyle(color?: HighlightColor | null): {
  backgroundColor?: string;
  color?: string;
} | undefined {
  if (!color || isPresetColor(color)) return undefined;
  return {
    backgroundColor: color,
    color: getContrastTextColor(color),
  };
}

/**
 * แปลง Rule ใดๆ (ทั้ง legacy style และ new color/underline fields) ให้อยู่ในรูป { color, underline }
 */
export function getRuleStyles(rule: {
  color?: HighlightColor | null;
  underline?: UnderlineStyle | null;
  style?: HighlightStyle | string;
}): {
  color: HighlightColor | null;
  underline: UnderlineStyle | null;
} {
  let color: HighlightColor | null = rule.color || null;
  let underline: UnderlineStyle | null = rule.underline || null;

  // หากไม่มีการระบุแยกฟิลด์ ให้ parse จาก legacy/composite `style` string
  if (!color && !underline && rule.style) {
    const s = rule.style;
    if (s.startsWith('#')) {
      color = s;
    } else {
      if (s.includes('yellow')) color = 'yellow';
      else if (s.includes('green')) color = 'green';
      else if (s.includes('blue')) color = 'blue';
      else if (s.includes('pink')) color = 'pink';
    }

    if (s.includes('double')) underline = 'double';
    else if (s.includes('bold')) underline = 'bold';
    else if (s.includes('underline')) underline = 'solid';
  }

  return { color, underline };
}

/**
 * สร้าง CSS class names สำหรับไฮไลท์ที่ผสมสีและรูปแบบเส้นใต้
 */
export function getHighlightClassNames(
  color: HighlightColor | null,
  underline: UnderlineStyle | null,
): string {
  const classes = ['hl'];
  if (color && isPresetColor(color)) {
    classes.push(`hl--${color}`);
  }
  if (underline === 'solid') {
    classes.push('hl--underline');
  } else if (underline === 'bold') {
    classes.push('hl--underline-bold');
  } else if (underline === 'double') {
    classes.push('hl--underline-double');
  }
  return classes.join(' ');
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
    .map((r) => {
      const styles = getRuleStyles(r);
      return {
        ...r,
        word: r.word.trim(),
        color: styles.color,
        underline: styles.underline,
      };
    })
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
        color: rule.color,
        underline: rule.underline,
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
      color: match.color,
      underline: match.underline,
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

