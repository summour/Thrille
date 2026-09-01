import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';

interface PageHeaderProps {
  title: string;
  /** แสดงปุ่มย้อนกลับ (ค่าเริ่มต้น: แสดง) */
  showBack?: boolean;
  /** ปุ่มเสริมด้านขวา เช่น bookmark, ปรับขนาดตัวอักษร, ค้นหา */
  actions?: ReactNode;
}

export function PageHeader({ title, showBack = true, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="page-header">
      {showBack ? (
        <button type="button" className="icon-button" onClick={() => navigate(-1)} aria-label="ย้อนกลับ">
          <Icon name="chevronLeft" size={22} />
        </button>
      ) : (
        <span className="page-header__spacer" />
      )}
      <h1 className="page-header__title">{title}</h1>
      <div className="page-header__actions">{actions}</div>
    </header>
  );
}