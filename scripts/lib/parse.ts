import type { LawLevel } from '../../src/types/law';
import { parseArticleNumber, toArabicDigits, ORDINAL_WORDS } from './thai';

export type Token =
  | { kind: 'heading'; level: LawLevel; number: string; title: string; line: number }
  | { kind: 'article'; id: string; sortKey: [number, number]; firstText: string; line: number }
  | { kind: 'note'; text: string; line: number }
  | { kind: 'text'; text: string; line: number }
  | { kind: 'break'; line: number };

const HEADING_RE = {
  ข้อความเบื้องต้น: /^ข้อความเบื้องต้น(?:\s*(.*))?$/,
  บรรพ: /^บรรพ\s*([๐-๙\d]+)\s*(.*)$/,
  ลักษณะ: /^ลักษณะ\s*([๐-๙\d]+)\s*(.*)$/,
  หมวด: /^หมวด\s*([๐-๙\d]+)\s*(.*)$/,
  ส่วน: /^ส่วนที่\s*([๐-๙\d]+)\s*(.*)$/,
} as const;

const ORDINALS = Object.keys(ORDINAL_WORDS).join('|');
const ARTICLE_LINE_RE = new RegExp(
  `^มาตรา\\s*([๐-๙\\d]+(?:\\s*/\\s*[๐-๙\\d]+)?(?:\\s+(?:${ORDINALS}))?)\\s*(.*)`,
);

const NOTE_RE = /^\[(.*)\]$/;

function isStructuralLine(line: string): boolean {
  return (
    Object.values(HEADING_RE).some((re) => re.test(line)) ||
    ARTICLE_LINE_RE.test(line) ||
    NOTE_RE.test(line)
  );
}

export function tokenize(lines: string[]): Token[] {
  const tokens: Token[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lineNo = i + 1;

    if (line.length === 0) {
      tokens.push({ kind: 'break', line: lineNo });
      continue;
    }

    // 1) หัวข้อโครงสร้าง — ชื่ออาจอยู่บรรทัดถัดไป
    let matchedHeading = false;
    for (const [level, pattern] of Object.entries(HEADING_RE) as [
      keyof typeof HEADING_RE,
      RegExp,
    ][]) {
      const match = pattern.exec(line);
      if (!match) continue;

      let number = '';
      let title = '';

      if (level === 'ข้อความเบื้องต้น') {
        number = '';
        title = (match[1] ?? '').trim();
      } else {
        number = toArabicDigits(match[1]);
        title = (match[2] ?? '').trim();
      }

      if (!title && level !== 'ข้อความเบื้องต้น') {
        const next = lines.slice(i + 1).find((candidate) => candidate.length > 0);
        if (next && !isStructuralLine(next)) {
          title = next;
          i = lines.indexOf(next, i + 1); // ข้ามบรรทัดชื่อไป
        }
      }

      tokens.push({
        kind: 'heading',
        level,
        number,
        title,
        line: lineNo,
      });
      matchedHeading = true;
      break;
    }
    if (matchedHeading) continue;

    // 2) มาตรา
    const articleMatch = ARTICLE_LINE_RE.exec(line);
    if (articleMatch) {
      const parsed = parseArticleNumber(articleMatch[1]);
      if (parsed) {
        tokens.push({
          kind: 'article',
          id: parsed.id,
          sortKey: parsed.sortKey,
          firstText: articleMatch[2].trim(),
          line: lineNo,
        });
        continue;
      }
    }

    // 3) หมายเหตุ
    const noteMatch = NOTE_RE.exec(line);
    if (noteMatch) {
      tokens.push({ kind: 'note', text: noteMatch[1].trim(), line: lineNo });
      continue;
    }

    tokens.push({ kind: 'text', text: line, line: lineNo });
  }

  return tokens;
}
