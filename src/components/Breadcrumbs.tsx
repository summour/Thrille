import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { nodeShortLabel } from '@/lib/format';
import { getLawIdForNode, getLawMeta, getNodePath } from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';

interface BreadcrumbsProps {
  /** โหนดปลายทางของเส้นทาง */
  nodeId: string;
  /** ข้อความปิดท้ายที่กดไม่ได้ เช่น "มาตรา 150" หรือชื่อโหนดปัจจุบัน */
  current?: string;
  /** true = ตัดโหนดสุดท้ายออกจากลิงก์ (ใช้เมื่อโหนดสุดท้ายคือหน้าปัจจุบัน) */
  excludeLast?: boolean;
}

/** breadcrumb แสดงตำแหน่งในโครงสร้าง เช่น ป.พ.พ. / บรรพ 1 / ลักษณะ 2 / หมวด 1 / ส่วน 1 */
export function Breadcrumbs({ nodeId, current, excludeLast = false }: BreadcrumbsProps) {
  const path = getNodePath(nodeId);
  const links = excludeLast ? path.slice(0, -1) : path;
  const lawId = getLawIdForNode(nodeId);
  const law = getLawMeta(lawId);

  if (links.length === 0 && !current) return null;

  return (
    <nav className="breadcrumbs" aria-label="ตำแหน่งในโครงสร้างกฎหมาย">
      <Link to={routes.toc(lawId)}>{law.code}</Link>
      <span className="breadcrumbs__sep">/</span>
      {links.map((node, index) => (
        <Fragment key={node.id}>
          {index > 0 ? <span className="breadcrumbs__sep">/</span> : null}
          <Link to={routes.node(node.id, lawId)}>{nodeShortLabel(node)}</Link>
        </Fragment>
      ))}
      {current ? (
        <>
          {links.length > 0 ? <span className="breadcrumbs__sep">/</span> : null}
          <span className="breadcrumbs__current">{current}</span>
        </>
      ) : null}
    </nav>
  );
}
