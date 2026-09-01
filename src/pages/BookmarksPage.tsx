import { useState } from 'react';
import { ArticleRow } from '@/components/ArticleRow';
import { DecisionRow } from '@/components/DecisionRow';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { PageHeader } from '@/layouts/PageHeader';
import { getDecision } from '@/lib/lawIndex';
import { useLibrary } from '@/store/LibraryContext';
import type { BookmarkKind } from '@/types/law';

export function BookmarksPage() {
  const { bookmarkedArticleIds, bookmarkedDecisionIds } = useLibrary();
  const [tab, setTab] = useState<BookmarkKind>('article');

  const decisions = bookmarkedDecisionIds
    .map((id) => getDecision(id))
    .filter((decision): decision is NonNullable<typeof decision> => Boolean(decision));

  return (
    <>
      <PageHeader title="ที่บันทึกไว้" showBack={false} />

      <FilterChips
        ariaLabel="ประเภทรายการที่บันทึก"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'article', label: `มาตรา ${bookmarkedArticleIds.length}` },
          { value: 'decision', label: `ฎีกา ${bookmarkedDecisionIds.length}` },
        ]}
      />

      <main className="page">
        {tab === 'article' ? (
          bookmarkedArticleIds.length > 0 ? (
            <div className="list">
              {bookmarkedArticleIds.map((articleId) => (
                <ArticleRow key={articleId} articleId={articleId} />
              ))}
            </div>
          ) : (
            <EmptyState>
              ยังไม่มีมาตราที่บันทึก
              <br />
              แตะไอคอนบุ๊กมาร์กในหน้ามาตราเพื่อเก็บไว้อ่านซ้ำ
            </EmptyState>
          )
        ) : decisions.length > 0 ? (
          <div className="list">
            {decisions.map((decision) => (
              <DecisionRow key={decision.id} decision={decision} />
            ))}
          </div>
        ) : (
          <EmptyState>ยังไม่มีฎีกาที่บันทึก</EmptyState>
        )}

        <p className="note">แตะไอคอนบุ๊กมาร์กซ้ำเพื่อลบออกจากรายการ</p>
      </main>
    </>
  );
}