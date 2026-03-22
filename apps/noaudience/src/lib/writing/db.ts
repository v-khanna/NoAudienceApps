/**
 * Writing data layer — real SQLite via Drizzle ORM.
 */

import { getDb } from '$lib/db';
import { writings, writingLinks } from '@noaudience/core/db/schema';
import { eq, desc, like, or, sql } from 'drizzle-orm';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Writing = typeof writings.$inferSelect;
export type WritingLink = typeof writingLinks.$inferSelect;

export interface WritingFolder {
  name: string;
  writingCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, ' ').trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

function makeExcerpt(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
    .trim();
}

// ─── Writings CRUD ───────────────────────────────────────────────────────────

export async function getAllWritings(): Promise<Writing[]> {
  const db = getDb();
  return db.select().from(writings).orderBy(desc(writings.updatedAt));
}

export async function getWritingById(id: number): Promise<Writing | undefined> {
  const db = getDb();
  const rows = await db.select().from(writings).where(eq(writings.id, id)).limit(1);
  return rows[0];
}

export async function createWriting(): Promise<Writing> {
  const db = getDb();
  const now = new Date().toISOString();
  await db
    .insert(writings)
    .values({
      title: 'Untitled',
      contentMarkdown: '',
      contentHtml: '',
      wordCount: 0,
      tags: [],
      folder: null,
      createdAt: now,
      updatedAt: now,
    });

  const rows = await db
    .select()
    .from(writings)
    .orderBy(desc(writings.createdAt))
    .limit(1);
  return rows[0];
}

export async function updateWriting(
  id: number,
  updates: Partial<{
    title: string;
    contentMarkdown: string;
    contentHtml: string;
    tags: string[];
    folder: string | null;
  }>
): Promise<Writing | undefined> {
  const db = getDb();

  const values: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Auto-calculate word count from plain text content
  if (updates.contentHtml !== undefined) {
    values.wordCount = countWords(updates.contentHtml);
  }

  if (updates.tags !== undefined) {
    values.tags = updates.tags;
  }

  await db.update(writings).set(values).where(eq(writings.id, id));
  const rows = await db.select().from(writings).where(eq(writings.id, id)).limit(1);
  return rows[0];
}

export async function deleteWriting(id: number): Promise<boolean> {
  const db = getDb();
  // Delete associated links first
  await db.delete(writingLinks).where(eq(writingLinks.writingId, id));
  await db.delete(writings).where(eq(writings.id, id));
  return true;
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const allWritings = await getAllWritings();
  const tagMap = new Map<string, number>();
  for (const w of allWritings) {
    const tags = (w.tags as string[] | null) ?? [];
    for (const t of tags) {
      tagMap.set(t, (tagMap.get(t) || 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getWritingsByTag(tag: string): Promise<Writing[]> {
  const allWritings = await getAllWritings();
  return allWritings.filter((w) => {
    const tags = (w.tags as string[] | null) ?? [];
    return tags.includes(tag);
  });
}

// ─── Folders ─────────────────────────────────────────────────────────────────

export async function getAllFolders(): Promise<WritingFolder[]> {
  const db = getDb();
  const rows = await db
    .select({
      folder: writings.folder,
      count: sql<number>`count(*)`,
    })
    .from(writings)
    .where(sql`${writings.folder} IS NOT NULL AND ${writings.folder} != ''`)
    .groupBy(writings.folder);

  return rows.map((r) => ({
    name: r.folder!,
    writingCount: r.count,
  }));
}

export async function getWritingsByFolder(folder: string): Promise<Writing[]> {
  const db = getDb();
  return db
    .select()
    .from(writings)
    .where(eq(writings.folder, folder))
    .orderBy(desc(writings.updatedAt));
}

// ─── Search ──────────────────────────────────────────────────────────────────

export async function searchWritings(query: string): Promise<Writing[]> {
  const db = getDb();
  const pattern = `%${query}%`;
  return db
    .select()
    .from(writings)
    .where(
      or(
        like(writings.title, pattern),
        like(writings.contentMarkdown, pattern),
        like(writings.contentHtml, pattern)
      )
    )
    .orderBy(desc(writings.updatedAt));
}
