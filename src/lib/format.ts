import type { IndexedLawNode } from '@/types/law';

/** ป้ายชื่อโหนด เช่น "คำปรารภ" / "ข้อความเบื้องต้น" / "บรรพ 1 หลักทั่วไป" / "ส่วนที่ 1 สภาพบุคคล" */
export function nodeLabel(node: Pick<IndexedLawNode, 'type' | 'number' | 'title'>): string {
  if (node.type === 'คำปรารภ') {
    return node.title && node.title !== 'คำปรารภ' ? `คำปรารภ ${node.title}`.trim() : 'คำปรารภ';
  }
  if (node.type === 'ข้อความเบื้องต้น') {
    return node.title ? `ข้อความเบื้องต้น ${node.title}`.trim() : 'ข้อความเบื้องต้น';
  }
  if (!node.number) {
    return node.title;
  }
  const prefix = node.type === 'ส่วน' ? 'ส่วนที่' : node.type;
  return `${prefix} ${node.number} ${node.title}`.trim();
}

/** ป้ายสั้นสำหรับ breadcrumb เช่น "คำปรารภ" / "ข้อความเบื้องต้น" / "บรรพ 1" */
export function nodeShortLabel(node: Pick<IndexedLawNode, 'type' | 'number' | 'title'>): string {
  if (node.type === 'คำปรารภ') {
    return 'คำปรารภ';
  }
  if (node.type === 'ข้อความเบื้องต้น') {
    return 'ข้อความเบื้องต้น';
  }
  if (!node.number) {
    return node.title || node.type;
  }
  return `${node.type} ${node.number}`;
}

const ORDINAL_WORDS: Record<string, number> = {
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

function parseSortKey(id: string): [number, number] {
  if (id === 'คำปรารภ') return [-1, 0];
  const [head, slashSub] = id.split('/');
  const [mainText, word] = head.trim().split(/\s+/);
  const main = Number(mainText) || 0;
  if (word && ORDINAL_WORDS[word] && slashSub) {
    return [main, ORDINAL_WORDS[word] + (Number(slashSub) || 0) * 0.01];
  }
  if (slashSub) return [main, Number(slashSub) || 0];
  if (word && ORDINAL_WORDS[word]) return [main, ORDINAL_WORDS[word]];
  return [main, 0];
}

/** เรียงเลขมาตราแบบธรรมชาติ รองรับรูปแบบ "150", "1598/1", "1375 ทวิ", "172 ทวิ/1" */
export function compareArticleIds(a: string, b: string): number {
  const [aMain, aSub] = parseSortKey(a);
  const [bMain, bSub] = parseSortKey(b);
  return aMain - bMain || aSub - bSub || a.localeCompare(b);
}

/** ตัดข้อความยาวสำหรับ preview */
export function truncate(text: string, max = 160): string {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}