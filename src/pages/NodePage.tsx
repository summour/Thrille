import { useParams } from 'react-router-dom';
import { ArticleRow } from '@/components/ArticleRow';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NavRow } from '@/components/NavRow';
import { PageHeader } from '@/layouts/PageHeader';
import { nodeLabel } from '@/lib/format';
import { getChildNodes, getNode } from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * หน้าระดับชั้นใด ๆ ในสารบัญ (บรรพ / ลักษณะ / หมวด / ส่วน)
 * ใช้ component เดียวกันทุกระดับ เพราะโครงสร้างกฎหมายไม่สม่ำเสมอ:
 * โหนดหนึ่งอาจมีทั้งระดับย่อยและมาตราของตัวเอง หรือมีอย่างใดอย่างหนึ่ง
 */
export function NodePage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const node = getNode(nodeId);

  if (!node) return <NotFoundPage message="ไม่พบหมวดหมู่ที่ระบุ" />;

  const children = getChildNodes(node.id);
  const label = nodeLabel(node);

  return (
    <>
      <PageHeader title={label} />
      <main className="page">
        <Breadcrumbs nodeId={node.id} current={label} excludeLast />
        <h2 className="page-title">{label}</h2>

        {children.length > 0 && (
          <>
            <p className="eyebrow">{children[0].type}ในหมวดนี้</p>
            <div className="list">
              {children.map((child) => (
                <NavRow
                  key={child.id}
                  to={routes.node(child.id)}
                  title={nodeLabel(child)}
                  subtitle={
                    child.childIds.length > 0
                      ? `${child.totalArticles} มาตรา · ${child.childIds.length} ${child.type === 'ลักษณะ' ? 'หมวด' : 'ส่วน'}`
                      : `${child.totalArticles} มาตรา`
                  }
                />
              ))}
            </div>
          </>
        )}

        {node.articleIds.length > 0 && (
          <>
            <p className="eyebrow">
              มาตรา {node.articleIds[0]}–{node.articleIds[node.articleIds.length - 1]}
            </p>
            <div className="list">
              {node.articleIds.map((articleId) => (
                <ArticleRow key={articleId} articleId={articleId} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}