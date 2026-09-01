import type { LawNode } from '@/types/law';

/**
 * MOCK DATA — โครงสร้างสารบัญตัวอย่างเท่านั้น ไม่ใช่ฉบับสมบูรณ์
 *
 * วิธีเพิ่มข้อมูล:
 * 1. เพิ่ม/แก้โหนดในไฟล์นี้ (id จะถูกสร้างอัตโนมัติจากตำแหน่งใน array)
 * 2. เพิ่มตัวบทที่ตรงกันใน `src/data/articles.ts`
 *
 * ตัวอย่างนี้จงใจครอบคลุม 3 กรณีของโครงสร้าง:
 * - ลักษณะ 1 (บรรพ 1)  : มีมาตราโดยตรง ไม่มีหมวด ไม่มีส่วน
 * - หมวด 2 (บรรพ 1)    : มีมาตราโดยตรง ไม่มีส่วน
 * - หมวด 1 (บรรพ 1)    : มีส่วนย่อยครบทุกระดับ
 */
export const codeTree: LawNode[] = [
  {
    type: 'บรรพ',
    number: '1',
    title: 'หลักทั่วไป',
    children: [
      {
        type: 'ลักษณะ',
        number: '1',
        title: 'บทเบ็ดเสร็จทั่วไป',
        articleIds: ['4', '5', '6'],
      },
      {
        type: 'ลักษณะ',
        number: '2',
        title: 'บุคคล',
        children: [
          {
            type: 'หมวด',
            number: '1',
            title: 'บุคคลธรรมดา',
            children: [
              { type: 'ส่วน', number: '1', title: 'สภาพบุคคล', articleIds: ['15', '16', '17'] },
              { type: 'ส่วน', number: '2', title: 'ความสามารถ', articleIds: ['19', '20', '21'] },
            ],
          },
          {
            type: 'หมวด',
            number: '2',
            title: 'นิติบุคคล',
            articleIds: ['65', '66', '67'],
          },
        ],
      },
      {
        type: 'ลักษณะ',
        number: '4',
        title: 'นิติกรรม',
        children: [
          {
            type: 'หมวด',
            number: '1',
            title: 'บทเบ็ดเสร็จทั่วไป',
            articleIds: ['149', '150', '152'],
          },
        ],
      },
    ],
  },
  {
    type: 'บรรพ',
    number: '2',
    title: 'หนี้',
    children: [
      {
        type: 'ลักษณะ',
        number: '1',
        title: 'บทเบ็ดเสร็จทั่วไป',
        children: [
          { type: 'หมวด', number: '1', title: 'วัตถุแห่งหนี้', articleIds: ['194', '195'] },
        ],
      },
    ],
  },
  {
    type: 'บรรพ',
    number: '3',
    title: 'เอกเทศสัญญา',
    children: [
      {
        type: 'ลักษณะ',
        number: '1',
        title: 'ซื้อขาย',
        children: [
          {
            type: 'หมวด',
            number: '1',
            title: 'สภาพและหลักสำคัญของสัญญาซื้อขาย',
            children: [
              { type: 'ส่วน', number: '1', title: 'บทเบ็ดเสร็จทั่วไป', articleIds: ['453', '455'] },
            ],
          },
        ],
      },
    ],
  },
];