import type { LawNode } from '@/types/law';
import generated from './generated-labor-protection/codeTree.json';

/**
 * ข้อมูลนี้สร้างโดย `npm run import:labor-protection` — ห้ามแก้ด้วยมือ
 * แก้ที่ data-source/labor-protection/ แล้วรัน `npm run import:labor-protection`
 * ที่มาของข้อมูล: ดู data-source/labor-protection/manifest.json
 */
export const laborProtectionTree = generated as LawNode[];
