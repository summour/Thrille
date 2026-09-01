import { decisions } from '@/data/decisions';
import { allLawMetas, defaultLawId, lawPackages } from '@/data/laws';
import { compareArticleIds } from '@/lib/format';
import type { Article, Decision, IndexedLawNode, LawCodeMeta, LawNode } from '@/types/law';

export { defaultLawId };

/**
 * In-memory index รองรับทั้งประมวลกฎหมายแพ่งและพาณิชย์ และกฎหมายฉบับอื่น ๆ (เช่น ป.อ., ป.วิ.พ., ป.วิ.อ.)
 * Pure in-memory / offline-first ตามกฎ AGENTS.md
 */

const nodesById = new Map<string, IndexedLawNode>();
const rootNodeIdsByLaw = new Map<string, string[]>();
const nodeIdByArticleIdByLaw = new Map<string, Map<string, string>>();
const orderedArticleIdsByLaw = new Map<string, string[]>();
const lawIdByNodeId = new Map<string, string>();

function indexNodes(
  nodes: LawNode[],
  parentId: string | null,
  lawId: string,
): string[] {
  const articleMap = nodeIdByArticleIdByLaw.get(lawId)!;

  return nodes.map((node, index) => {
    // สำหรับ ccc ใช้ id แบบเดิม "1", "1-1" เพื่อ backward compatibility
    // สำหรับกฎหมายอื่น ใช้ "${lawId}-${index + 1}"
    const prefix = parentId ? parentId : lawId === 'ccc' ? '' : `${lawId}`;
    const id = prefix ? `${prefix}-${index + 1}` : `${index + 1}`;

    const entry: IndexedLawNode = {
      id,
      parentId,
      type: node.type,
      number: node.number,
      title: node.title,
      childIds: [],
      articleIds: [...(node.articleIds ?? [])].sort(compareArticleIds),
      totalArticles: 0,
    };

    nodesById.set(id, entry);
    lawIdByNodeId.set(id, lawId);
    entry.articleIds.forEach((articleId) => articleMap.set(articleId, id));

    if (node.children?.length) {
      entry.childIds = indexNodes(node.children, id, lawId);
    }

    entry.totalArticles =
      entry.articleIds.length +
      entry.childIds.reduce(
        (sum, childId) => sum + (nodesById.get(childId)?.totalArticles ?? 0),
        0,
      );

    return id;
  });
}

// Index all registered law packages
Object.keys(lawPackages).forEach((lawId) => {
  const pkg = lawPackages[lawId];
  nodeIdByArticleIdByLaw.set(lawId, new Map<string, string>());
  const roots = indexNodes(pkg.tree, null, lawId);
  rootNodeIdsByLaw.set(lawId, roots);

  const articleMap = nodeIdByArticleIdByLaw.get(lawId)!;
  const ordered = Array.from(articleMap.keys()).sort(compareArticleIds);
  orderedArticleIdsByLaw.set(lawId, ordered);
});

/** เลขมาตราทั้งหมดของ ป.พ.พ. (default) เพื่อ backward compatibility */
export const orderedArticleIds: string[] =
  orderedArticleIdsByLaw.get(defaultLawId) ?? [];

const decisionsByArticleId = new Map<string, Decision[]>();
decisions.forEach((decision) => {
  decision.articleIds.forEach((articleId) => {
    const list = decisionsByArticleId.get(articleId) ?? [];
    list.push(decision);
    decisionsByArticleId.set(articleId, list);
  });
});

/* ------------------------------- Law access ------------------------------- */

export function getAllLaws(): LawCodeMeta[] {
  return allLawMetas;
}

export function getLawMeta(lawId?: string): LawCodeMeta {
  const targetId = lawId && lawPackages[lawId] ? lawId : defaultLawId;
  return lawPackages[targetId]?.meta ?? allLawMetas[0];
}

export function getLawIdForNode(nodeId: string | undefined): string {
  if (!nodeId) return defaultLawId;
  return lawIdByNodeId.get(nodeId) ?? defaultLawId;
}

export function getLawIdForArticle(articleId: string | undefined, hintLawId?: string): string {
  if (!articleId) return defaultLawId;
  if (hintLawId && lawPackages[hintLawId]?.articles[articleId]) {
    return hintLawId;
  }
  // Check default first
  if (lawPackages[defaultLawId]?.articles[articleId]) {
    return defaultLawId;
  }
  // Check other laws
  for (const lawId of Object.keys(lawPackages)) {
    if (lawPackages[lawId].articles[articleId]) {
      return lawId;
    }
  }
  return hintLawId || defaultLawId;
}

/* ------------------------------- Node access ------------------------------ */

export function getRootNodes(lawId?: string): IndexedLawNode[] {
  const targetLawId = lawId && rootNodeIdsByLaw.has(lawId) ? lawId : defaultLawId;
  const ids = rootNodeIdsByLaw.get(targetLawId) ?? [];
  return ids.map((id) => nodesById.get(id)!);
}

export function getNode(nodeId: string | undefined): IndexedLawNode | undefined {
  return nodeId ? nodesById.get(nodeId) : undefined;
}

export function getChildNodes(nodeId: string): IndexedLawNode[] {
  return (nodesById.get(nodeId)?.childIds ?? []).map((id) => nodesById.get(id)!);
}

/** เส้นทางจากรากถึงโหนดนี้ (ใช้ทำ breadcrumb) */
export function getNodePath(nodeId: string | undefined): IndexedLawNode[] {
  const path: IndexedLawNode[] = [];
  let current = getNode(nodeId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? nodesById.get(current.parentId) : undefined;
  }
  return path;
}

export function getAllNodes(lawId?: string): IndexedLawNode[] {
  if (lawId) {
    return Array.from(nodesById.values()).filter(
      (node) => lawIdByNodeId.get(node.id) === lawId,
    );
  }
  return Array.from(nodesById.values());
}

/* ------------------------------ Article access ---------------------------- */

export function getArticle(articleId: string | undefined, lawId?: string): Article | undefined {
  if (!articleId) return undefined;
  const targetLawId = getLawIdForArticle(articleId, lawId);
  return lawPackages[targetLawId]?.articles[articleId];
}

export function getArticleNode(articleId: string, lawId?: string): IndexedLawNode | undefined {
  const targetLawId = getLawIdForArticle(articleId, lawId);
  const articleMap = nodeIdByArticleIdByLaw.get(targetLawId);
  const nodeId = articleMap?.get(articleId);
  return getNode(nodeId);
}

export function getArticlePreview(articleId: string, lawId?: string): string {
  return getArticle(articleId, lawId)?.paragraphs[0] ?? '';
}

export function getAdjacentArticleIds(
  articleId: string,
  lawId?: string,
): {
  previous?: string;
  next?: string;
} {
  const targetLawId = getLawIdForArticle(articleId, lawId);
  const list = orderedArticleIdsByLaw.get(targetLawId) ?? [];
  const index = list.indexOf(articleId);
  if (index === -1) return {};
  return {
    previous: list[index - 1],
    next: list[index + 1],
  };
}

export function getOrderedArticleIds(lawId?: string): string[] {
  const targetLawId = lawId && orderedArticleIdsByLaw.has(lawId) ? lawId : defaultLawId;
  return orderedArticleIdsByLaw.get(targetLawId) ?? [];
}

/* ----------------------------- Decision access ---------------------------- */

export function getDecision(decisionId: string | undefined): Decision | undefined {
  return decisions.find((decision) => decision.id === decisionId);
}

export function getDecisionsForArticle(articleId: string): Decision[] {
  return decisionsByArticleId.get(articleId) ?? [];
}

export function getAllDecisions(): Decision[] {
  return decisions;
}

/** สถิติสั้น ๆ สำหรับหน้าแรก */
export const libraryStats = {
  bookCount: (rootNodeIdsByLaw.get(defaultLawId) ?? []).filter(
    (id) => nodesById.get(id)?.type === 'บรรพ' || nodesById.get(id)?.type === 'ภาค',
  ).length,
  articleCount: orderedArticleIds.length,
  decisionCount: decisions.length,
  totalLawsCount: allLawMetas.length,
};
