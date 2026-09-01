import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon } from '@/components/Icon';

interface NavRowProps {
  to: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** ปุ่มด้านขวา เช่น bookmark — ถ้าไม่ส่งจะแสดงลูกศร */
  trailing?: ReactNode;
}

/** แถวรายการมาตรฐาน: เส้นคั่นบาง ไม่ใช้ card เพื่อลด visual noise */
export function NavRow({ to, title, subtitle, trailing }: NavRowProps) {
  return (
    <div className="row">
      <Link to={to} className="row__main">
        <span className="row__title">{title}</span>
        {subtitle ? <span className="row__subtitle">{subtitle}</span> : null}
      </Link>
      {trailing ?? <Icon name="chevronRight" size={16} className="row__chevron" />}
    </div>
  );
}