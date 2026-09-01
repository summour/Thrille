import { Outlet, ScrollRestoration } from 'react-router-dom';
import { TabBar } from '@/navigation/TabBar';

/** เฟรมหลักของแอป: คอลัมน์เดียว กว้างสูงสุดเท่าหน้าจอมือถือ อ่านง่ายทั้งบนมือถือและเดสก์ท็อป */
export function AppLayout() {
  return (
    <div className="app-shell">
      <ScrollRestoration />
      <Outlet />
      <TabBar />
    </div>
  );
}