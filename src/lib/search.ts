import {
  getAllDecisions,
  getAllNodes,
  getArticle,
  getLawIdForArticle,
  getOrderedArticleIds,
} from '@/lib/lawIndex';
import { nodeLabel } from '@/lib/format';
import type { Decision, IndexedLawNode } from '@/types/law';

export type SearchScope = 'all' | 'article' | 'decision' | 'node';

export interface SearchArticleItem {
  id: string;
  lawId: string;
}

export interface SearchResults {
  articleIds: string[];
  articleItems: SearchArticleItem[];
  decisions: Decision[];
  nodes: IndexedLawNode[];
  total: number;
}

const EMPTY: SearchResults = {
  articleIds: [],
  articleItems: [],
  decisions: [],
  nodes: [],
  total: 0,
};

function includes(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

/**
 * ค้นหาแบบ local ทั้งหมด (ไม่มี network)
 * รองรับ: เลขมาตรา / คำสำคัญในตัวบท / ชื่อบรรพ-ภาค-ลักษณะ-หมวด-ส่วน / เลขฎีกา
 * สามารถระบุ lawId เพื่อจำกัดขอบเขต หรือค้นหาทุกกฎหมายได้
 */
export function searchAll(rawQuery: string, lawId?: string): SearchResults {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return EMPTY;

  const targetArticles = getOrderedArticleIds(lawId);

  const articleItems: SearchArticleItem[] = [];
  const articleIds: string[] = [];

  targetArticles.forEach((id) => {
    const article = getArticle(id, lawId);
    const matchesId = id.includes(query);
    const matchesText = article ? article.paragraphs.some((p) => includes(p, query)) : false;

    if (matchesId || matchesText) {
      const resolvedLawId = getLawIdForArticle(id, lawId);
      articleIds.push(id);
      articleItems.push({ id, lawId: resolvedLawId });
    }
  });

  const decisions = getAllDecisions().filter(
    (decision) =>
      includes(decision.number, query) ||
      includes(decision.year, query) ||
      decision.keywords.some((keyword) => includes(keyword, query)) ||
      includes(decision.summary, query),
  );

  const nodes = getAllNodes(lawId).filter(
    (node) => includes(node.title, query) || includes(nodeLabel(node), query),
  );

  return {
    articleIds,
    articleItems,
    decisions,
    nodes,
    total: articleIds.length + decisions.length + nodes.length,
  };
}
