import type { LawNode } from '@/types/law';
import generated from './generated-civil-service/codeTree.json';

/**
 * ข้อมูลนี้สร้างโดย `npm run import:civil-service` — ห้ามแก้ด้วยมือ
 * แก้ที่ data-source/civil-service/ แล้วรัน `npm run import:civil-service`
 * ที่มาของข้อมูล: ดู data-source/civil-service/manifest.json
 */
export const civilServiceTree = generated as LawNode[];
