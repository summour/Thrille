import {
  getAllDecisions,
  getAllNodes,
  getArticle,
  orderedArticleIds,
} from '@/lib/lawIndex';
import { nodeLabel } from '@/lib/format';
import type { Decision, IndexedLawNode } from '@/types/law';

export type SearchScope = 'all' | 'article' | 'decision' | 'node';

export interface SearchResults {
  articleIds: string[];
  decisions: Decision[];
  nodes: IndexedLawNode[];
  total: number;
}

const EMPTY: SearchResults = { articleIds: [], decisions: [], nodes: [], total: 0 };

function includes(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

/**
 * ค้นหาแบบ local ทั้งหมด (ไม่มี network)
 * รองรับ: เลขมาตรา / คำสำคัญในตัวบท / ชื่อบรรพ-ลักษณะ-หมวด-ส่วน / เลขฎีกา
 */
export function searchAll(rawQuery: string): SearchResults {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return EMPTY;

  const articleIds = orderedArticleIds.filter((id) => {
    if (id.includes(query)) return true;
    const article = getArticle(id);
    return article ? article.paragraphs.some((p) => includes(p, query)) : false;
  });

  const decisions = getAllDecisions().filter(
    (decision) =>
      includes(decision.number, query) ||
      includes(decision.year, query) ||
      decision.keywords.some((keyword) => includes(keyword, query)) ||
      includes(decision.summary, query),
  );

  const nodes = getAllNodes().filter(
    (node) => includes(node.title, query) || includes(nodeLabel(node), query),
  );

  return {
    articleIds,
    decisions,
    nodes,
    total: articleIds.length + decisions.length + nodes.length,
  };
}