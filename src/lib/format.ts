import type { IndexedLawNode } from '@/types/law';

/** ป้ายชื่อโหนด เช่น "บรรพ 1 หลักทั่วไป" / "ส่วนที่ 1 สภาพบุคคล" */
export function nodeLabel(node: Pick<IndexedLawNode, 'type' | 'number' | 'title'>): string {
  const prefix = node.type === 'ส่วน' ? 'ส่วนที่' : node.type;
  return `${prefix} ${node.number} ${node.title}`.trim();
}

/** ป้ายสั้นสำหรับ breadcrumb เช่น "บรรพ 1" */
export function nodeShortLabel(node: Pick<IndexedLawNode, 'type' | 'number'>): string {
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
  นว: 9,
  ทศ: 10,
  เอกาทศ: 11,
  ทวาทศ: 12,
  เตรส: 13,
  จตุทศ: 14,
  ปัณรส: 15,
};

function parseSortKey(id: string): [number, number] {
  const [head, slashSub] = id.split('/');
  const [mainText, word] = head.trim().split(/\s+/);
  const main = Number(mainText) || 0;
  if (slashSub) return [main, Number(slashSub) || 0];
  if (word && ORDINAL_WORDS[word]) return [main, ORDINAL_WORDS[word]];
  return [main, 1];
}

/** เรียงเลขมาตราแบบธรรมชาติ รองรับรูปแบบ "150", "1598/1", "1375 ทวิ" */
export function compareArticleIds(a: string, b: string): number {
  const [aMain, aSub] = parseSortKey(a);
  const [bMain, bSub] = parseSortKey(b);
  return aMain - bMain || aSub - bSub;
}

/** ตัดข้อความยาวสำหรับ preview */
export function truncate(text: string, max = 160): string {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}