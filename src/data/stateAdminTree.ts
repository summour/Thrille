import type { LawNode } from '@/types/law';
import generated from './generated-state-admin/codeTree.json';

/**
 * ข้อมูลนี้สร้างโดย `npm run import:state-admin` — ห้ามแก้ด้วยมือ
 * แก้ที่ data-source/state-admin/ แล้วรัน `npm run import:state-admin`
 * ที่มาของข้อมูล: ดู data-source/state-admin/manifest.json
 */
export const stateAdminTree = generated as LawNode[];
