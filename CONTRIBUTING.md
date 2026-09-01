# Contributing

คู่มือสำหรับผู้ร่วมพัฒนา (คนหรือ AI coding tool) ของโปรเจกต์ **Civil Law Reader**

> 🤖 ถ้าคุณเป็น AI coding agent ให้อ่าน [`AGENTS.md`](./AGENTS.md) ก่อนเป็นอันดับแรก —
> ไฟล์นั้นคือกฎที่ห้ามละเมิด ส่วนไฟล์นี้อธิบายวิธีทำงานให้ราบรื่น

---

## 1. เริ่มต้น

```bash
git clone https://github.com/<user>/civil-law-reader.git
cd civil-law-reader
npm install
npm run dev
```

เปิด http://localhost:5173

ต้องใช้ Node.js 18 ขึ้นไป ไม่ต้องตั้งค่า environment variable, ไม่ต้องต่อ database,
ไม่ต้องมีอินเทอร์เน็ตหลังจาก `npm install` เสร็จแล้ว

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | dev server พร้อม hot reload |
| `npm run build` | ตรวจ type แล้ว build ไป `dist/` |
| `npm run preview` | เปิดดู production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | ตรวจ TypeScript อย่างเดียว |

---

## 2. โครงสร้างโปรเจกต์

```
src/
├─ data/        ข้อมูลกฎหมายทั้งหมด (mock) — แหล่งความจริงเพียงแห่งเดียว
├─ types/       สัญญาโครงสร้างข้อมูล (LawNode, Article, Decision)
├─ lib/         index ในหน่วยความจำ, ค้นหา, ฟังก์ชัน format — pure functions
├─ store/       React Context: bookmark/recent, theme, toast
├─ navigation/  route definitions + tab bar
├─ layouts/     โครงหน้าและ header
├─ components/  UI ชิ้นเล็กที่ใช้ซ้ำได้
├─ pages/       หนึ่งไฟล์ต่อหนึ่งหน้าจอ
└─ styles/      tokens.css / base.css / components.css
```

### ทิศทางการพึ่งพา (ห้ามย้อนศร)

```
data  →  lib  →  store / pages / components  →  App
```

- `data/` ไม่ import อะไรจากชั้นอื่นเลย
- `lib/` import ได้เฉพาะ `data/` และ `types/` — ห้ามมี JSX หรือ React hook
- `components/` และ `pages/` เรียกข้อมูลผ่าน `lib/lawIndex.ts` เท่านั้น

ถ้าพบว่าต้อง import ย้อนศร แปลว่าโค้ดอยู่ผิดชั้น — ย้ายก่อน อย่าฝืน

---

## 3. Workflow

### 3.1 Branch & commit

```bash
git checkout -b feat/article-font-size
```

ใช้ Conventional Commits:

| prefix | ใช้เมื่อ |
|---|---|
| `feat:` | ฟีเจอร์ใหม่ |
| `fix:` | แก้บั๊ก |
| `data:` | เพิ่ม/แก้ mock data |
| `style:` | ปรับ CSS หรือ UI ที่ไม่กระทบ logic |
| `refactor:` | ปรับโครงสร้างโดยพฤติกรรมเหมือนเดิม |
| `docs:` | เอกสาร |
| `chore:` | config, dependency, tooling |

ตัวอย่าง: `feat(reader): add font size control on article page`

### 3.2 ก่อนเปิด PR ต้องผ่านทั้งหมด

```bash
npm run typecheck
npm run lint
npm run build
```

แล้ว **ทดสอบมือ** ทั้ง 3 flow หลัก:

1. Home → สารบัญ → บรรพ → ลักษณะ → หมวด → ส่วน → รายการมาตรา → มาตรา → ฎีกา
2. Home → ค้นหา → ผลลัพธ์แยกประเภท → หน้าปลายทาง
3. Home → บันทึก → รายการที่บันทึก → หน้ามาตรา → ลบบุ๊กมาร์ก

พร้อมเช็คเพิ่ม: dark mode, ปุ่มปรับขนาดตัวอักษร, prev/next ที่มาตราแรกและมาตราสุดท้าย

### 3.3 PR description ควรมี

- ทำอะไร และทำไม
- หน้าจอที่ได้รับผลกระทบ
- ถ้าแก้ `src/types/law.ts` → อธิบายการเปลี่ยนแปลงและไฟล์ที่ migrate แล้ว
- ถ้าเพิ่ม dependency → เหตุผลว่าทำไมเขียนเองไม่ได้
- screenshot ทั้ง light และ dark mode ถ้าแก้ UI

---

## 4. Coding conventions

### TypeScript
- `strict: true` — ห้าม `any`, ห้าม `@ts-ignore`
- ใช้ `interface` สำหรับ object shape, `type` สำหรับ union/utility
- Named export เสมอ ยกเว้น `App.tsx` (default export)
- ชื่อไฟล์ตรงกับชื่อ export: `ArticleRow.tsx` → `export function ArticleRow`
- import ใช้ alias `@/` เสมอ ไม่ใช้ `../../`

```ts
import { getArticle } from '@/lib/lawIndex';   // ✅
import { getArticle } from '../../lib/lawIndex'; // ❌
```

### React
- Function component + hooks เท่านั้น
- Props เป็น interface ชื่อ `<ComponentName>Props`
- ไม่ต้องใส่ `React.FC`
- `useMemo` / `useCallback` เฉพาะเมื่อวัดแล้วว่าจำเป็นจริง
- ห้ามใช้ `dangerouslySetInnerHTML` (ดู `Highlight.tsx` เป็นตัวอย่างวิธีทำ highlight ที่ปลอดภัย)

### CSS
- Plain CSS ใน `src/styles/` เท่านั้น — ไม่มี CSS-in-JS, ไม่มี utility framework
- ตั้งชื่อคลาสสไตล์ BEM-ish: `.row`, `.row__title`, `.row--compact`
- **ค่าสี ระยะห่าง และขนาดตัวอักษรของตัวบท ต้องมาจาก `tokens.css`**
  ห้ามเขียน hex code ใหม่ใน `components.css`
- ทุกครั้งที่เพิ่ม UI ใหม่ ต้องตรวจทั้ง light และ dark mode

### Routing
สร้าง URL ผ่าน helper เสมอ:

```ts
import { routes } from '@/navigation/routes';

<Link to={routes.article('150')} />        // ✅
<Link to={`/article/150`} />               // ❌
```

เพิ่มหน้าใหม่ = แก้ 3 ที่: `routes.ts` → `pages/NewPage.tsx` → `App.tsx`

---

## 5. วิธีเพิ่มข้อมูลกฎหมาย

ข้อมูลทั้งหมดอยู่ใน `src/data/` — **ห้ามเขียนตัวบทลงใน component เด็ดขาด**

### เพิ่มมาตราใหม่

1. `src/data/codeTree.ts` — เพิ่มเลขมาตราใน `articleIds` ของโหนดที่ถูกต้อง
2. `src/data/articles.ts` — เพิ่มรายการโดยใช้เลขมาตราเป็น key

```ts
// codeTree.ts
{ type: 'หมวด', number: '2', title: 'นิติบุคคล', articleIds: ['65', '66', '67', '68'] },

// articles.ts
'68': {
  id: '68',
  paragraphs: ['… (ข้อความย่อสำหรับต้นแบบ)'],
},
```

`orderedArticleIds` และปุ่ม prev/next จะอัปเดตให้เองอัตโนมัติ

### เพิ่มฎีกา

เพิ่มใน `src/data/decisions.ts` แล้วใส่ `articleIds` ให้ตรงกับเลขมาตรา —
หน้ามาตราจะดึงไปแสดงในหัวข้อ "ฎีกาที่เกี่ยวข้อง" ให้เอง

### หมายเหตุเรื่อง node id

`nodeId` ถูกสร้างอัตโนมัติจากตำแหน่งใน array (`1-2-1` = บรรพที่ 1 › ลักษณะที่ 2 › หมวดที่ 1)
การ **แทรก** โหนดกลางลิสต์จะทำให้ URL ของสารบัญเปลี่ยน (บุ๊กมาร์กมาตราไม่กระทบ เพราะใช้เลขมาตรา)

ถ้าอนาคตต้องการ id ถาวร: เพิ่มฟิลด์ `slug` ใน `LawNode` แล้วปรับ `indexNodes` ใน
`src/lib/lawIndex.ts` ให้ใช้ `slug` แทน index — และอย่าลืมอัปเดต README

---

## 6. สิ่งที่ **ไม่** รับ PR

- ระบบสมาชิก / login / โปรไฟล์ / การแจ้งเตือน / ฟีเจอร์ social
- ปุ่มแก้ไข เพิ่ม หรือลบข้อมูลกฎหมาย (ข้อมูลเป็น read-only โดยหลักการ)
- การดึงข้อมูลกฎหมายจากเว็บภายนอก, scraping, หรือเชื่อม API
- analytics, telemetry, error reporting, remote font, CDN ใด ๆ
- UI library, CSS framework, state management library
- การเปลี่ยนดีไซน์ให้เป็น dashboard, card grid, หรือใส่ gradient/เงา
- ตัวบทกฎหมายฉบับเต็มจำนวนมาก ที่ยังไม่ได้ตกลงกับ maintainer ก่อน

ถ้าไม่แน่ใจว่าสิ่งที่จะทำเข้าข่ายหรือไม่ — เปิด issue ถามก่อนลงมือ

---

## 7. หลักการที่อยากให้รักษาไว้

- **เร็วและออฟไลน์** — เปิดมาตราต้องขึ้นทันที ไม่มี spinner ไม่มีการรอ network
- **อ่านสบายตา** — เป้าหมายคืออ่านตัวบทภาษาไทยยาว ๆ ได้นานโดยไม่ล้า
- **มินิมอล** — ทุกองค์ประกอบที่เพิ่มเข้ามาต้องตอบได้ว่าช่วยให้อ่านหรือค้นหาเร็วขึ้นอย่างไร
- **read-only** — นี่คือหนังสือกฎหมายดิจิทัล ไม่ใช่ระบบจัดการเนื้อหา

---

## 8. รายงานปัญหา

เปิด issue พร้อมระบุ: หน้าจอที่พบ, ขั้นตอนที่ทำให้เกิด, พฤติกรรมที่คาดหวัง,
เบราว์เซอร์/อุปกรณ์ และ screenshot ถ้ามี

ถ้าเป็นเรื่อง **ความถูกต้องของตัวบทกฎหมาย** — โปรดจำไว้ว่าข้อมูลในโปรเจกต์ตอนนี้เป็น
mock data สำหรับทดสอบ UI เท่านั้น ไม่ใช่ตัวบทฉบับทางการ