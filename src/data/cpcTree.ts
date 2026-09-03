import type { LawNode } from '@/types/law';
import generated from './generated-cpc/codeTree.json';

/**
 * ข้อมูลนี้สร้างโดย `npm run import:cpc` — ห้ามแก้ด้วยมือ
 * แก้ที่ data-source/cpc/ แล้วรัน `npm run import:cpc`
 * ที่มาของข้อมูล: ดู data-source/cpc/manifest.json
 */
export const cpcTree = generated as LawNode[];
