import {
  getAllDecisions,
  getAllLaws,
  getAllNodes,
  getArticle,
  getOrderedArticleIds,
} from '@/lib/lawIndex';
import { compareArticleIds, nodeLabel } from '@/lib/format';
import type { Decision, IndexedLawNode, LawCodeMeta } from '@/types/law';

export type SearchScope = 'all' | 'law' | 'article' | 'decision' | 'node';

export interface SearchArticleItem {
  id: string;
  lawId: string;
}

export interface SearchResults {
  laws: LawCodeMeta[];
  articleIds: string[];
  articleItems: SearchArticleItem[];
  decisions: Decision[];
  nodes: IndexedLawNode[];
  total: number;
}

const EMPTY: SearchResults = {
  laws: [],
  articleIds: [],
  articleItems: [],
  decisions: [],
  nodes: [],
  total: 0,
};

function normalizeText(text: string): string {
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let res = text.toLowerCase().replace(/อัฎฐ/g, 'อัฏฐ');
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(thaiDigits[i], 'g'), String(i));
  }
  return res;
}

function stripPunctuation(text: string): string {
  return text.replace(/[.\s\-–—/()]/g, '');
}

function matchText(haystack: string, needle: string, needleClean: string): boolean {
  if (!needle) return false;
  const hLower = haystack.toLowerCase();
  if (hLower.includes(needle)) return true;

  const hNorm = normalizeText(haystack);
  const nNorm = normalizeText(needle);
  if (hNorm.includes(nNorm)) return true;

  if (needleClean.length >= 2) {
    const hClean = stripPunctuation(hNorm);
    if (hClean.includes(needleClean)) return true;
  }
  return false;
}

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
 * รองรับ: ชื่อกฎหมาย / เลขมาตรา / คำสำคัญในตัวบท / ชื่อบรรพ-ภาค-ลักษณะ-หมวด-ส่วน / เลขฎีกา
 * สามารถระบุ lawId เพื่อจำกัดขอบเขต หรือค้นหาทุกกฎหมายได้
 */
export function searchAll(rawQuery: string, lawId?: string): SearchResults {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return EMPTY;

  const normalizedQuery = query.replace(/อัฎฐ/g, 'อัฏฐ');
  const queryClean = stripPunctuation(normalizeText(query));
  const allLaws = getAllLaws();

  // ค้นหาชื่อกฎหมาย (ฉบับกฎหมาย / ชื่อย่อ / รหัส / คำอธิบาย)
  const matchedLaws: { law: LawCodeMeta; score: number }[] = [];
  for (const law of allLaws) {
    if (lawId && law.id !== lawId) continue;

    let score = 0;
    if (
      matchText(law.code, query, queryClean) ||
      matchText(law.shortTitle, query, queryClean)
    ) {
      score = 3;
    } else if (matchText(law.title, query, queryClean)) {
      score = 2;
    } else if (matchText(law.description, query, queryClean)) {
      score = 1;
    }

    if (score > 0) {
      matchedLaws.push({ law, score });
    }
  }
  matchedLaws.sort((a, b) => b.score - a.score);
  const matchedLawItems = matchedLaws.map((m) => m.law);

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

  const lawOrderMap = new Map(allLaws.map((l, index) => [l.id, index]));

  // เรียงลำดับ: คะแนนความเกี่ยวข้องสูงกว่ามาก่อน -> ลำดับเลขมาตรา -> ลำดับฉบับกฎหมาย
  matchedArticles.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const cmp = compareArticleIds(a.item.id, b.item.id);
    if (cmp !== 0) return cmp;
    const orderA = lawOrderMap.get(a.item.lawId) ?? 999;
    const orderB = lawOrderMap.get(b.item.lawId) ?? 999;
    return orderA - orderB;
  });

  const articleItems = matchedArticles.map((m) => m.item);
  const articleIds = articleItems.map((m) => m.id);

  const decisions = getAllDecisions().filter((decision) => {
    if (lawId && lawId !== 'ccc') return false;
    return (
      includes(decision.number, query) ||
      includes(decision.year, query) ||
      decision.keywords.some((keyword) => includes(keyword, query)) ||
      includes(decision.summary, query)
    );
  });

  const nodes = getAllNodes(lawId).filter(
    (node) => includes(node.title, query) || includes(nodeLabel(node), query),
  );

  return {
    laws: matchedLawItems,
    articleIds,
    articleItems,
    decisions,
    nodes,
    total: matchedLawItems.length + articleIds.length + decisions.length + nodes.length,
  };
}
