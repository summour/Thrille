import type { Article } from '@/types/law';
import generated from './generated-crpc/articles.json';

/** สร้างโดย `npm run import:crpc` — ห้ามแก้ด้วยมือ */
export const crpcArticles = generated as Record<string, Article>;
