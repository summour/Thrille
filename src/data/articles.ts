import type { Article } from '@/types/law';
import generated from './generated/articles.json';

/** สร้างโดย `npm run import:law` — ห้ามแก้ด้วยมือ */
export const articles = generated as Record<string, Article>;
