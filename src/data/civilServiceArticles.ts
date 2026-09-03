import type { Article } from '@/types/law';
import generated from './generated-civil-service/articles.json';

/** สร้างโดย `npm run import:civil-service` — ห้ามแก้ด้วยมือ */
export const civilServiceArticles = generated as Record<string, Article>;
