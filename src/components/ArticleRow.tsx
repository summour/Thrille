import { BookmarkButton } from '@/components/BookmarkButton';
import { Highlight } from '@/components/Highlight';
import { NavRow } from '@/components/NavRow';
import { getArticlePreview } from '@/lib/lawIndex';
import { truncate } from '@/lib/format';
import { routes } from '@/navigation/routes';

interface ArticleRowProps {
  articleId: string;
  query?: string;
}

export function ArticleRow({ articleId, query }: ArticleRowProps) {
  return (
    <NavRow
      to={routes.article(articleId)}
      title={<>มาตรา <Highlight text={articleId} query={query} /></>}
      subtitle={<Highlight text={truncate(getArticlePreview(articleId))} query={query} />}
      trailing={
        <BookmarkButton kind="article" id={articleId} addedMessage={`บันทึกมาตรา ${articleId}`} />
      }
    />
  );
}