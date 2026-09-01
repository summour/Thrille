import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { appMeta } from '@/data/meta';
import { getAllLaws } from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';
import { useTheme } from '@/store/ThemeContext';

export function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const laws = getAllLaws();

  return (
    <>
      <header className="page-header">
        <span className="page-header__brand">{appMeta.appName}</span>
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

        <p className="eyebrow">ประมวลกฎหมาย</p>

        <div className="law-box-list" role="list">
          {laws.map((law) => (
            <Link
              key={law.id}
              to={routes.toc(law.id)}
              className="law-box"
              role="listitem"
            >
              <div className="law-box__main">
                <div className="law-box__top">
                  <span className="law-box__badge">{law.code}</span>
                  <span className="law-box__title">{law.title}</span>
                </div>
                <p className="law-box__desc">{law.description}</p>
                <div className="law-box__meta">
                  {law.totalSections} {law.unitName} · {law.totalArticles.toLocaleString('th-TH')} มาตรา
                </div>
              </div>
              <div className="law-box__arrow">
                <Icon name="chevronRight" size={18} />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
