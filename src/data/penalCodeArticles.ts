import type { Article } from '@/types/law';
import generated from './generated-penal-code/articles.json';

/** สร้างโดย `npm run import:penal` — ห้ามแก้ด้วยมือ */
export const penalCodeArticles = generated as Record<string, Article>;
