/**
 * นำเข้าตัวบทกฎหมายจากไฟล์ข้อความดิบใน data-source/raw/
 * → เขียนผลลัพธ์ไปที่ src/data/generated/
 *
 * ทำงานแบบ offline ล้วน ไม่มีการเรียก network ใด ๆ
 *
 *   npm run import:law              นำเข้าและเขียนไฟล์
 *   npm run import:law -- --check   ตรวจอย่างเดียว ไม่เขียนไฟล์ (ใช้ใน CI)
 *   npm run import:law -- --join=none
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanLines } from './lib/clean';
import { tokenize } from './lib/parse';
import { build, type BuiltArticle, type BuiltNode } from './lib/build';
import { validate } from './lib/validate';
import { parseArticleNumber } from './lib/thai';

import type { LawLevel } from '../src/types/law';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface LawConfig {
  id: string;
  name: string;
  rawDir: string;
  outDir: string;
  manifest: string;
  hasFootnotesAtEnd?: boolean;
  levelDepth?: Partial<Record<LawLevel, number>>;
}

const LAW_CONFIGS: Record<string, LawConfig> = {
  ccc: {
    id: 'ccc',
    name: '[ป.พ.พ.] ประมวลกฎหมายแพ่งและพาณิชย์',
    rawDir: join(ROOT, 'data-source', 'raw'),
    outDir: join(ROOT, 'src', 'data', 'generated'),
    manifest: join(ROOT, 'data-source', 'manifest.json'),
  },
  cpc: {
    id: 'cpc',
    name: '[ป.วิ.พ.] ประมวลกฎหมายวิธีพิจารณาความแพ่ง',
    rawDir: join(ROOT, 'data-source', 'cpc'),
    outDir: join(ROOT, 'src', 'data', 'generated-cpc'),
    manifest: join(ROOT, 'data-source', 'cpc', 'manifest.json'),
  },
  'penal-code': {
    id: 'penal-code',
    name: '[ป.อ.] ประมวลกฎหมายอาญา',
    rawDir: join(ROOT, 'data-source', 'penal-code', 'raw'),
    outDir: join(ROOT, 'src', 'data', 'generated-penal-code'),
    manifest: join(ROOT, 'data-source', 'penal-code', 'manifest.json'),
    hasFootnotesAtEnd: true,
  },
  penal: {
    id: 'penal-code',
    name: '[ป.อ.] ประมวลกฎหมายอาญา',
    rawDir: join(ROOT, 'data-source', 'penal-code', 'raw'),
    outDir: join(ROOT, 'src', 'data', 'generated-penal-code'),
    manifest: join(ROOT, 'data-source', 'penal-code', 'manifest.json'),
    hasFootnotesAtEnd: true,
  },
  crpc: {
    id: 'crpc',
    name: '[ป.วิ.อ.] ประมวลกฎหมายวิธีพิจารณาความอาญา',
    rawDir: join(ROOT, 'data-source', 'crpc', 'raw'),
    outDir: join(ROOT, 'src', 'data', 'generated-crpc'),
    manifest: join(ROOT, 'data-source', 'crpc', 'manifest.json'),
    hasFootnotesAtEnd: true,
  },
  'criminal-procedure': {
    id: 'crpc',
    name: '[ป.วิ.อ.] ประมวลกฎหมายวิธีพิจารณาความอาญา',
    rawDir: join(ROOT, 'data-source', 'crpc', 'raw'),
    outDir: join(ROOT, 'src', 'data', 'generated-crpc'),
    manifest: join(ROOT, 'data-source', 'crpc', 'manifest.json'),
    hasFootnotesAtEnd: true,
  },
  'state-admin': {
    id: 'state-admin',
    name: '[ระเบียบบริหารราชการแผ่นดิน] พระราชบัญญัติระเบียบบริหารราชการแผ่นดิน พ.ศ. ๒๕๓๔',
    rawDir: join(ROOT, 'data-source', 'state-admin', 'raw'),
    outDir: join(ROOT, 'src', 'data', 'generated-state-admin'),
    manifest: join(ROOT, 'data-source', 'state-admin', 'manifest.json'),
    hasFootnotesAtEnd: true,
    levelDepth: {
      ส่วน: 0,
      หมวด: 1,
    },
  },
  'labor-protection': {
    id: 'labor-protection',
    name: '[คุ้มครองแรงงาน] พระราชบัญญัติคุ้มครองแรงงาน พ.ศ. ๒๕๔๑',
    rawDir: join(ROOT, 'data-source', 'labor-protection', 'raw'),
    outDir: join(ROOT, 'src', 'data', 'generated-labor-protection'),
    manifest: join(ROOT, 'data-source', 'labor-protection', 'manifest.json'),
    hasFootnotesAtEnd: true,
    levelDepth: {
      หมวด: 0,
      ส่วน: 1,
    },
  },
  'civil-service': {
    id: 'civil-service',
    name: '[ข้าราชการพลเรือน] พระราชบัญญัติระเบียบข้าราชการพลเรือน พ.ศ. ๒๕๕๑',
    rawDir: join(ROOT, 'data-source', 'civil-service', 'raw'),
    outDir: join(ROOT, 'src', 'data', 'generated-civil-service'),
    manifest: join(ROOT, 'data-source', 'civil-service', 'manifest.json'),
    hasFootnotesAtEnd: true,
    levelDepth: {
      ลักษณะ: 0,
      หมวด: 1,
      ส่วน: 2,
    },
  },
};

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const lawArg = args.find((a) => a.startsWith('--law='))?.split('=')[1] ?? 'ccc';

const config = LAW_CONFIGS[lawArg];
if (!config) {
  console.error(`✗ ไม่รู้จักกฎหมาย: ${lawArg} (เลือกได้: ${Object.keys(LAW_CONFIGS).join(', ')})`);
  process.exit(1);
}

const RAW_DIR = config.rawDir;
const OUT_DIR = config.outDir;
const MANIFEST = config.manifest;

function main() {
  console.log(`▸ ${config.name}`);

  if (!existsSync(RAW_DIR)) {
    console.error(`✗ ไม่พบโฟลเดอร์ ${RAW_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(RAW_DIR)
    .filter((name) => name.endsWith('.txt'))
    .sort();

  if (files.length === 0) {
    console.error(`✗ ไม่พบไฟล์ .txt ใน ${RAW_DIR}`);
    process.exit(1);
  }

  console.log(`▸ อ่านไฟล์ ${files.length} ไฟล์: ${files.join(', ')}`);

  const rawContents = files.map((name) => readFileSync(join(RAW_DIR, name), 'utf8'));
  const combinedRaw = rawContents.join('\n');

  // ถ้ากฎหมายมีเชิงอรรถรวมอยู่ที่ท้ายไฟล์ (เช่น ประมวลกฎหมายอาญา) ให้สกัดเชิงอรรถมาใส่ในแต่ละมาตรา
  let articleNotes: Map<string, string[]> | null = null;
  if (config.hasFootnotesAtEnd) {
    articleNotes = extractFootnotes(combinedRaw);
  }

  // ต่อทุกไฟล์เข้าด้วยกันตามลำดับชื่อไฟล์ (book1.txt, book2.txt, …)
  const lines = rawContents.flatMap((content) => cleanLines(content));

  const tokens = tokenize(lines);
  const result = build(tokens, config.levelDepth);

  if (articleNotes) {
    for (const [id, notes] of articleNotes.entries()) {
      const art = result.articles.get(id);
      if (art && notes.length > 0) {
        art.note = notes.join('\n');
      }
    }
  }

  const report = validate(result);

  printReport(report);

  if (!report.ok) {
    console.error('\n✗ พบข้อผิดพลาด — ไม่เขียนไฟล์ผลลัพธ์');
    process.exit(1);
  }

  if (checkOnly) {
    console.log('\n✓ ตรวจผ่าน (โหมด --check ไม่เขียนไฟล์)');
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeJson(join(OUT_DIR, 'codeTree.json'), result.tree.map(toPlainNode));
  writeJson(join(OUT_DIR, 'articles.json'), toPlainArticles(result.articles));
  writeJson(join(OUT_DIR, 'importReport.json'), report);
  touchManifest(report.articleCount);

  console.log(`\n✓ เขียนไฟล์แล้วที่ ${OUT_DIR}`);
  console.log('  ขั้นถัดไป: npm run typecheck && npm run dev');
}

/** สกัดเชิงอรรถท้ายเอกสารและเชื่อมโยงเข้ากับเลขมาตราที่มีการอ้างอิงเชิงอรรถในเนื้อหา */
function extractFootnotes(fullText: string): Map<string, string[]> {
  const footnoteMap = new Map<string, string>();
  for (const line of fullText.split('\n')) {
    const m = line.trim().match(/^\[([๐-๙\d]+)\]\s*(.*)$/);
    if (m) {
      footnoteMap.set(m[1], m[2]);
    }
  }

  const rawLines = fullText.split('\n');
  let currentArtId = '';
  const articleNotes = new Map<string, string[]>();

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.trim().startsWith('หมายเหตุ :-') || line.trim().startsWith('พระราชบัญญัติแก้ไขเพิ่มเติม')) {
      break;
    }
    const artMatch = line.match(
      /^มาตรา\s*([๐-๙\d]+(?:\s*\/\s*[๐-๙\d]+)?(?:\s+(?:ทวิ|ตรี|จัตวา|เบญจ|ฉ|สัปต|อัฐ|นพ|ทศ))?)/,
    );
    if (artMatch) {
      const rawId = artMatch[1].replace(/\s+/g, ' ').trim();
      const p = parseArticleNumber(rawId);
      if (p) currentArtId = p.id;
    }
    if (currentArtId) {
      const fnRefs = line.matchAll(/\[([๐-๙\d]+)\]/g);
      for (const ref of fnRefs) {
        const fnNum = ref[1];
        const fnText = footnoteMap.get(fnNum);
        if (fnText) {
          // ข้ามเชิงอรรถที่เป็นหัวข้อโครงสร้าง เช่น ภาค, ลักษณะ, หมวด, ส่วน
          if (
            fnText.startsWith('ภาค ') ||
            fnText.startsWith('ลักษณะ ') ||
            fnText.startsWith('หมวด ') ||
            fnText.startsWith('ส่วน ')
          ) {
            continue;
          }
          if (!articleNotes.has(currentArtId)) {
            articleNotes.set(currentArtId, []);
          }
          if (!articleNotes.get(currentArtId)!.includes(fnText)) {
            articleNotes.get(currentArtId)!.push(fnText);
          }
        }
      }
    }
  }

  return articleNotes;
}

function toPlainNode(node: BuiltNode): Record<string, unknown> {
  const plain: Record<string, unknown> = {
    type: node.type,
    number: node.number,
    title: node.title,
  };
  if (node.children.length > 0) plain.children = node.children.map(toPlainNode);
  if (node.articleIds.length > 0) plain.articleIds = node.articleIds;
  return plain;
}

function toPlainArticles(articles: Map<string, BuiltArticle>) {
  const sorted = [...articles.values()].sort(
    (a, b) => a.sortKey[0] - b.sortKey[0] || a.sortKey[1] - b.sortKey[1],
  );
  return Object.fromEntries(
    sorted.map((article) => [
      article.id,
      article.note
        ? { id: article.id, paragraphs: article.paragraphs, note: article.note }
        : { id: article.id, paragraphs: article.paragraphs },
    ]),
  );
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/** อัปเดตวันที่นำเข้าใน manifest โดยคงข้อมูลที่มาที่คุณกรอกไว้ */
function touchManifest(articleCount: number) {
  if (!existsSync(MANIFEST)) return;
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  manifest.lastImportedAt = new Date().toISOString().slice(0, 10);
  manifest.articleCount = articleCount;
  writeJson(MANIFEST, manifest);
}

function printReport(report: ReturnType<typeof validate>) {
  console.log(
    `\n▸ ผลลัพธ์: ${report.bookCount} บรรพ · ${report.nodeCount} หัวข้อ · ${report.articleCount} มาตรา`,
  );
  const errors = report.issues.filter((issue) => issue.level === 'error');
  const warnings = report.issues.filter((issue) => issue.level === 'warning');

  if (errors.length > 0) {
    console.log(`\n  ERROR (${errors.length}):`);
    errors.slice(0, 20).forEach((issue) => console.log(`   ✗ ${issue.message}`));
    if (errors.length > 20) console.log(`   … อีก ${errors.length - 20} รายการ`);
  }
  if (warnings.length > 0) {
    console.log(`\n  WARNING (${warnings.length}):`);
    warnings.slice(0, 10).forEach((issue) => console.log(`   ! ${issue.message}`));
    if (warnings.length > 10) console.log(`   … อีก ${warnings.length - 10} รายการ`);
  }
  if (report.issues.length === 0) console.log('  ไม่พบปัญหา');
}

main();
