import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { routes } from '@/navigation/routes';

const TABS = [
  { to: routes.home, label: 'หน้าแรก', icon: 'home' as const, end: true },
  { to: routes.search(), label: 'ค้นหา', icon: 'search' as const, end: false },
  { to: routes.bookmarks, label: 'บันทึก', icon: 'bookmark' as const, end: false },
];

interface TabBarProps {
  visible?: boolean;
}

/**
 * แถบนำทางหลัก (mobile-first)
 * ซ่อนในหน้ามาตรา และซ่อนอัตโนมัติเมื่อเลื่อนหน้าลง เพื่อไม่ให้บังเนื้อหา
 */
export function TabBar({ visible = true }: TabBarProps) {
  const { pathname } = useLocation();
  if (pathname.startsWith('/article/')) return null;

  return (
    <nav
      className={`tabbar${!visible ? ' tabbar--hidden' : ''}`}
      aria-label="เมนูหลัก"
      aria-hidden={!visible}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className="tabbar__item"
          aria-label={tab.label}
          title={tab.label}
          tabIndex={visible ? 0 : -1}
        >
          <Icon name={tab.icon} size={22} />
        </NavLink>
      ))}
    </nav>
  );
}
