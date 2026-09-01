/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/store/useLocalStorage';
import type { BookmarkKind } from '@/types/law';

const RECENT_LIMIT = 20;

interface LibraryContextValue {
  bookmarkedArticleIds: string[];
  bookmarkedDecisionIds: string[];
  recentArticleIds: string[];
  isBookmarked: (kind: BookmarkKind, id: string) => boolean;
  /** คืนค่า true ถ้าเพิ่งเพิ่มเข้าไป, false ถ้าเพิ่งลบออก */
  toggleBookmark: (kind: BookmarkKind, id: string) => boolean;
  markAsRead: (articleId: string) => void;
  clearRecent: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useLocalStorage<string[]>(
    'clr.bookmarks.articles',
    [],
  );
  const [bookmarkedDecisionIds, setBookmarkedDecisionIds] = useLocalStorage<string[]>(
    'clr.bookmarks.decisions',
    [],
  );
  const [recentArticleIds, setRecentArticleIds, clearRecent] = useLocalStorage<string[]>(
    'clr.recent.articles',
    [],
  );

  const isBookmarked = useCallback(
    (kind: BookmarkKind, id: string) =>
      kind === 'article'
        ? bookmarkedArticleIds.includes(id)
        : bookmarkedDecisionIds.includes(id),
    [bookmarkedArticleIds, bookmarkedDecisionIds],
  );

  const toggleBookmark = useCallback(
    (kind: BookmarkKind, id: string) => {
      const setter = kind === 'article' ? setBookmarkedArticleIds : setBookmarkedDecisionIds;
      const current = kind === 'article' ? bookmarkedArticleIds : bookmarkedDecisionIds;
      const willAdd = !current.includes(id);
      setter((list) => (list.includes(id) ? list.filter((item) => item !== id) : [id, ...list]));
      return willAdd;
    },
    [bookmarkedArticleIds, bookmarkedDecisionIds, setBookmarkedArticleIds, setBookmarkedDecisionIds],
  );

  const markAsRead = useCallback(
    (articleId: string) => {
      setRecentArticleIds((list) =>
        [articleId, ...list.filter((item) => item !== articleId)].slice(0, RECENT_LIMIT),
      );
    },
    [setRecentArticleIds],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      bookmarkedArticleIds,
      bookmarkedDecisionIds,
      recentArticleIds,
      isBookmarked,
      toggleBookmark,
      markAsRead,
      clearRecent,
    }),
    [
      bookmarkedArticleIds,
      bookmarkedDecisionIds,
      recentArticleIds,
      isBookmarked,
      toggleBookmark,
      markAsRead,
      clearRecent,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within <LibraryProvider>');
  return context;
}