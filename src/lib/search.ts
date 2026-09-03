import {
  getAllDecisions,
  getAllLaws,
  getAllNodes,
  getArticle,
  getOrderedArticleIds,
} from '@/lib/lawIndex';
import { compareArticleIds, nodeLabel } from '@/lib/format';
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

interface SearchableArticle {
  id: string;
  lawId: string;
  idLower: string;
  fullTextLower: string;
}

// In-memory cache of searchable articles across all laws
let cachedArticles: SearchableArticle[] | null = null;

function getCachedArticles(): SearchableArticle[] {
  if (cachedArticles) return cachedArticles;

  const result: SearchableArticle[] = [];
  const laws = getAllLaws();

  for (const law of laws) {
    const ids = getOrderedArticleIds(law.id);
    for (const id of ids) {
      const art = getArticle(id, law.id);
      const paragraphs = art?.paragraphs || [];
      const parasLower = paragraphs.map((p) => p.toLowerCase());
      result.push({
        id,
        lawId: law.id,
        idLower: id.toLowerCase(),
        fullTextLower: parasLower.join(' '),
      });
    }
  }

  cachedArticles = result;
  return result;
}

/**
 * ค้นหาแบบ local ทั้งหมด (ไม่มี network)
 * รองรับ: เลขมาตรา / คำสำคัญในตัวบท / ชื่อบรรพ-ภาค-ลักษณะ-หมวด-ส่วน / เลขฎีกา
 * สามารถระบุ lawId เพื่อจำกัดขอบเขต หรือค้นหาทุกกฎหมายได้
 */
export function searchAll(rawQuery: string, lawId?: string): SearchResults {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return EMPTY;

  const normalizedQuery = query.replace(/อัฎฐ/g, 'อัฏฐ');
  const allArticles = getCachedArticles();
  const matchedArticles: { item: SearchArticleItem; score: number }[] = [];

  for (let i = 0; i < allArticles.length; i++) {
    const art = allArticles[i];
    if (lawId && art.lawId !== lawId) continue;

    const idNormalized = art.idLower.replace(/อัฎฐ/g, 'อัฏฐ');
    let score = 0;
    if (art.idLower === query || idNormalized === normalizedQuery) {
      score = 4; // ตรงกับเลขมาตราเป๊ะ
    } else if (art.idLower.startsWith(query) || idNormalized.startsWith(normalizedQuery)) {
      score = 3; // ขึ้นต้นด้วยเลขมาตรา เช่น "15" -> "150"
    } else if (art.idLower.includes(query) || idNormalized.includes(normalizedQuery)) {
      score = 2; // เลขมาตรารองรับ query
    } else if (art.fullTextLower.includes(query) || art.fullTextLower.includes(normalizedQuery)) {
      score = 1; // พบในเนื้อหาตัวบท
    }

    if (score > 0) {
      matchedArticles.push({
        item: { id: art.id, lawId: art.lawId },
        score,
      });
    }
  }

  // เรียงลำดับ: คะแนนความเกี่ยวข้องสูงกว่ามาก่อน -> ถ้าเท่ากันให้ ป.พ.พ. (default) มาก่อน -> ตามลำดับมาตรา
  matchedArticles.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.item.lawId !== b.item.lawId) {
      if (a.item.lawId === 'ccc') return -1;
      if (b.item.lawId === 'ccc') return 1;
    }
    return compareArticleIds(a.item.id, b.item.id);
  });

  const articleItems = matchedArticles.map((m) => m.item);
  const articleIds = articleItems.map((m) => m.id);

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
