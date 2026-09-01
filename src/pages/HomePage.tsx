import { Link } from 'react-router-dom';
import { ArticleRow } from '@/components/ArticleRow';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { SectionHeading } from '@/components/SectionHeading';
import { appMeta } from '@/data/meta';
import { libraryStats } from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';
import { useLibrary } from '@/store/LibraryContext';
import { useTheme } from '@/store/ThemeContext';

const PREVIEW_LIMIT = 4;

export function HomePage() {
  const { recentArticleIds, bookmarkedArticleIds, bookmarkedDecisionIds } = useLibrary();
  const { theme, toggleTheme } = useTheme();

  const recent = recentArticleIds.slice(0, PREVIEW_LIMIT);
  const bookmarks = bookmarkedArticleIds.slice(0, PREVIEW_LIMIT);

  return (
    <>
      <header className="page-header">
        <span className="page-header__brand">{appMeta.codeShortTitle}</span>
        <div className="page-header__actions">
          <Link to={routes.search()} className="icon-button" aria-label="ค้นหา">
            <Icon name="search" size={19} />
          </Link>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <h1>{appMeta.codeTitle}</h1>
          <p>{appMeta.tagline}</p>
        </section>

        <Link to={routes.search()} className="search-entry">
          <Icon name="search" size={19} />
          <span>ค้นหามาตรา / คำสำคัญ / เลขฎีกา</span>
        </Link>

        <nav className="quick-links" aria-label="ทางลัด">
          <Link to={routes.toc}>
            <span className="quick-links__title">สารบัญกฎหมาย</span>
            <span className="quick-links__meta">
              {libraryStats.bookCount} บรรพ · {libraryStats.articleCount} มาตรา
            </span>
          </Link>
          <Link to={routes.bookmarks}>
            <span className="quick-links__title">ที่บันทึกไว้</span>
            <span className="quick-links__meta">
              {bookmarkedArticleIds.length} มาตรา · {bookmarkedDecisionIds.length} ฎีกา
            </span>
          </Link>
        </nav>

        <SectionHeading title="อ่านล่าสุด" />
        {recent.length > 0 ? (
          <div className="list">
            {recent.map((articleId) => (
              <ArticleRow key={articleId} articleId={articleId} />
            ))}
          </div>
        ) : (
          <EmptyState>ยังไม่มีมาตราที่เปิดอ่าน — เริ่มจากสารบัญหรือช่องค้นหาด้านบน</EmptyState>
        )}

        <SectionHeading title="มาตราที่บันทึกไว้" />
        {bookmarks.length > 0 ? (
          <div className="list">
            {bookmarks.map((articleId) => (
              <ArticleRow key={articleId} articleId={articleId} />
            ))}
          </div>
        ) : (
          <EmptyState>ยังไม่มีรายการบันทึก — แตะไอคอนบุ๊กมาร์กที่มาตราใดก็ได้</EmptyState>
        )}

        <footer className="status-bar">
          <span>ฐานข้อมูลอัปเดต {appMeta.databaseUpdatedAt} · พร้อมใช้งานออฟไลน์</span>
          <button type="button" onClick={toggleTheme}>
            {theme === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'}
          </button>
        </footer>
      </main>
    </>
  );
}