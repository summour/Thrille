import type { Article } from '@/types/law';
import generated from './generated-cpc/articles.json';

/** สร้างโดย `npm run import:cpc` — ห้ามแก้ด้วยมือ */
export const cpcArticles = generated as Record<string, Article>;
