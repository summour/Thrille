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
        <p className="eyebrow">เลือกบรรพ</p>
        <div className="list">
          {roots.map((node) => (
            <NavRow
              key={node.id}
              to={routes.node(node.id)}
              title={nodeLabel(node)}
              subtitle={`${node.totalArticles} มาตรา · ${node.childIds.length} ลักษณะ`}
            />
          ))}
        </div>
        <p className="note">
          โครงสร้าง: บรรพ → ลักษณะ → หมวด → ส่วน → มาตรา
          <br />
          บางช่วงของกฎหมายอาจไม่มีครบทุกระดับ
        </p>
      </main>
    </>
  );
}