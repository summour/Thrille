import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { appMeta } from '@/data/meta';
import { libraryStats } from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';
import { useLibrary } from '@/store/LibraryContext';
import { useTheme } from '@/store/ThemeContext';

export function HomePage() {
  const { bookmarkedArticleIds, bookmarkedDecisionIds } = useLibrary();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="page-header">
        <span className="page-header__brand">{appMeta.codeShortTitle}</span>
        <div className="page-header__actions">
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'เปิดโหมดมืด' : 'เปิดโหมดสว่าง'}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
          </button>
          <Link to={routes.search()} className="icon-button" aria-label="ค้นหา">
            <Icon name="search" size={19} />
          </Link>
        </div>
      </header>

      <main className="page">
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
      </main>
    </>
  );
}