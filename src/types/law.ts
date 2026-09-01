/** ระดับชั้นของโครงสร้างประมวลกฎหมาย (ไม่จำเป็นต้องมีครบทุกระดับ) */
export type LawLevel = 'บรรพ' | 'ลักษณะ' | 'หมวด' | 'ส่วน';

/**
 * โหนดในสารบัญกฎหมาย
 * - ถ้ามี `children` = ยังมีระดับย่อยลงไปอีก
 * - ถ้ามี `articleIds` = โหนดนี้เก็บมาตราโดยตรง
 * - มีทั้งสองอย่างพร้อมกันได้ (เช่น หมวดที่มีมาตรานำ แล้วค่อยแยกส่วน)
 */
export interface LawNode {
  type: LawLevel;
  number: string;
  title: string;
  children?: LawNode[];
  articleIds?: string[];
}

/** โหนดหลังผ่านการทำ index แล้ว (id ถูกสร้างอัตโนมัติจากตำแหน่งในต้นไม้) */
export interface IndexedLawNode {
  id: string;
  parentId: string | null;
  type: LawLevel;
  number: string;
  title: string;
  childIds: string[];
  /** มาตราที่อยู่ใต้โหนดนี้โดยตรง */
  articleIds: string[];
  /** จำนวนมาตราทั้งหมดรวมโหนดลูก */
  totalArticles: number;
}

/** มาตรา — read-only */
export interface Article {
  /** เลขมาตรา เช่น "150", "1598/1" */
  id: string;
  /** ตัวบทกฎหมาย แยกเป็นย่อหน้า */
  paragraphs: string[];
  /** หมายเหตุท้ายมาตรา เช่น ประวัติการแก้ไข */
  note?: string;
}

/** คำพิพากษาศาลฎีกา — read-only, schema เตรียมไว้สำหรับข้อมูลจริงในอนาคต */
export interface Decision {
  id: string;
  /** เลขฎีกา เช่น "1234/2565" */
  number: string;
  year: string;
  /** เลขมาตราที่เกี่ยวข้อง อ้างอิง Article["id"] */
  articleIds: string[];
  keywords: string[];
  summary: string;
  source: string;
}

export type BookmarkKind = 'article' | 'decision';