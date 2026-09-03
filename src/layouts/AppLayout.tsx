import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '@/navigation/TabBar';

/** เฟรมหลักของแอป: คอลัมน์เดียว กว้างสูงสุดเท่าหน้าจอมือถือ อ่านง่ายทั้งบนมือถือและเดสก์ท็อป */
export function AppLayout() {
  const shellRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [tabBarVisible, setTabBarVisible] = useState(true);

  useEffect(() => {
    if (shellRef.current) {
      shellRef.current.scrollTo(0, 0);
    }
    setTabBarVisible(true);
  }, [location.pathname, location.search]);

  // ตรวจจับการเลื่อนหน้าจอ: เลื่อนลง -> ซ่อน TabBar ไม่ให้บังเนื้อหา / เลื่อนขึ้นหรือแตะบนสุด -> แสดงกลับมา
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    let lastScrollTop = 0;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentScrollTop = el.scrollTop;
        const maxScroll = el.scrollHeight - el.clientHeight;
        const delta = currentScrollTop - lastScrollTop;

        // ขอบบนสุด หรือขอบล่างสุด -> แสดงแถบนำทางเสมอ
        if (currentScrollTop <= 15 || currentScrollTop >= maxScroll - 25) {
          setTabBarVisible(true);
        } else if (delta > 6 && currentScrollTop > 35) {
          // เลื่อนลงชัดเจน -> ซ่อนแท็บบาร์เพื่อไม่ให้บังสายตา
          setTabBarVisible(false);
        } else if (delta < -6) {
          // เลื่อนขึ้น -> แสดงแท็บบาร์เพื่อเตรียมนำทาง
          setTabBarVisible(true);
        }

        lastScrollTop = currentScrollTop;
        ticking = false;
      });
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

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
      <TabBar visible={tabBarVisible} />
    </div>
  );
}