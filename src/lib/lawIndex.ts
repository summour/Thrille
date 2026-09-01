import { articles } from '@/data/articles';
import { codeTree } from '@/data/codeTree';
import { decisions } from '@/data/decisions';
import { compareArticleIds } from '@/lib/format';
import type { Article, Decision, IndexedLawNode, LawNode } from '@/types/law';

/**
 * สร้าง index ในหน่วยความจำจาก mock data ตอนโหลดแอป
 * ไม่มี database และไม่มี network — ทั้งหมดเป็น pure in-memory
 *
 * เมื่อเปลี่ยนไปใช้ข้อมูลจริง (เช่น SQLite/IndexedDB) ให้แทนที่เฉพาะไฟล์นี้
 * โดยคง signature ของฟังก์ชันที่ export ไว้ เพื่อไม่ให้กระทบ UI
 */

const nodesById = new Map<string, IndexedLawNode>();
const rootNodeIds: string[] = [];
const nodeIdByArticleId = new Map<string, string>();

function indexNodes(nodes: LawNode[], parentId: string | null): string[] {
  return nodes.map((node, index) => {
    const id = parentId ? `${parentId}-${index + 1}` : `${index + 1}`;
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
    entry.articleIds.forEach((articleId) => nodeIdByArticleId.set(articleId, id));

    if (node.children?.length) {
      entry.childIds = indexNodes(node.children, id);
    }

    entry.totalArticles =
      entry.articleIds.length +
      entry.childIds.reduce((sum, childId) => sum + (nodesById.get(childId)?.totalArticles ?? 0), 0);

    return id;
  });
}

rootNodeIds.push(...indexNodes(codeTree, null));

/** เลขมาตราทั้งหมดที่ปรากฏในสารบัญ เรียงตามเลขมาตรา (ใช้กับปุ่ม ก่อนหน้า/ถัดไป) */
export const orderedArticleIds: string[] = Array.from(nodeIdByArticleId.keys()).sort(
  compareArticleIds,
);

const decisionsByArticleId = new Map<string, Decision[]>();
decisions.forEach((decision) => {
  decision.articleIds.forEach((articleId) => {
    const list = decisionsByArticleId.get(articleId) ?? [];
    list.push(decision);
    decisionsByArticleId.set(articleId, list);
  });
});

/* ------------------------------- Node access ------------------------------ */

export function getRootNodes(): IndexedLawNode[] {
  return rootNodeIds.map((id) => nodesById.get(id)!);
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

export function getAllNodes(): IndexedLawNode[] {
  return Array.from(nodesById.values());
}

/* ------------------------------ Article access ---------------------------- */

export function getArticle(articleId: string | undefined): Article | undefined {
  return articleId ? articles[articleId] : undefined;
}

export function getArticleNode(articleId: string): IndexedLawNode | undefined {
  return getNode(nodeIdByArticleId.get(articleId));
}

export function getArticlePreview(articleId: string): string {
  return getArticle(articleId)?.paragraphs[0] ?? '';
}

export function getAdjacentArticleIds(articleId: string): {
  previous?: string;
  next?: string;
} {
  const index = orderedArticleIds.indexOf(articleId);
  if (index === -1) return {};
  return {
    previous: orderedArticleIds[index - 1],
    next: orderedArticleIds[index + 1],
  };
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
  bookCount: rootNodeIds.length,
  articleCount: orderedArticleIds.length,
  decisionCount: decisions.length,
};