import { useSearchParams } from 'react-router-dom';
import { NavRow } from '@/components/NavRow';
import { PageHeader } from '@/layouts/PageHeader';
import { nodeLabel } from '@/lib/format';
import { defaultLawId, getAllLaws, getLawMeta, getRootNodes } from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';

export function TocPage() {
  const [searchParams] = useSearchParams();
  const rawLawId = searchParams.get('law');
  const allLaws = getAllLaws();
  const currentLawId =
    rawLawId && allLaws.some((l) => l.id === rawLawId) ? rawLawId : defaultLawId;

  const currentLaw = getLawMeta(currentLawId);
  const roots = getRootNodes(currentLawId);

  return (
    <>
      <PageHeader title={`สารบัญ ${currentLaw.code}`} showBack backTo={routes.home} />
      <main className="page">
        <div className="toc-law-header">
          <h1 className="toc-law-header__title">{currentLaw.title}</h1>
          <p className="toc-law-header__desc">{currentLaw.description}</p>
          <div className="law-box__meta" style={{ marginTop: '8px' }}>
            {currentLaw.totalSections} {currentLaw.unitName} · {currentLaw.totalArticles.toLocaleString('th-TH')} มาตรา
          </div>
        </div>

        <p className="eyebrow">เลือก{currentLaw.unitName}</p>
        <div className="list">
          {roots.map((node) => (
            <NavRow
              key={node.id}
              to={routes.node(node.id, currentLawId)}
              title={nodeLabel(node)}
              subtitle={
                node.childIds.length > 0
                  ? `${node.totalArticles} มาตรา · ${node.childIds.length} ลักษณะ`
                  : `${node.totalArticles} มาตรา`
              }
            />
          ))}
        </div>
      </main>
    </>
  );
}
