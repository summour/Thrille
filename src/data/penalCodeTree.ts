import type { LawNode } from '@/types/law';
import generated from './generated-penal-code/codeTree.json';

/**
 * ข้อมูลนี้สร้างโดย `npm run import:penal` — ห้ามแก้ด้วยมือ
 * แก้ที่ data-source/penal-code/ แล้วรัน `npm run import:penal`
 * ที่มาของข้อมูล: ดู data-source/penal-code/manifest.json
 */
export const penalCodeTree = generated as LawNode[];
