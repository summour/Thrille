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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const lawArg = args.find((a) => a.startsWith('--law='))?.split('=')[1] ?? 'ccc';
const isCpc = lawArg === 'cpc';

const RAW_DIR = join(ROOT, 'data-source', isCpc ? 'cpc' : 'raw');
const OUT_DIR = join(ROOT, 'src', 'data', isCpc ? 'generated-cpc' : 'generated');
const MANIFEST = join(ROOT, 'data-source', isCpc ? 'cpc/manifest.json' : 'manifest.json');

function main() {
  console.log(
    isCpc
      ? '▸ [ป.วิ.พ.] นำเข้าประมวลกฎหมายวิธีพิจารณาความแพ่ง'
      : '▸ [ป.พ.พ.] นำเข้าประมวลกฎหมายแพ่งและพาณิชย์',
  );

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

  // ต่อทุกไฟล์เข้าด้วยกันตามลำดับชื่อไฟล์ (book1.txt, book2.txt, …)
  const lines = files.flatMap((name) => cleanLines(readFileSync(join(RAW_DIR, name), 'utf8')));

  const tokens = tokenize(lines);
  const result = build(tokens);
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
