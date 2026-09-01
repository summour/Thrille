import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';

interface PageHeaderProps {
  title: string;
  /** แสดงปุ่มย้อนกลับ (ค่าเริ่มต้น: แสดง) */
  showBack?: boolean;
  /** ปลายทางสำหรับการย้อนกลับเชิงโครงสร้าง เช่น สารบัญ/หมวด แทนการ navigate(-1) ในประวัติเบราว์เซอร์ */
  backTo?: string;
  onBack?: () => void;
  /** ปุ่มเสริมด้านขวา เช่น bookmark, ปรับขนาดตัวอักษร, ค้นหา */
  actions?: ReactNode;
}

export function PageHeader({ title, showBack = true, backTo, onBack, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="page-header">
      {showBack ? (
        <button type="button" className="icon-button" onClick={handleBack} aria-label="ย้อนกลับ">
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