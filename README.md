# Civil Law Reader

เว็บแอปอ่าน **ประมวลกฎหมายแพ่งและพาณิชย์** สำหรับใช้ส่วนตัวในการเตรียมสอบ  
ออกแบบแบบ mobile-first, offline-first, อ่านอย่างเดียว (read-only)

> **สถานะ:** UX/UI prototype — ข้อมูลในโปรเจกต์เป็น **mock data ขนาดเล็ก** เท่านั้น  
> ยังไม่มีตัวบทฉบับสมบูรณ์ ห้ามนำไปใช้อ้างอิงทางกฎหมาย

## Stack

- React 18 + TypeScript
- Vite 5
- React Router 6 (HashRouter)
- Plain CSS + CSS custom properties (ไม่มี UI library)
- ไม่มี backend, ไม่มี API, ไม่มี database, ไม่มีการเรียก network ใด ๆ

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เปิด http://localhost:5173

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รัน dev server |
| `npm run build` | ตรวจ type แล้ว build ไป `dist/` |
| `npm run preview` | เปิดดู production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | ตรวจ TypeScript อย่างเดียว |

## โครงสร้างโปรเจกต์

```
src/
├─ data/        mock data ทั้งหมด (แก้ที่นี่เวลาจะเพิ่มเนื้อหากฎหมาย)
├─ types/       type ของโครงสร้างกฎหมาย
├─ lib/         index ในหน่วยความจำ + ค้นหา + format
├─ store/       React Context: bookmark/recent, ธีม, toast
├─ navigation/  route definitions + tab bar
├─ layouts/     โครงหน้าและ header
├─ components/  UI ชิ้นเล็กที่ใช้ซ้ำ
├─ pages/       หนึ่งไฟล์ต่อหนึ่งหน้าจอ
└─ styles/      tokens / base / components
```

**กฎสำคัญ:** ห้าม hard-code เนื้อหากฎหมายใน component — ข้อมูลทั้งหมดต้องอยู่ใน `src/data/`

## โครงสร้างข้อมูลกฎหมาย

```
(ข้อความเบื้องต้น) / บรรพ → ลักษณะ → หมวด → ส่วน → มาตรา
```

โครงสร้างจริงไม่สม่ำเสมอ ระบบจึงออกแบบให้ **ข้ามระดับได้**  
- **ข้อความเบื้องต้น** อยู่ในระดับบนสุดก่อนเริ่มบรรพ ๑ (มาตรา ๑–๓)
- โหนดหนึ่งใน `codeTree.ts` มีได้ทั้ง `children` (ระดับย่อย) และ/หรือ `articleIds` (มาตราของตัวเอง)

mock data ตัวอย่างครอบคลุมทั้ง 3 กรณี:

| กรณี | ตัวอย่างในข้อมูล |
|---|---|
| ลักษณะที่มีมาตราโดยตรง (ไม่มีหมวด/ส่วน) | บรรพ 1 › ลักษณะ 1 |
| หมวดที่ไม่มีส่วน | บรรพ 1 › ลักษณะ 2 › หมวด 2 |
| ครบทุกระดับถึง "ส่วน" | บรรพ 1 › ลักษณะ 2 › หมวด 1 › ส่วนที่ 1 |

### วิธีเพิ่มเนื้อหากฎหมาย

1. เพิ่มโหนดใน `src/data/codeTree.ts` (`id` ถูกสร้างอัตโนมัติจากตำแหน่งใน array)
2. เพิ่มตัวบทที่ตรงกันใน `src/data/articles.ts` โดยใช้เลขมาตราเป็น key
3. เพิ่มฎีกาใน `src/data/decisions.ts` และอ้าง `articleIds` ให้ตรงกับเลขมาตรา

> ⚠️ node id อ้างอิงตำแหน่งใน array — การแทรกโหนดกลางลิสต์จะทำให้ URL ของสารบัญเปลี่ยน  
> ถ้าต้องการ id ถาวร ให้เพิ่มฟิลด์ `slug` ใน `LawNode` แล้วปรับ `buildIndex` ใน `src/lib/lawIndex.ts`

## Navigation flow

```
Home → สารบัญ → บรรพ → ลักษณะ → หมวด → ส่วน → รายการมาตรา → หน้ามาตรา → ฎีกาที่เกี่ยวข้อง
Home → ค้นหา → ผลลัพธ์ (มาตรา / ฎีกา / สารบัญ) → หน้ามาตรา หรือ หน้าฎีกา
Home → บันทึก → มาตรา / ฎีกา ที่บันทึกไว้ → หน้ามาตรา
```

| Route | หน้าจอ |
|---|---|
| `/` | หน้าแรก (ค้นหา, ทางลัด, อ่านล่าสุด, บุ๊กมาร์ก) |
| `/toc` | รายการบรรพ |
| `/toc/:nodeId` | ระดับชั้นใด ๆ ในสารบัญ |
| `/article/:articleId` | หน้ามาตรา + ฎีกาที่เกี่ยวข้อง |
| `/decision/:decisionId` | หน้าคำพิพากษาฎีกา |
| `/search` | ค้นหา (คำค้นเก็บใน query string `?q=`) |
| `/bookmarks` | รายการที่บันทึกไว้ |

## หลักการออกแบบ

- **Offline-first** — ข้อมูลกฎหมาย bundle มากับแอป ไม่มี loading state, ไม่มี network fetch  
  แถบ "ฐานข้อมูลอัปเดต …" ในหน้าแรกเป็น placeholder สำหรับระบบอัปเดตในอนาคต
- **Read-only** — ไม่มีปุ่มแก้ไขข้อมูลกฎหมาย ไม่มีระบบสมาชิก / โปรไฟล์ / แจ้งเตือน / social
- **อ่านสบาย** — ตัวบทใช้ตัวแปร `--reader-size` / `--reader-line-height` ปรับได้ 3 ระดับจากปุ่ม "ก" ในหน้ามาตรา
- **แยกตัวบทกับฎีกาชัดเจน** — คั่นด้วยเส้น contrast สูง ไม่ใช้ card ซ้อนกัน
- **อ่านต่อเนื่อง** — ปุ่มมาตราก่อนหน้า/ถัดไป ทำงานข้ามหมวดและบรรพได้ โดยไม่ต้องกลับสารบัญ
- **Light mode เป็นค่าเริ่มต้น** รองรับ dark mode (สลับที่หน้าแรก, จำค่าไว้ใน localStorage)

## ข้อมูลที่เก็บในเครื่อง

เก็บใน `localStorage` เท่านั้น ไม่มีการส่งออกนอกเครื่อง:

| Key | ข้อมูล |
|---|---|
| `clr.bookmarks.articles` | เลขมาตราที่บันทึก |
| `clr.bookmarks.decisions` | id ฎีกาที่บันทึก |
| `clr.recent.articles` | ประวัติการอ่าน (สูงสุด 20 รายการ) |
| `clr.theme` | `light` / `dark` |
| `clr.fontScale` | `1` / `2` / `3` |

## Roadmap ที่เปิดทางไว้แล้ว

- [ ] เติมตัวบทฉบับเต็ม (โครงสร้างข้อมูลพร้อมแล้ว)
- [ ] เติมฎีกาจริง (schema ใน `types/law.ts` พร้อมแล้ว)
- [ ] เปลี่ยน `lib/lawIndex.ts` ไปอ่านจาก IndexedDB/SQLite เมื่อข้อมูลใหญ่ขึ้น
- [ ] Full-text search ที่ดีขึ้น (ตัดคำภาษาไทย) ใน `lib/search.ts`
- [ ] PWA / Service worker เพื่อใช้งานออฟไลน์เต็มรูปแบบ
- [ ] Deploy ขึ้น GitHub Pages (ใช้ HashRouter อยู่แล้ว ตั้ง `base` ใน `vite.config.ts` ให้ตรงชื่อ repo)

## เอกสารสำหรับผู้พัฒนา

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — โครงสร้างโปรเจกต์, workflow, coding conventions
- [`AGENTS.md`](./AGENTS.md) — กฎสำหรับ AI coding tools (อ่านก่อนแก้โค้ดเสมอ)

## Disclaimer

ข้อมูลในโปรเจกต์นี้เป็นตัวอย่างสำหรับทดสอบ UI เท่านั้น ไม่ใช่ตัวบทกฎหมายฉบับทางการ  
โปรดตรวจสอบกับราชกิจจานุเบกษาหรือฉบับพิมพ์ที่เชื่อถือได้เสมอ