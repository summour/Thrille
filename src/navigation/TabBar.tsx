import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { routes } from '@/navigation/routes';

const TABS = [
  { to: routes.home, label: 'หน้าแรก', icon: 'home' as const, end: true },
  { to: routes.toc, label: 'สารบัญ', icon: 'list' as const, end: false },
  { to: routes.search(), label: 'ค้นหา', icon: 'search' as const, end: false },
  { to: routes.bookmarks, label: 'บันทึก', icon: 'bookmark' as const, end: false },
];

/**
 * แถบนำทางหลัก (mobile-first)
 * ซ่อนในหน้ามาตรา เพื่อเปิดพื้นที่ให้แถบ “ก่อนหน้า / ถัดไป” และลด visual clutter ระหว่างอ่าน
 */
export function TabBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/article/')) return null;

  return (
    <nav className="tabbar" aria-label="เมนูหลัก">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end} className="tabbar__item">
          <Icon name={tab.icon} size={20} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}