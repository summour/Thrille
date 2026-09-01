import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { routePatterns } from '@/navigation/routes';
import { ArticlePage } from '@/pages/ArticlePage';
import { BookmarksPage } from '@/pages/BookmarksPage';
import { DecisionPage } from '@/pages/DecisionPage';
import { HomePage } from '@/pages/HomePage';
import { NodePage } from '@/pages/NodePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SearchPage } from '@/pages/SearchPage';
import { TocPage } from '@/pages/TocPage';
import { LibraryProvider } from '@/store/LibraryContext';
import { ThemeProvider } from '@/store/ThemeContext';
import { ToastProvider } from '@/store/ToastContext';

/**
 * ใช้ HashRouter เพื่อให้ deploy เป็น static site ได้ทันที (เช่น GitHub Pages)
 * โดยไม่ต้องตั้งค่า server rewrite — เปลี่ยนเป็น createBrowserRouter ได้ถ้าต้องการ
 */
const router = createHashRouter([
  {
    path: routePatterns.home,
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: routePatterns.toc, element: <TocPage /> },
      { path: routePatterns.node, element: <NodePage /> },
      { path: routePatterns.article, element: <ArticlePage /> },
      { path: routePatterns.decision, element: <DecisionPage /> },
      { path: routePatterns.search, element: <SearchPage /> },
      { path: routePatterns.bookmarks, element: <BookmarksPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </LibraryProvider>
    </ThemeProvider>
  );
}