import { Link, useParams } from 'react-router-dom';
import { BookmarkButton } from '@/components/BookmarkButton';
import { SectionHeading } from '@/components/SectionHeading';
import { PageHeader } from '@/layouts/PageHeader';
import { getDecision, getLawIdForArticle } from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';
import { NotFoundPage } from '@/pages/NotFoundPage';

/** หน้าคำพิพากษาฎีกา — read-only, schema พร้อมรับข้อมูลจริงในอนาคต */
export function DecisionPage() {
  const { decisionId } = useParams<{ decisionId: string }>();
  const decision = getDecision(decisionId);

  if (!decision) return <NotFoundPage message="ไม่พบคำพิพากษาที่ระบุ" />;

  const firstArticle = decision.articleIds[0];
  const backTo = firstArticle
    ? routes.article(firstArticle, getLawIdForArticle(firstArticle))
    : routes.home;

  return (
    <>
      <PageHeader
        title={`ฎีกาที่ ${decision.number}`}
        backTo={backTo}
        actions={
          <BookmarkButton kind="decision" id={decision.id} addedMessage="บันทึกฎีกาแล้ว" />
        }
      />

      <main className="page page--reader">
        <div className="article-head">
          <p className="article-number article-number--small">ฎีกาที่ {decision.number}</p>
          <p className="article-location">คำพิพากษาศาลฎีกา พ.ศ. {decision.year}</p>
        </div>

        <dl className="meta-grid">
          <dt>ปี</dt>
          <dd>{decision.year}</dd>

          <dt>มาตราที่เกี่ยวข้อง</dt>
          <dd>
            <div className="tags">
              {decision.articleIds.map((articleId) => (
                <Link
                  key={articleId}
                  to={routes.article(articleId, getLawIdForArticle(articleId))}
                  className="tag tag--link"
                >
                  มาตรา {articleId}
                </Link>
              ))}
            </div>
          </dd>

          <dt>คำสำคัญ</dt>
          <dd>
            <div className="tags">
              {decision.keywords.map((keyword) => (
                <span key={keyword} className="tag">
                  {keyword}
                </span>
              ))}
            </div>
          </dd>
        </dl>

        <SectionHeading title="เนื้อหาย่อ" divider />
        <article className="article-body">
          <p>{decision.summary}</p>
        </article>

        <p className="readonly-note">
          แหล่งที่มา: {decision.source} · ข้อมูลอ่านอย่างเดียว
        </p>
      </main>
    </>
  );
}