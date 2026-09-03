import type { Article } from '@/types/law';
import generated from './generated-state-admin/articles.json';

/** สร้างโดย `npm run import:state-admin` — ห้ามแก้ด้วยมือ */
export const stateAdminArticles = generated as Record<string, Article>;
