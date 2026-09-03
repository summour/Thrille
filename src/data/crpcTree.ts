import type { LawNode } from '@/types/law';
import generated from './generated-crpc/codeTree.json';

/**
 * ข้อมูลนี้สร้างโดย `npm run import:crpc` — ห้ามแก้ด้วยมือ
 * แก้ที่ data-source/crpc/ แล้วรัน `npm run import:crpc`
 * ที่มาของข้อมูล: ดู data-source/crpc/manifest.json
 */
export const crpcTree = generated as LawNode[];
