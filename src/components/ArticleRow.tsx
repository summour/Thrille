import { BookmarkButton } from '@/components/BookmarkButton';
import { Highlight } from '@/components/Highlight';
import { NavRow } from '@/components/NavRow';
import { getArticlePreview, getLawIdForArticle, getLawMeta } from '@/lib/lawIndex';
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

  return (
    <NavRow
      to={routes.article(articleId, resolvedLawId)}
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
          มาตรา <Highlight text={articleId} query={query} />
        </>
      }
      subtitle={
        <Highlight
          text={truncate(getArticlePreview(articleId, resolvedLawId))}
          query={query}
        />
      }
      trailing={
        <BookmarkButton
          kind="article"
          id={articleId}
          addedMessage={`บันทึกมาตรา ${articleId} (${lawMeta.code})`}
        />
      }
    />
  );
}
