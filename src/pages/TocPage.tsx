import { NavRow } from '@/components/NavRow';
import { PageHeader } from '@/layouts/PageHeader';
import { nodeLabel } from '@/lib/format';
import { getRootNodes } from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';

export function TocPage() {
  const roots = getRootNodes();

  return (
    <>
      <PageHeader title="สารบัญกฎหมาย" showBack={false} />
      <main className="page">
        <p className="eyebrow">เลือกหมวดหมู่ / บรรพ</p>
        <div className="list">
          {roots.map((node) => (
            <NavRow
              key={node.id}
              to={routes.node(node.id)}
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