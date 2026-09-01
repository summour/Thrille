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

/** เรียงเลขมาตราแบบธรรมชาติ รองรับรูปแบบ "1598/1" */
export function compareArticleIds(a: string, b: string): number {
  const [aMain, aSub = '0'] = a.split('/');
  const [bMain, bSub = '0'] = b.split('/');
  const main = Number(aMain) - Number(bMain);
  if (main !== 0) return main;
  return Number(aSub) - Number(bSub);
}

/** ตัดข้อความยาวสำหรับ preview */
export function truncate(text: string, max = 160): string {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}