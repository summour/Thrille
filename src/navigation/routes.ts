/** แหล่งรวม path ทั้งหมดของแอป — แก้ที่นี่ที่เดียวเวลาปรับ URL */
export const routes = {
  home: '/',
  toc: (lawId?: string) => (lawId ? `/toc?law=${encodeURIComponent(lawId)}` : '/toc'),
  node: (nodeId: string, lawId?: string) =>
    lawId ? `/toc/${nodeId}?law=${encodeURIComponent(lawId)}` : `/toc/${nodeId}`,
  article: (articleId: string, lawId?: string) =>
    lawId
      ? `/article/${encodeURIComponent(articleId)}?law=${encodeURIComponent(lawId)}`
      : `/article/${encodeURIComponent(articleId)}`,
  decision: (decisionId: string) => `/decision/${decisionId}`,
  search: (query?: string, lawId?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (lawId) params.set('law', lawId);
    const qs = params.toString();
    return qs ? `/search?${qs}` : '/search';
  },
  bookmarks: '/bookmarks',
} as const;

export const routePatterns = {
  home: '/',
  toc: '/toc',
  node: '/toc/:nodeId',
  article: '/article/:articleId',
  decision: '/decision/:decisionId',
  search: '/search',
  bookmarks: '/bookmarks',
} as const;
