import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MiniAudioPlayer } from '@/components/MiniAudioPlayer';
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

  // ป้องกันการดึงหน้าจอติดขอบ (iOS overscroll rubber-banding / pull-to-refresh) เพื่อให้ความรู้สึกเหมือน Native App
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    let startY = 0;
    let startX = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - startY;
      const deltaX = currentX - startX;

      // ถ้าเป็นการปัดแนวนอนมากกว่าแนวตั้ง ปล่อยให้ gesture อื่นๆ (เช่น swipe เปลี่ยนมาตรา) ทำงาน
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }

      // ถ้าอยู่ที่ขอบบนสุดแล้วพยายามลากลงมา (Pull down at top) -> ป้องกันการรีโหลด/เด้งของ Safari / PWA
      if (el.scrollTop <= 0 && deltaY > 0) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      // ถ้าอยู่ที่ขอบล่างสุดแล้วพยายามลากขึ้นไป (Pull up at bottom) -> ป้องกันการเด้งหลุดกรอบ
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0 || (el.scrollTop >= maxScroll && deltaY < 0)) {
        if (e.cancelable) e.preventDefault();
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div className="app-shell" ref={shellRef}>
      <Outlet />
      <MiniAudioPlayer />
      <TabBar />
    </div>
  );
}