import { articles as cccArticles } from '@/data/articles';
import { codeTree as cccCodeTree } from '@/data/codeTree';
import { constitutionArticles } from '@/data/constitutionArticles';
import { constitutionTree } from '@/data/constitutionTree';
import { cpcArticles } from '@/data/cpcArticles';
import { cpcTree } from '@/data/cpcTree';
import type { Article, LawCodeMeta, LawNode } from '@/types/law';

export interface LawPackage {
  meta: LawCodeMeta;
  tree: LawNode[];
  articles: Record<string, Article>;
}

/* -------------------------------------------------------------------------- */
/*                       1. ประมวลกฎหมายแพ่งและพาณิชย์ (ป.พ.พ.)                */
/* -------------------------------------------------------------------------- */
const cccMeta: LawCodeMeta = {
  id: 'ccc',
  code: 'ป.พ.พ.',
  title: 'ประมวลกฎหมายแพ่งและพาณิชย์',
  shortTitle: 'ป.พ.พ.',
  description: 'กฎหมายว่าด้วยบุคคล ทรัพย์ นิติกรรม หนี้ เอกเทศสัญญา ทรัพย์สิน ครอบครัว และมรดก',
  unitName: 'บรรพ',
  totalSections: 6,
  totalArticles: Object.keys(cccArticles).length || 1849,
};

/* -------------------------------------------------------------------------- */
/*             2. ประมวลกฎหมายวิธีพิจารณาความแพ่ง (ป.วิ.พ.)                   */
/* -------------------------------------------------------------------------- */
const cpcMeta: LawCodeMeta = {
  id: 'cpc',
  code: 'ป.วิ.พ.',
  title: 'ประมวลกฎหมายวิธีพิจารณาความแพ่ง',
  shortTitle: 'ป.วิ.พ.',
  description: 'กฎหมายว่าด้วยวิธีพิจารณาคดีแพ่ง ศาลชั้นต้น อุทธรณ์ ฎีกา และการบังคับคดี',
  unitName: 'ภาค',
  totalSections: 4,
  totalArticles: Object.keys(cpcArticles).length,
};

/* -------------------------------------------------------------------------- */
/*                       3. รัฐธรรมนูญแห่งราชอาณาจักรไทย (รธน.)                */
/* -------------------------------------------------------------------------- */
const constMeta: LawCodeMeta = {
  id: 'const',
  code: 'รธน.',
  title: 'รัฐธรรมนูญแห่งราชอาณาจักรไทย',
  shortTitle: 'รธน.',
  description: 'กฎหมายสูงสุดแห่งราชอาณาจักรไทย กำหนดโครงสร้างอำนาจอธิปไตย สิทธิเสรีภาพ และหน้าที่ของรัฐและประชาชน',
  unitName: 'หมวด',
  totalSections: 16,
  totalArticles: 279,
};

/* -------------------------------------------------------------------------- */
/*                       Law Packages Registry                                */
/* -------------------------------------------------------------------------- */
export const lawPackages: Record<string, LawPackage> = {
  const: {
    meta: constMeta,
    tree: constitutionTree,
    articles: constitutionArticles,
  },
  ccc: {
    meta: cccMeta,
    tree: cccCodeTree,
    articles: cccArticles,
  },
  cpc: {
    meta: cpcMeta,
    tree: cpcTree,
    articles: cpcArticles,
  },
};

export const defaultLawId = 'ccc';

export const allLawMetas: LawCodeMeta[] = [constMeta, cccMeta, cpcMeta];
