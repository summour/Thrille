import { ReactNode } from 'react';

interface EmptyStateProps {
  children: ReactNode;
}

/** แสดงข้อความเมื่อไม่มีข้อมูล (เช่น รายการว่าง, ผลลัพธ์ค้นหา 0 รายการ) */
export function EmptyState({ children }: EmptyStateProps) {
  return <div className="empty-state">{children}</div>;
}
