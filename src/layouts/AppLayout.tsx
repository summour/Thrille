import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '@/navigation/TabBar';

/** เฟรมหลักของแอป: คอลัมน์เดียว กว้างสูงสุดเท่าหน้าจอมือถือ อ่านง่ายทั้งบนมือถือและเดสก์ท็อป */
export function AppLayout() {
  const shellRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (shellRef.current) {
      shellRef.current.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);

  return (
    <div className="app-shell" ref={shellRef}>
      <Outlet />
      <TabBar />
    </div>
  );
}