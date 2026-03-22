/**
 * Books module database operations.
 *
 * Backed by SQLite via Drizzle ORM (sqlite-proxy).
 */

import { getDb } from '$lib/db';
import {
  books,
  bookShelves,
  bookShelfAssignments,
  bookProgress,
  bookReviews,
  readingChallenges,
} from '@noaudience/core/db/schema';
import { eq, desc, like, or, and, asc, count, avg, sql, inArray } from 'drizzle-orm';

// Re-export types from mock for backwards compat with route imports
export type {
  Book,
  BookShelf,
  BookShelfAssignment,
  BookProgressEntry,
  BookReview,
  ReadingChallenge,
} from './mock';

import type {
  Book,
  BookShelf,
  BookShelfAssignment,
  BookProgressEntry,
  BookReview,
  ReadingChallenge,
} from './mock';

// ─── Helper to map DB row to app types ────────────────────────────────────

function mapBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? '',
    isbn: row.isbn ?? '',
    pageCount: row.pageCount ?? 0,
    publisher: row.publisher ?? '',
    publishDate: row.publishDate ?? '',
    description: row.description ?? '',
    genres: (row.genres as string[]) ?? [],
    coverPath: row.coverPath ?? '',
    createdAt: row.createdAt ?? '',
  };
}

function mapShelf(row: any): BookShelf {
  return {
    id: row.id,
    name: row.name,
    exclusive: !!row.exclusive,
    position: row.position ?? 0,
  };
}

function mapAssignment(row: any): BookShelfAssignment {
  return {
    id: row.id,
    bookId: row.bookId,
    shelfId: row.shelfId,
    assignedAt: row.assignedAt ?? '',
  };
}

function mapProgress(row: any): BookProgressEntry {
  return {
    id: row.id,
    bookId: row.bookId,
    progressType: row.progressType ?? 'page',
    progressValue: row.progressValue ?? 0,
    note: row.note ?? '',
    createdAt: row.createdAt ?? '',
  };
}

function mapReview(row: any): BookReview {
  return {
    id: row.id,
    bookId: row.bookId,
    rating: row.rating ?? 0,
    review: row.review ?? '',
    dateStarted: row.dateStarted ?? '',
    dateRead: row.dateRead ?? '',
    createdAt: row.createdAt ?? '',
  };
}

function mapChallenge(row: any): ReadingChallenge {
  return {
    id: row.id,
    year: row.year,
    goal: row.goal,
    createdAt: row.createdAt ?? '',
  };
}

// ─── Books CRUD ─────────────────────────────────────────────────────────────

export async function getAllBooks(): Promise<Book[]> {
  const db = getDb();
  const rows = await db.select().from(books).orderBy(desc(books.createdAt));
  return rows.map(mapBook);
}

export async function getBookById(id: number): Promise<Book | undefined> {
  const db = getDb();
  const rows = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return rows.length > 0 ? mapBook(rows[0]) : undefined;
}

export async function addBookFromOpenLibrary(result: {
  id: string;
  title: string;
  author: string;
  year: number;
  coverUrl: string;
  isbn: string;
  pageCount: number;
}): Promise<Book> {
  const db = getDb();

  // Check for existing book by ISBN
  if (result.isbn) {
    const existing = await db
      .select()
      .from(books)
      .where(eq(books.isbn, result.isbn))
      .limit(1);
    if (existing.length > 0) return mapBook(existing[0]);
  }

  await db
    .insert(books)
    .values({
      openlibraryId: result.id,
      title: result.title,
      author: result.author,
      isbn: result.isbn,
      pageCount: result.pageCount,
      coverPath: result.coverUrl,
      publishDate: result.year ? `${result.year}` : '',
      description: '',
      genres: [],
      publisher: '',
    });

  // Fetch back by ISBN or OpenLibrary ID
  const inserted = await db
    .select()
    .from(books)
    .where(result.isbn ? eq(books.isbn, result.isbn) : eq(books.openlibraryId, result.id))
    .limit(1);
  const book = mapBook(inserted[0]);

  // Auto-assign to "Want to Read" shelf
  const wantToRead = await db
    .select()
    .from(bookShelves)
    .where(eq(bookShelves.name, 'Want to Read'))
    .limit(1);

  if (wantToRead.length > 0) {
    await db.insert(bookShelfAssignments).values({
      bookId: book.id,
      shelfId: wantToRead[0].id,
    });
  }

  return book;
}

export async function searchBooks(query: string): Promise<Book[]> {
  const db = getDb();
  const q = `%${query}%`;
  const rows = await db
    .select()
    .from(books)
    .where(or(like(books.title, q), like(books.author, q), like(books.isbn, q)));
  return rows.map(mapBook);
}

export async function createBook(book: Omit<Book, 'id' | 'createdAt'>): Promise<Book> {
  const db = getDb();
  await db
    .insert(books)
    .values({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      pageCount: book.pageCount,
      publisher: book.publisher,
      publishDate: book.publishDate,
      description: book.description,
      genres: book.genres ?? [],
      coverPath: book.coverPath,
    });

  // Fetch back the most recently created book with this title
  const rows = await db
    .select()
    .from(books)
    .orderBy(desc(books.createdAt))
    .limit(1);
  return mapBook(rows[0]);
}

export async function updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined> {
  const db = getDb();
  const values: Record<string, unknown> = {};
  if (updates.title !== undefined) values.title = updates.title;
  if (updates.author !== undefined) values.author = updates.author;
  if (updates.isbn !== undefined) values.isbn = updates.isbn;
  if (updates.pageCount !== undefined) values.pageCount = updates.pageCount;
  if (updates.publisher !== undefined) values.publisher = updates.publisher;
  if (updates.publishDate !== undefined) values.publishDate = updates.publishDate;
  if (updates.description !== undefined) values.description = updates.description;
  if (updates.coverPath !== undefined) values.coverPath = updates.coverPath;

  if (updates.genres !== undefined) values.genres = updates.genres;

  if (Object.keys(values).length === 0) return getBookById(id);

  await db.update(books).set(values).where(eq(books.id, id));
  const rows = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return rows.length > 0 ? mapBook(rows[0]) : undefined;
}

export async function deleteBook(id: number): Promise<boolean> {
  const db = getDb();
  // Delete related records first
  await db.delete(bookShelfAssignments).where(eq(bookShelfAssignments.bookId, id));
  await db.delete(bookProgress).where(eq(bookProgress.bookId, id));
  await db.delete(bookReviews).where(eq(bookReviews.bookId, id));
  await db.delete(books).where(eq(books.id, id));
  return true;
}

// ─── Shelves CRUD ───────────────────────────────────────────────────────────

export async function getAllShelves(): Promise<BookShelf[]> {
  const db = getDb();
  const rows = await db.select().from(bookShelves).orderBy(asc(bookShelves.position));
  return rows.map(mapShelf);
}

export async function getShelfById(id: number): Promise<BookShelf | undefined> {
  const db = getDb();
  const rows = await db.select().from(bookShelves).where(eq(bookShelves.id, id)).limit(1);
  return rows.length > 0 ? mapShelf(rows[0]) : undefined;
}

export async function createShelf(name: string, exclusive = false): Promise<BookShelf> {
  const db = getDb();
  // Get max position
  const maxPos = await db
    .select({ maxPos: sql<number>`coalesce(max(${bookShelves.position}), -1)` })
    .from(bookShelves);
  const position = (maxPos[0]?.maxPos ?? -1) + 1;

  await db.insert(bookShelves).values({ name, exclusive, position });
  const rows = await db
    .select()
    .from(bookShelves)
    .where(eq(bookShelves.name, name))
    .limit(1);
  return mapShelf(rows[0]);
}

export async function deleteShelf(id: number): Promise<boolean> {
  const db = getDb();
  await db.delete(bookShelfAssignments).where(eq(bookShelfAssignments.shelfId, id));
  await db.delete(bookShelves).where(eq(bookShelves.id, id));
  return true;
}

// ─── Shelf Assignments ──────────────────────────────────────────────────────

export async function getAssignmentsForShelf(shelfId: number): Promise<BookShelfAssignment[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(bookShelfAssignments)
    .where(eq(bookShelfAssignments.shelfId, shelfId));
  return rows.map(mapAssignment);
}

export async function getAssignmentsForBook(bookId: number): Promise<BookShelfAssignment[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(bookShelfAssignments)
    .where(eq(bookShelfAssignments.bookId, bookId));
  return rows.map(mapAssignment);
}

export async function getBooksOnShelf(shelfId: number): Promise<Book[]> {
  const db = getDb();
  const rows = await db
    .select({ book: books })
    .from(bookShelfAssignments)
    .innerJoin(books, eq(bookShelfAssignments.bookId, books.id))
    .where(eq(bookShelfAssignments.shelfId, shelfId));
  return rows.map((r) => mapBook(r.book));
}

export async function getShelfBookCount(shelfId: number): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ cnt: count() })
    .from(bookShelfAssignments)
    .where(eq(bookShelfAssignments.shelfId, shelfId));
  return result[0]?.cnt ?? 0;
}

export async function assignBookToShelf(
  bookId: number,
  shelfId: number
): Promise<BookShelfAssignment> {
  const db = getDb();

  // Check if target shelf is exclusive
  const shelf = await getShelfById(shelfId);
  if (shelf?.exclusive) {
    // Get all exclusive shelf IDs
    const exclusiveShelves = await db
      .select({ id: bookShelves.id })
      .from(bookShelves)
      .where(eq(bookShelves.exclusive, true));
    const exclusiveIds = exclusiveShelves.map((s) => s.id);

    // Remove this book from any exclusive shelf
    if (exclusiveIds.length > 0) {
      await db
        .delete(bookShelfAssignments)
        .where(
          and(
            eq(bookShelfAssignments.bookId, bookId),
            inArray(bookShelfAssignments.shelfId, exclusiveIds)
          )
        );
    }
  }

  await db.insert(bookShelfAssignments).values({ bookId, shelfId });
  const rows = await db
    .select()
    .from(bookShelfAssignments)
    .where(and(eq(bookShelfAssignments.bookId, bookId), eq(bookShelfAssignments.shelfId, shelfId)))
    .limit(1);
  return mapAssignment(rows[0]);
}

export async function removeBookFromShelf(bookId: number, shelfId: number): Promise<boolean> {
  const db = getDb();
  await db
    .delete(bookShelfAssignments)
    .where(
      and(eq(bookShelfAssignments.bookId, bookId), eq(bookShelfAssignments.shelfId, shelfId))
    );
  return true;
}

export async function getExclusiveShelfForBook(bookId: number): Promise<BookShelf | undefined> {
  const db = getDb();
  const rows = await db
    .select({ shelf: bookShelves })
    .from(bookShelfAssignments)
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(and(eq(bookShelfAssignments.bookId, bookId), eq(bookShelves.exclusive, true)))
    .limit(1);
  return rows.length > 0 ? mapShelf(rows[0].shelf) : undefined;
}

export async function getAllShelvesForBook(bookId: number): Promise<BookShelf[]> {
  const db = getDb();
  const rows = await db
    .select({ shelf: bookShelves })
    .from(bookShelfAssignments)
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(eq(bookShelfAssignments.bookId, bookId));
  return rows.map((r) => mapShelf(r.shelf));
}

// ─── Progress ───────────────────────────────────────────────────────────────

export async function getProgressForBook(bookId: number): Promise<BookProgressEntry[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(bookProgress)
    .where(eq(bookProgress.bookId, bookId))
    .orderBy(desc(bookProgress.createdAt));
  return rows.map(mapProgress);
}

export async function getLatestProgress(
  bookId: number
): Promise<BookProgressEntry | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(bookProgress)
    .where(eq(bookProgress.bookId, bookId))
    .orderBy(desc(bookProgress.createdAt))
    .limit(1);
  return rows.length > 0 ? mapProgress(rows[0]) : undefined;
}

export async function addProgress(
  entry: Omit<BookProgressEntry, 'id' | 'createdAt'>
): Promise<BookProgressEntry> {
  const db = getDb();
  await db.insert(bookProgress).values({
    bookId: entry.bookId,
    progressType: entry.progressType,
    progressValue: entry.progressValue,
    note: entry.note,
  });
  const rows = await db
    .select()
    .from(bookProgress)
    .where(eq(bookProgress.bookId, entry.bookId))
    .orderBy(desc(bookProgress.createdAt))
    .limit(1);
  return mapProgress(rows[0]);
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export async function getReviewForBook(bookId: number): Promise<BookReview | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(bookReviews)
    .where(eq(bookReviews.bookId, bookId))
    .limit(1);
  return rows.length > 0 ? mapReview(rows[0]) : undefined;
}

export async function getAllReviews(): Promise<BookReview[]> {
  const db = getDb();
  const rows = await db.select().from(bookReviews).orderBy(desc(bookReviews.createdAt));
  return rows.map(mapReview);
}

export async function createReview(
  review: Omit<BookReview, 'id' | 'createdAt'>
): Promise<BookReview> {
  const db = getDb();
  await db.insert(bookReviews).values({
    bookId: review.bookId,
    rating: review.rating,
    review: review.review,
    dateStarted: review.dateStarted || null,
    dateRead: review.dateRead || null,
  });
  const rows = await db
    .select()
    .from(bookReviews)
    .where(eq(bookReviews.bookId, review.bookId))
    .limit(1);
  return mapReview(rows[0]);
}

export async function updateReview(
  bookId: number,
  updates: Partial<BookReview>
): Promise<BookReview | undefined> {
  const db = getDb();
  const values: Record<string, unknown> = {};
  if (updates.rating !== undefined) values.rating = updates.rating;
  if (updates.review !== undefined) values.review = updates.review;
  if (updates.dateStarted !== undefined) values.dateStarted = updates.dateStarted || null;
  if (updates.dateRead !== undefined) values.dateRead = updates.dateRead || null;

  if (Object.keys(values).length === 0) return getReviewForBook(bookId);

  await db.update(bookReviews).set(values).where(eq(bookReviews.bookId, bookId));
  const rows = await db
    .select()
    .from(bookReviews)
    .where(eq(bookReviews.bookId, bookId))
    .limit(1);
  return rows.length > 0 ? mapReview(rows[0]) : undefined;
}

// ─── Reading Challenge ──────────────────────────────────────────────────────

export async function getChallenge(year: number): Promise<ReadingChallenge | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(readingChallenges)
    .where(eq(readingChallenges.year, year))
    .limit(1);
  return rows.length > 0 ? mapChallenge(rows[0]) : undefined;
}

export async function setChallenge(year: number, goal: number): Promise<ReadingChallenge> {
  const db = getDb();
  // Check if challenge exists for this year
  const existing = await getChallenge(year);
  if (existing) {
    await db.update(readingChallenges).set({ goal }).where(eq(readingChallenges.year, year));
  } else {
    await db.insert(readingChallenges).values({ year, goal });
  }
  const rows = await db
    .select()
    .from(readingChallenges)
    .where(eq(readingChallenges.year, year))
    .limit(1);
  return mapChallenge(rows[0]);
}

export async function getBooksReadInYear(year: number): Promise<Book[]> {
  const db = getDb();
  const yearStr = String(year);
  const rows = await db
    .select({ book: books })
    .from(bookShelfAssignments)
    .innerJoin(books, eq(bookShelfAssignments.bookId, books.id))
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(
      and(
        eq(bookShelves.name, 'Read'),
        like(bookShelfAssignments.assignedAt, `${yearStr}%`)
      )
    );
  return rows.map((r) => mapBook(r.book));
}

export async function getCurrentlyReading(): Promise<
  Array<Book & { latestProgress: BookProgressEntry | undefined }>
> {
  const db = getDb();
  const rows = await db
    .select({ book: books })
    .from(bookShelfAssignments)
    .innerJoin(books, eq(bookShelfAssignments.bookId, books.id))
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(eq(bookShelves.name, 'Currently Reading'));

  const result: Array<Book & { latestProgress: BookProgressEntry | undefined }> = [];
  for (const row of rows) {
    const book = mapBook(row.book);
    const progress = await getLatestProgress(book.id);
    result.push({ ...book, latestProgress: progress });
  }
  return result;
}

export async function getRecentlyRead(
  limit: number
): Promise<Array<Book & { review: BookReview | undefined }>> {
  const db = getDb();
  const rows = await db
    .select({ book: books, assignedAt: bookShelfAssignments.assignedAt })
    .from(bookShelfAssignments)
    .innerJoin(books, eq(bookShelfAssignments.bookId, books.id))
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(eq(bookShelves.name, 'Read'))
    .orderBy(desc(bookShelfAssignments.assignedAt))
    .limit(limit);

  const result: Array<Book & { review: BookReview | undefined }> = [];
  for (const row of rows) {
    const book = mapBook(row.book);
    const review = await getReviewForBook(book.id);
    result.push({ ...book, review });
  }
  return result;
}

export async function getWantToRead(): Promise<Book[]> {
  const db = getDb();
  const rows = await db
    .select({ book: books })
    .from(bookShelfAssignments)
    .innerJoin(books, eq(bookShelfAssignments.bookId, books.id))
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(eq(bookShelves.name, 'Want to Read'));
  return rows.map((r) => mapBook(r.book));
}

// ─── Stats helpers ──────────────────────────────────────────────────────────

export async function getAllReadBooks(): Promise<
  Array<{ book: Book; review: BookReview | undefined; dateRead: string }>
> {
  const db = getDb();
  const rows = await db
    .select({ book: books, assignedAt: bookShelfAssignments.assignedAt })
    .from(bookShelfAssignments)
    .innerJoin(books, eq(bookShelfAssignments.bookId, books.id))
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(eq(bookShelves.name, 'Read'));

  const result: Array<{ book: Book; review: BookReview | undefined; dateRead: string }> = [];
  for (const row of rows) {
    const book = mapBook(row.book);
    const review = await getReviewForBook(book.id);
    result.push({ book, review, dateRead: row.assignedAt ?? '' });
  }
  return result;
}

export async function getTotalPagesRead(): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ total: sql<number>`coalesce(sum(${books.pageCount}), 0)` })
    .from(bookShelfAssignments)
    .innerJoin(books, eq(bookShelfAssignments.bookId, books.id))
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(eq(bookShelves.name, 'Read'));
  return result[0]?.total ?? 0;
}

export async function getAverageRating(): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ avg: sql<number>`coalesce(avg(${bookReviews.rating}), 0)` })
    .from(bookReviews)
    .where(sql`${bookReviews.rating} > 0`);
  return result[0]?.avg ?? 0;
}

export async function getRatingDistribution(): Promise<Record<number, number>> {
  const db = getDb();
  const rows = await db
    .select({ rating: bookReviews.rating, cnt: count() })
    .from(bookReviews)
    .where(sql`${bookReviews.rating} >= 1 AND ${bookReviews.rating} <= 5`)
    .groupBy(bookReviews.rating);

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) {
    if (row.rating !== null) dist[row.rating] = row.cnt;
  }
  return dist;
}

export async function getGenreCounts(): Promise<Array<{ genre: string; count: number }>> {
  // SQLite doesn't have native JSON array iteration, so we fetch read books and count in JS
  const readBooks = await getAllReadBooks();
  const counts: Record<string, number> = {};
  readBooks.forEach(({ book }) => {
    (book.genres || []).forEach((g) => {
      counts[g] = (counts[g] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAuthorCounts(): Promise<Array<{ author: string; count: number }>> {
  const db = getDb();
  const rows = await db
    .select({ author: books.author, cnt: count() })
    .from(bookShelfAssignments)
    .innerJoin(books, eq(bookShelfAssignments.bookId, books.id))
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(eq(bookShelves.name, 'Read'))
    .groupBy(books.author)
    .orderBy(desc(count()));

  return rows.map((r) => ({ author: r.author ?? 'Unknown', count: r.cnt }));
}

export async function getBooksReadPerYear(): Promise<Array<{ year: number; count: number }>> {
  const db = getDb();
  const rows = await db
    .select({
      year: sql<number>`cast(substr(${bookShelfAssignments.assignedAt}, 1, 4) as integer)`,
      cnt: count(),
    })
    .from(bookShelfAssignments)
    .innerJoin(bookShelves, eq(bookShelfAssignments.shelfId, bookShelves.id))
    .where(eq(bookShelves.name, 'Read'))
    .groupBy(sql`substr(${bookShelfAssignments.assignedAt}, 1, 4)`)
    .orderBy(asc(sql`substr(${bookShelfAssignments.assignedAt}, 1, 4)`));

  return rows.map((r) => ({ year: r.year, count: r.cnt }));
}
