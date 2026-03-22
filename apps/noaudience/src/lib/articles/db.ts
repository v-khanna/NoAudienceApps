// Articles data layer — real Drizzle queries against SQLite

import { getDb } from '$lib/db';
import { articles, feeds, highlights } from '@noaudience/core/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

// ─── Article types ──────────────────────────────────────────────────────────

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Highlight = typeof highlights.$inferSelect;
export type NewHighlight = typeof highlights.$inferInsert;
export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;

// ─── Articles ───────────────────────────────────────────────────────────────

export async function getAllArticles(): Promise<Article[]> {
  const db = getDb();
  return db.select().from(articles).orderBy(desc(articles.createdAt));
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const db = getDb();
  const rows = await db.select().from(articles).where(eq(articles.id, id));
  return rows[0];
}

export async function getOwnPosts(): Promise<Article[]> {
  const db = getDb();
  return db.select().from(articles).where(eq(articles.isOwnPost, true)).orderBy(desc(articles.datePublished));
}

export async function getSavedArticles(): Promise<Article[]> {
  const db = getDb();
  return db.select().from(articles).where(eq(articles.isOwnPost, false)).orderBy(desc(articles.createdAt));
}

export async function searchArticles(query: string): Promise<Article[]> {
  const db = getDb();
  const pattern = `%${query}%`;
  return db
    .select()
    .from(articles)
    .where(
      or(
        like(articles.title, pattern),
        like(articles.author, pattern),
        like(articles.publication, pattern),
      ),
    )
    .orderBy(desc(articles.createdAt));
}

export async function addArticle(article: Omit<NewArticle, 'id' | 'createdAt'>): Promise<Article> {
  const db = getDb();
  await db.insert(articles).values(article);
  const rows = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .limit(1);
  return rows[0];
}

export async function deleteArticle(id: number): Promise<void> {
  const db = getDb();
  await db.delete(highlights).where(eq(highlights.articleId, id));
  await db.delete(articles).where(eq(articles.id, id));
}

// ─── Highlights ─────────────────────────────────────────────────────────────

export async function getHighlightsByArticle(articleId: number): Promise<Highlight[]> {
  const db = getDb();
  return db.select().from(highlights).where(eq(highlights.articleId, articleId)).orderBy(highlights.positionStart);
}

export async function getAllHighlights(): Promise<Highlight[]> {
  const db = getDb();
  return db.select().from(highlights).orderBy(desc(highlights.createdAt));
}

export async function addHighlight(highlight: Omit<NewHighlight, 'id' | 'createdAt'>): Promise<Highlight> {
  const db = getDb();
  await db.insert(highlights).values(highlight);
  const articleId = highlight.articleId;
  const rows =
    articleId != null
      ? await db
          .select()
          .from(highlights)
          .where(eq(highlights.articleId, articleId))
          .orderBy(desc(highlights.createdAt))
          .limit(1)
      : await db.select().from(highlights).orderBy(desc(highlights.createdAt)).limit(1);
  return rows[0];
}

export async function updateHighlightNote(id: number, note: string): Promise<void> {
  const db = getDb();
  await db.update(highlights).set({ note }).where(eq(highlights.id, id));
}

export async function deleteHighlight(id: number): Promise<void> {
  const db = getDb();
  await db.delete(highlights).where(eq(highlights.id, id));
}

// ─── Feeds ──────────────────────────────────────────────────────────────────

export async function getAllFeeds(): Promise<Feed[]> {
  const db = getDb();
  return db.select().from(feeds).orderBy(desc(feeds.createdAt));
}

export async function addFeed(feed: Omit<NewFeed, 'id' | 'createdAt'>): Promise<Feed> {
  const db = getDb();
  await db.insert(feeds).values(feed);
  const rows = await db
    .select()
    .from(feeds)
    .orderBy(desc(feeds.createdAt))
    .limit(1);
  return rows[0];
}

export async function deleteFeed(id: number): Promise<void> {
  const db = getDb();
  await db.delete(feeds).where(eq(feeds.id, id));
}

export async function updateFeedSyncTime(id: number): Promise<void> {
  const db = getDb();
  await db.update(feeds).set({ lastSyncedAt: new Date().toISOString() }).where(eq(feeds.id, id));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export async function getAllArticleUrls(): Promise<Set<string>> {
  const db = getDb();
  const rows = await db.select({ sourceUrl: articles.sourceUrl }).from(articles);
  return new Set(rows.map((r) => r.sourceUrl).filter((u): u is string => !!u));
}
