import { adminProcArticles } from '@/data/adminProcArticles';
import { adminProcTree } from '@/data/adminProcTree';
import { articles as cccArticles } from '@/data/articles';
import { codeTree as cccCodeTree } from '@/data/codeTree';
import { constitutionArticles } from '@/data/constitutionArticles';
import { constitutionTree } from '@/data/constitutionTree';
import { cpcArticles } from '@/data/cpcArticles';
import { cpcTree } from '@/data/cpcTree';
import { nhrcArticles } from '@/data/nhrcArticles';
import { nhrcTree } from '@/data/nhrcTree';
import { officialInfoArticles } from '@/data/officialInfoArticles';
import { officialInfoTree } from '@/data/officialInfoTree';
import { penalActArticles } from '@/data/penalActArticles';
import { penalActTree } from '@/data/penalActTree';
import { penalCodeArticles } from '@/data/penalCodeArticles';
import { penalCodeTree } from '@/data/penalCodeTree';
import { tortLiabilityArticles } from '@/data/tortLiabilityArticles';
import { tortLiabilityTree } from '@/data/tortLiabilityTree';
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
/*       4. พระราชบัญญัติวิธีปฏิบัติราชการทางปกครอง (วิ.ปกครอง)                */
/* -------------------------------------------------------------------------- */
const adminProcMeta: LawCodeMeta = {
  id: 'admin-proc',
  code: 'วิ.ปกครอง',
  title: 'พระราชบัญญัติวิธีปฏิบัติราชการทางปกครอง พ.ศ. ๒๕๓๙',
  shortTitle: 'พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง',
  description: 'กฎหมายว่าด้วยหลักเกณฑ์ ขั้นตอนการทำคำสั่งทางปกครอง การอุทธรณ์ การเพิกถอน และการบังคับทางปกครอง',
  unitName: 'หมวด',
  totalSections: 8,
  totalArticles: Object.keys(adminProcArticles).length,
};

/* -------------------------------------------------------------------------- */
/*       5. พระราชบัญญัติข้อมูลข่าวสารของราชการ (ข้อมูลข่าวสาร)               */
/* -------------------------------------------------------------------------- */
const officialInfoMeta: LawCodeMeta = {
  id: 'official-info',
  code: 'ข้อมูลข่าวสาร',
  title: 'พระราชบัญญัติข้อมูลข่าวสารของราชการ พ.ศ. ๒๕๔๐',
  shortTitle: 'พ.ร.บ.ข้อมูลข่าวสารของราชการ',
  description: 'กฎหมายว่าด้วยสิทธิการรับรู้ข้อมูลข่าวสารของประชาชน การเปิดเผย ข้อมูลข่าวสารที่ไม่ต้องเปิดเผย และข้อมูลข่าวสารส่วนบุคคล',
  unitName: 'หมวด',
  totalSections: 8,
  totalArticles: Object.keys(officialInfoArticles).length,
};

/* -------------------------------------------------------------------------- */
/*       6. พระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วย กสม. (พ.ร.ป.กสม.)            */
/* -------------------------------------------------------------------------- */
const nhrcMeta: LawCodeMeta = {
  id: 'nhrc',
  code: 'พ.ร.ป.กสม.',
  title: 'พระราชบัญญัติประกอบรัฐธรรมนูญว่าด้วยคณะกรรมการสิทธิมนุษยชนแห่งชาติ พ.ศ. ๒๕๖๐',
  shortTitle: 'พ.ร.ป.ว่าด้วยคณะกรรมการสิทธิมนุษยชนแห่งชาติ',
  description: 'กฎหมายประกอบรัฐธรรมนูญว่าด้วยคณะกรรมการสิทธิมนุษยชนแห่งชาติ คุณสมบัติ ที่มา หน้าที่และอำนาจ การตรวจสอบการละเมิดสิทธิมนุษยชน',
  unitName: 'หมวด',
  totalSections: 5,
  totalArticles: Object.keys(nhrcArticles).length,
};

/* -------------------------------------------------------------------------- */
/*       7. พระราชบัญญัติความรับผิดทางละเมิดของเจ้าหน้าที่ (ละเมิด จนท.)         */
/* -------------------------------------------------------------------------- */
const tortLiabilityMeta: LawCodeMeta = {
  id: 'tort-liability',
  code: 'ละเมิด จนท.',
  title: 'พระราชบัญญัติความรับผิดทางละเมิดของเจ้าหน้าที่ พ.ศ. ๒๕๓๙',
  shortTitle: 'พ.ร.บ.ความรับผิดทางละเมิดของเจ้าหน้าที่',
  description: 'กฎหมายว่าด้วยความรับผิดทางละเมิดของเจ้าหน้าที่และหน่วยงานของรัฐ การฟ้องร้อง สิทธิไล่เบี้ย และอายุความ',
  unitName: 'มาตรา',
  totalSections: 1,
  totalArticles: Object.keys(tortLiabilityArticles).length,
};

/* -------------------------------------------------------------------------- */
/*                       8. ประมวลกฎหมายอาญา (ป.อ.)                           */
/* -------------------------------------------------------------------------- */
const penalCodeMeta: LawCodeMeta = {
  id: 'penal-code',
  code: 'ป.อ.',
  title: 'ประมวลกฎหมายอาญา',
  shortTitle: 'ป.อ.',
  description: 'กฎหมายว่าด้วยความผิดทางอาญา บทบัญญัติทั่วไป โทษ ความรับผิด ความมั่นคง ชีวิต ร่างกาย เสรีภาพ ทรัพย์ และลหุโทษ',
  unitName: 'ภาค',
  totalSections: 3,
  totalArticles: Object.keys(penalCodeArticles).length,
};

/* -------------------------------------------------------------------------- */
/*       9. พระราชบัญญัติให้ใช้ประมวลกฎหมายอาญา (พ.ร.บ.ให้ใช้ ป.อ.)            */
/* -------------------------------------------------------------------------- */
const penalActMeta: LawCodeMeta = {
  id: 'penal-act',
  code: 'พ.ร.บ.ให้ใช้ ป.อ.',
  title: 'พระราชบัญญัติให้ใช้ประมวลกฎหมายอาญา พ.ศ. ๒๔๙๙',
  shortTitle: 'พ.ร.บ.ให้ใช้ประมวลกฎหมายอาญา',
  description: 'พระราชบัญญัติให้ใช้ประมวลกฎหมายอาญา พ.ศ. ๒๔๙๙ กำหนดวันใช้บังคับ การยกเลิกกฎหมายลักษณะอาญา และบทเฉพาะกาล',
  unitName: 'มาตรา',
  totalSections: 1,
  totalArticles: Object.keys(penalActArticles).length,
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
  'penal-code': {
    meta: penalCodeMeta,
    tree: penalCodeTree,
    articles: penalCodeArticles,
  },
  cpc: {
    meta: cpcMeta,
    tree: cpcTree,
    articles: cpcArticles,
  },
  'penal-act': {
    meta: penalActMeta,
    tree: penalActTree,
    articles: penalActArticles,
  },
  'admin-proc': {
    meta: adminProcMeta,
    tree: adminProcTree,
    articles: adminProcArticles,
  },
  'official-info': {
    meta: officialInfoMeta,
    tree: officialInfoTree,
    articles: officialInfoArticles,
  },
  nhrc: {
    meta: nhrcMeta,
    tree: nhrcTree,
    articles: nhrcArticles,
  },
  'tort-liability': {
    meta: tortLiabilityMeta,
    tree: tortLiabilityTree,
    articles: tortLiabilityArticles,
  },
};

export const defaultLawId = 'ccc';

export const allLawMetas: LawCodeMeta[] = [
  constMeta,
  cccMeta,
  penalCodeMeta,
  cpcMeta,
  penalActMeta,
  adminProcMeta,
  officialInfoMeta,
  nhrcMeta,
  tortLiabilityMeta,
];
