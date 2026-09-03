import type { LawLevel } from '../../src/types/law';
import type { Token } from './parse';

export interface BuiltArticle {
  id: string;
  sortKey: [number, number];
  paragraphs: string[];
  note?: string;
  sourceLine: number;
}

export interface BuiltNode {
  type: LawLevel;
  number: string;
  title: string;
  children: BuiltNode[];
  articleIds: string[];
}

const LEVEL_DEPTH: Record<LawLevel, number> = {
  คำปรารภ: 0,
  ข้อความเบื้องต้น: 0,
  บรรพ: 0,
  ภาค: 0,
  ลักษณะ: 1,
  หมวด: 2,
  ส่วน: 3,
};

export interface BuildResult {
  tree: BuiltNode[];
  articles: Map<string, BuiltArticle>;
  /** มาตราที่เจอก่อนมีหัวข้อใด ๆ */
  orphanArticleIds: string[];
}

/** ประกอบ token เป็นต้นไม้ + คลังมาตรา */
export function build(
  tokens: Token[],
  customLevelDepth?: Partial<Record<LawLevel, number>>,
): BuildResult {
  const tree: BuiltNode[] = [];
  const articles = new Map<string, BuiltArticle>();
  const orphanArticleIds: string[] = [];
  const levelDepth: Record<LawLevel, number> = {
    ...LEVEL_DEPTH,
    ...customLevelDepth,
  };

  /** stack[d] = โหนดที่เปิดอยู่ที่ความลึก d */
  const stack: (BuiltNode | null)[] = [null, null, null, null, null];
  let currentArticle: BuiltArticle | null = null;
  const addParagraph = (raw: string) => {
    if (!currentArticle) return;
    const text = raw.replace(/\s+/g, ' ').trim();
    if (text) currentArticle.paragraphs.push(text);
  };

  for (const token of tokens) {
    switch (token.kind) {
      case 'heading': {
        currentArticle = null;
        const depth = token.title === 'บทเฉพาะกาล' ? 0 : levelDepth[token.level];
        const node: BuiltNode = {
          type: token.level,
          number: token.number,
          title: token.title,
          children: [],
          articleIds: [],
        };

        // ถ้าเป็นคำปรารภ ให้สร้าง article ตัวแทนเพื่อเก็บเนื้อหาคำปรารภ
        if (token.level === 'คำปรารภ') {
          const article: BuiltArticle = {
            id: 'คำปรารภ',
            sortKey: [-1, 0],
            paragraphs: [],
            sourceLine: token.line,
          };
          articles.set('คำปรารภ', article);
          node.articleIds.push('คำปรารภ');
          currentArticle = article;
        }

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
        const article: BuiltArticle = {
          id: token.id,
          sortKey: token.sortKey,
          paragraphs: [],
          sourceLine: token.line,
        };
        articles.set(token.id, article);
        currentArticle = article;
        if (token.firstText) addParagraph(token.firstText);

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
        if (currentArticle) {
          currentArticle.note = currentArticle.note
            ? `${currentArticle.note} · ${token.text}`
            : token.text;
        }
        break;
      }

      case 'text': {
        if (currentArticle) addParagraph(token.text);
        break;
      }

      case 'break': {
        break;
      }
    }
  }

  return { tree, articles, orphanArticleIds };
}
