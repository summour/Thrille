import type { Token } from './parse';

export interface BuiltArticle {
  id: string;
  sortKey: [number, number];
  paragraphs: string[];
  note?: string;
  sourceLine: number;
}

export interface BuiltNode {
  type: 'บรรพ' | 'ลักษณะ' | 'หมวด' | 'ส่วน';
  number: string;
  title: string;
  children: BuiltNode[];
  articleIds: string[];
}

const LEVEL_DEPTH = { บรรพ: 0, ลักษณะ: 1, หมวด: 2, ส่วน: 3 } as const;

export interface BuildOptions {
  /** 'space' = ต่อบรรทัดด้วยช่องว่าง (ค่าเริ่มต้น), 'none' = ต่อชิดกัน */
  joinMode: 'space' | 'none';
}

export interface BuildResult {
  tree: BuiltNode[];
  articles: Map<string, BuiltArticle>;
  /** มาตราที่เจอก่อนมีหัวข้อใด ๆ */
  orphanArticleIds: string[];
}

/** ประกอบ token เป็นต้นไม้ + คลังมาตรา */
export function build(tokens: Token[], options: BuildOptions): BuildResult {
  const tree: BuiltNode[] = [];
  const articles = new Map<string, BuiltArticle>();
  const orphanArticleIds: string[] = [];

  /** stack[d] = โหนดที่เปิดอยู่ที่ความลึก d */
  const stack: (BuiltNode | null)[] = [null, null, null, null];
  let currentArticle: BuiltArticle | null = null;
  let buffer: string[] = [];

  const flushParagraph = () => {
    if (!currentArticle || buffer.length === 0) return;
    const joined = buffer.join(options.joinMode === 'space' ? ' ' : '');
    const text = joined.replace(/\s+/g, ' ').trim();
    if (text) currentArticle.paragraphs.push(text);
    buffer = [];
  };

  const closeArticle = () => {
    flushParagraph();
    currentArticle = null;
  };

  for (const token of tokens) {
    switch (token.kind) {
      case 'heading': {
        closeArticle();
        const depth = LEVEL_DEPTH[token.level];
        const node: BuiltNode = {
          type: token.level,
          number: token.number,
          title: token.title,
          children: [],
          articleIds: [],
        };

        // หาโหนดแม่ที่ใกล้ที่สุดที่ตื้นกว่า — รองรับการข้ามระดับ
        let parent: BuiltNode | null = null;
        for (let d = depth - 1; d >= 0; d -= 1) {
          if (stack[d]) {
            parent = stack[d];
            break;
          }
        }

        if (parent) parent.children.push(node);
        else tree.push(node);

        stack[depth] = node;
        for (let d = depth + 1; d < stack.length; d += 1) stack[d] = null;
        break;
      }

      case 'article': {
        closeArticle();

        const article: BuiltArticle = {
          id: token.id,
          sortKey: token.sortKey,
          paragraphs: [],
          sourceLine: token.line,
        };
        articles.set(token.id, article);
        currentArticle = article;
        if (token.firstText) buffer.push(token.firstText);

        // ผูกกับโหนดที่ลึกที่สุดที่เปิดอยู่
        let owner: BuiltNode | null = null;
        for (let d = stack.length - 1; d >= 0; d -= 1) {
          if (stack[d]) {
            owner = stack[d];
            break;
          }
        }
        if (owner) owner.articleIds.push(token.id);
        else orphanArticleIds.push(token.id);
        break;
      }

      case 'note': {
        flushParagraph();
        if (currentArticle) {
          currentArticle.note = currentArticle.note
            ? `${currentArticle.note} · ${token.text}`
            : token.text;
        }
        break;
      }

      case 'text': {
        if (currentArticle) buffer.push(token.text);
        break;
      }

      case 'break': {
        flushParagraph();
        break;
      }
    }
  }

  closeArticle();
  return { tree, articles, orphanArticleIds };
}
