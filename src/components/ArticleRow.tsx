import { BookmarkButton } from '@/components/BookmarkButton';
import { Highlight } from '@/components/Highlight';
import { NavRow } from '@/components/NavRow';
import { cleanArticleId, defaultLawId, getArticlePreview, getLawIdForArticle, getLawMeta } from '@/lib/lawIndex';
import { truncate } from '@/lib/format';
import { routes } from '@/navigation/routes';

interface ArticleRowProps {
  articleId: string;
  query?: string;
  lawId?: string;
  showLawCode?: boolean;
}

export function ArticleRow({ articleId, query, lawId, showLawCode = false }: ArticleRowProps) {
  const resolvedLawId = getLawIdForArticle(articleId, lawId);
  const lawMeta = getLawMeta(resolvedLawId);
  const cleanId = cleanArticleId(articleId);
  const bookmarkId = resolvedLawId === defaultLawId ? cleanId : `${resolvedLawId}:${cleanId}`;

  return (
    <NavRow
      to={routes.article(cleanId, resolvedLawId)}
      title={
        <>
          {showLawCode && (
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                marginRight: '6px',
              }}
            >
              [{lawMeta.code}]
            </span>
          )}
          {cleanId === 'คำปรารภ' ? (
            <Highlight text="คำปรารภ" query={query} />
          ) : (
            <>
              มาตรา <Highlight text={cleanId} query={query} />
            </>
          )}
        </>
      }
      subtitle={
        <Highlight
          text={truncate(getArticlePreview(cleanId, resolvedLawId))}
          query={query}
        />
      }
      trailing={
        <BookmarkButton
          kind="article"
          id={bookmarkId}
          addedMessage={
            cleanId === 'คำปรารภ'
              ? `บันทึกคำปรารภ (${lawMeta.code})`
              : `บันทึกมาตรา ${cleanId} (${lawMeta.code})`
          }
        />
      }
    />
  );
}
