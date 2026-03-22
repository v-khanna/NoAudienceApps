// Articles CRUD functions (mock implementation — no real DB calls yet)

import {
  mockArticles,
  mockHighlights,
  mockFeeds,
  type Article,
  type Highlight,
  type Feed,
} from './mock';

// ─── Articles ─────────────────────────────────────────────────────────────

let articles = $state<Article[]>([...mockArticles]);
let highlights = $state<Highlight[]>([...mockHighlights]);
let feeds = $state<Feed[]>([...mockFeeds]);

export function getAllArticles(): Article[] {
  return articles;
}

export function getArticleById(id: number): Article | undefined {
  return articles.find((a) => a.id === id);
}

export function getOwnPosts(): Article[] {
  return articles.filter((a) => a.isOwnPost);
}

export function getSavedArticles(): Article[] {
  return articles.filter((a) => !a.isOwnPost);
}

export function getArticlesByFeed(feedId: number): Article[] {
  return articles.filter((a) => a.feedId === feedId);
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q)
  );
}

export function addArticle(article: Omit<Article, 'id' | 'createdAt'>): Article {
  const newArticle: Article = {
    ...article,
    id: Math.max(0, ...articles.map((a) => a.id)) + 1,
    createdAt: new Date().toISOString(),
  };
  articles = [...articles, newArticle];
  return newArticle;
}

export function deleteArticle(id: number): void {
  articles = articles.filter((a) => a.id !== id);
  highlights = highlights.filter((h) => h.articleId !== id);
}

// ─── Highlights ───────────────────────────────────────────────────────────

export function getHighlightsByArticle(articleId: number): Highlight[] {
  return highlights.filter((h) => h.articleId === articleId);
}

export function getAllHighlights(): Highlight[] {
  return highlights;
}

export function getHighlightsByColor(color: string): Highlight[] {
  return highlights.filter((h) => h.color === color);
}

export function searchHighlights(query: string): Highlight[] {
  const q = query.toLowerCase();
  return highlights.filter(
    (h) =>
      h.textExact.toLowerCase().includes(q) ||
      h.note.toLowerCase().includes(q)
  );
}

export function addHighlight(highlight: Omit<Highlight, 'id' | 'createdAt'>): Highlight {
  const newHighlight: Highlight = {
    ...highlight,
    id: Math.max(0, ...highlights.map((h) => h.id)) + 1,
    createdAt: new Date().toISOString(),
  };
  highlights = [...highlights, newHighlight];
  return newHighlight;
}

export function updateHighlightNote(id: number, note: string): void {
  highlights = highlights.map((h) => (h.id === id ? { ...h, note } : h));
}

export function deleteHighlight(id: number): void {
  highlights = highlights.filter((h) => h.id !== id);
}

// ─── Feeds ────────────────────────────────────────────────────────────────

export function getAllFeeds(): Feed[] {
  return feeds;
}

export function addFeed(feed: Omit<Feed, 'id' | 'createdAt' | 'lastSyncedAt'>): Feed {
  const newFeed: Feed = {
    ...feed,
    id: Math.max(0, ...feeds.map((f) => f.id)) + 1,
    lastSyncedAt: null,
    createdAt: new Date().toISOString(),
  };
  feeds = [...feeds, newFeed];
  return newFeed;
}

export function deleteFeed(id: number): void {
  feeds = feeds.filter((f) => f.id !== id);
}

export function updateFeedSyncTime(id: number): void {
  feeds = feeds.map((f) =>
    f.id === id ? { ...f, lastSyncedAt: new Date().toISOString() } : f
  );
}
