import type { Article } from '@/types/law';
import generated from './generated-labor-protection/articles.json';

/** สร้างโดย `npm run import:labor-protection` — ห้ามแก้ด้วยมือ */
export const laborProtectionArticles = generated as Record<string, Article>;
