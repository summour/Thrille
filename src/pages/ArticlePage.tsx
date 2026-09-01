import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DecisionRow } from '@/components/DecisionRow';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { PrevNextBar } from '@/components/PrevNextBar';
import { SectionHeading } from '@/components/SectionHeading';
import { PageHeader } from '@/layouts/PageHeader';
import { nodeLabel } from '@/lib/format';
import {
  getAdjacentArticleIds,
  getArticle,
  getArticleNode,
  getDecisionsForArticle,
} from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useLibrary } from '@/store/LibraryContext';
import { useTheme } from '@/store/ThemeContext';
import { useToast } from '@/store/ToastContext';

export function ArticlePage() {
  const { articleId = '' } = useParams<{ articleId: string }>();
  const article = getArticle(articleId);
  const { markAsRead } = useLibrary();
  const { cycleFontScale, fontScaleLabel } = useTheme();
  const { showToast } = useToast();

  useEffect(() => {
    if (article) markAsRead(article.id);
  }, [article, markAsRead]);

  if (!article) return <NotFoundPage message={`ไม่พบมาตรา ${articleId} ในฐานข้อมูล`} />;

  const node = getArticleNode(article.id);
  const decisions = getDecisionsForArticle(article.id);
  const { previous, next } = getAdjacentArticleIds(article.id);

  const handleFontScale = () => {
    cycleFontScale();
    showToast(`ขนาดตัวอักษร: ${fontScaleLabel}`);
  };

  return (
    <>
      <PageHeader
        title={`มาตรา ${article.id}`}
        actions={
          <>
            <button
              type="button"
              className="icon-button icon-button--text"
              onClick={handleFontScale}
              aria-label="ปรับขนาดตัวอักษร"
            >
              ก
            </button>
            <BookmarkButton
              kind="article"
              id={article.id}
              addedMessage={`บันทึกมาตรา ${article.id}`}
            />
          </>
        }
      />

      <main className="page page--reader">
        {node ? <Breadcrumbs nodeId={node.id} current={`มาตรา ${article.id}`} /> : null}

        <div className="article-head">
          <p className="article-number">มาตรา {article.id}</p>
          {node ? (
            <Link to={routes.node(node.id)} className="article-location">
              {nodeLabel(node)}
              <Icon name="chevronRight" size={13} />
            </Link>
          ) : null}
        </div>

        <article className="article-body">
          {article.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {article.note ? <p className="article-note">{article.note}</p> : null}
        </article>

        {/* ส่วนฎีกา แยกจากตัวบทด้วยเส้นคั่นหนา เพื่อไม่ให้ผู้ใช้สับสนว่าเป็นตัวบท */}
        <SectionHeading
          title="ฎีกาที่เกี่ยวข้อง"
          meta={decisions.length > 0 ? `${decisions.length} รายการ` : 'ยังไม่มีข้อมูล'}
          divider
        />
        {decisions.length > 0 ? (
          <div className="list">
            {decisions.map((decision) => (
              <DecisionRow key={decision.id} decision={decision} />
            ))}
          </div>
        ) : (
          <EmptyState>
            ยังไม่มีคำพิพากษาฎีกาที่เชื่อมกับมาตรานี้
            <br />
            ส่วนนี้เตรียมไว้สำหรับข้อมูลที่จะเพิ่มในอนาคต
          </EmptyState>
        )}

        <p className="readonly-note">
          ตัวบทกฎหมายและคำพิพากษาเป็นข้อมูลอ่านอย่างเดียว · แก้ไขไม่ได้
        </p>
      </main>

      <PrevNextBar previousArticleId={previous} nextArticleId={next} />
    </>
  );
}