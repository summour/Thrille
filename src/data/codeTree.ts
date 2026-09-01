import type { LawNode } from '@/types/law';
import generated from './generated/codeTree.json';

/**
 * ข้อมูลนี้สร้างโดย `npm run import:law` — ห้ามแก้ด้วยมือ
 * แก้ที่ data-source/raw/ แล้วรัน import ใหม่
 * ที่มาของข้อมูล: ดู data-source/manifest.json
 */
export const codeTree = generated as LawNode[];
