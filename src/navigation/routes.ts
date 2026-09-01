/** แหล่งรวม path ทั้งหมดของแอป — แก้ที่นี่ที่เดียวเวลาปรับ URL */
export const routes = {
  home: '/',
  toc: '/toc',
  node: (nodeId: string) => `/toc/${nodeId}`,
  article: (articleId: string) => `/article/${encodeURIComponent(articleId)}`,
  decision: (decisionId: string) => `/decision/${decisionId}`,
  search: (query?: string) =>
    query ? `/search?q=${encodeURIComponent(query)}` : '/search',
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