import type { BuildResult, BuiltNode } from './build';

export interface ImportIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
}

export interface ImportReport {
  generatedAt: string;
  bookCount: number;
  nodeCount: number;
  articleCount: number;
  issues: ImportIssue[];
  ok: boolean;
}

export function validate(result: BuildResult): ImportReport {
  const issues: ImportIssue[] = [];
  const { tree, articles, orphanArticleIds } = result;

  // 1) มาตราที่ไม่อยู่ใต้หัวข้อใดเลย
  orphanArticleIds.forEach((id) =>
    issues.push({
      level: 'error',
      code: 'ORPHAN_ARTICLE',
      message: `มาตรา ${id} ไม่อยู่ใต้หัวข้อใด — ตรวจว่าหัวข้อ "บรรพ/ลักษณะ" หายไปหรือไม่`,
    }),
  );

  // 2) มาตราที่ไม่มีเนื้อหา
  articles.forEach((article, id) => {
    if (article.paragraphs.length === 0) {
      issues.push({
        level: 'error',
        code: 'EMPTY_ARTICLE',
        message: `มาตรา ${id} (บรรทัด ${article.sourceLine}) ไม่มีข้อความ`,
      });
    }
  });

  // 3) โหนดที่ไม่มีทั้งลูกและมาตรา
  const nodes: BuiltNode[] = [];
  const walk = (list: BuiltNode[]) =>
    list.forEach((node) => {
      nodes.push(node);
      walk(node.children);
    });
  walk(tree);

  nodes.forEach((node) => {
    if (node.children.length === 0 && node.articleIds.length === 0) {
      issues.push({
        level: 'warning',
        code: 'EMPTY_NODE',
        message: `${node.type} ${node.number} ${node.title} ว่างเปล่า`,
      });
    }
    if (!node.title) {
      issues.push({
        level: 'warning',
        code: 'MISSING_TITLE',
        message: `${node.type} ${node.number} ไม่มีชื่อหัวข้อ`,
      });
    }
  });

  // 4) เลขมาตราขาดช่วง (เตือนเฉยๆ — กฎหมายมีมาตราที่ถูกยกเลิกจริง)
  const mains = [...articles.values()].map((a) => a.sortKey[0]).sort((a, b) => a - b);
  for (let i = 1; i < mains.length; i += 1) {
    const gap = mains[i] - mains[i - 1];
    if (gap > 1) {
      issues.push({
        level: 'warning',
        code: 'NUMBER_GAP',
        message: `เลขมาตราขาดช่วง ${mains[i - 1]} → ${mains[i]} (ขาด ${gap - 1} มาตรา)`,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    bookCount: tree.length,
    nodeCount: nodes.length,
    articleCount: articles.size,
    issues,
    ok: issues.every((issue) => issue.level !== 'error'),
  };
}
