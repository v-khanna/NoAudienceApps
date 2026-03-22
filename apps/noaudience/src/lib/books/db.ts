/**
 * Books module database operations.
 *
 * Currently backed by mock data. When the SQLite backend is wired up,
 * swap the implementations to use drizzle-orm queries against the
 * books / book_shelves / book_progress / book_reviews / reading_challenges tables.
 */

import {
  mockBooks,
  mockShelves,
  mockShelfAssignments,
  mockProgress,
  mockReviews,
  mockChallenge,
  type Book,
  type BookShelf,
  type BookShelfAssignment,
  type BookProgressEntry,
  type BookReview,
  type ReadingChallenge,
} from './mock';

// ─── Books CRUD ─────────────────────────────────────────────────────────────

export function getAllBooks(): Book[] {
  return [...mockBooks];
}

export function getBookById(id: number): Book | undefined {
  return mockBooks.find((b) => b.id === id);
}

export function searchBooks(query: string): Book[] {
  const q = query.toLowerCase();
  return mockBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.includes(q)
  );
}

export function createBook(book: Omit<Book, 'id' | 'createdAt'>): Book {
  const newBook: Book = {
    ...book,
    id: mockBooks.length + 1,
    createdAt: new Date().toISOString(),
  };
  mockBooks.push(newBook);
  return newBook;
}

export function updateBook(id: number, updates: Partial<Book>): Book | undefined {
  const idx = mockBooks.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  mockBooks[idx] = { ...mockBooks[idx], ...updates };
  return mockBooks[idx];
}

export function deleteBook(id: number): boolean {
  const idx = mockBooks.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  mockBooks.splice(idx, 1);
  return true;
}

// ─── Shelves CRUD ───────────────────────────────────────────────────────────

export function getAllShelves(): BookShelf[] {
  return [...mockShelves];
}

export function getShelfById(id: number): BookShelf | undefined {
  return mockShelves.find((s) => s.id === id);
}

export function createShelf(name: string, exclusive = false): BookShelf {
  const shelf: BookShelf = {
    id: mockShelves.length + 1,
    name,
    exclusive,
    position: mockShelves.length,
  };
  mockShelves.push(shelf);
  return shelf;
}

export function deleteShelf(id: number): boolean {
  const idx = mockShelves.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  mockShelves.splice(idx, 1);
  return true;
}

// ─── Shelf Assignments ──────────────────────────────────────────────────────

export function getAssignmentsForShelf(shelfId: number): BookShelfAssignment[] {
  return mockShelfAssignments.filter((a) => a.shelfId === shelfId);
}

export function getAssignmentsForBook(bookId: number): BookShelfAssignment[] {
  return mockShelfAssignments.filter((a) => a.bookId === bookId);
}

export function getBooksOnShelf(shelfId: number): Book[] {
  const bookIds = mockShelfAssignments
    .filter((a) => a.shelfId === shelfId)
    .map((a) => a.bookId);
  return mockBooks.filter((b) => bookIds.includes(b.id));
}

export function getShelfBookCount(shelfId: number): number {
  return mockShelfAssignments.filter((a) => a.shelfId === shelfId).length;
}

export function assignBookToShelf(bookId: number, shelfId: number): BookShelfAssignment {
  const shelf = mockShelves.find((s) => s.id === shelfId);
  // If exclusive shelf, remove from other exclusive shelves first
  if (shelf?.exclusive) {
    const exclusiveIds = mockShelves.filter((s) => s.exclusive).map((s) => s.id);
    const toRemove = mockShelfAssignments
      .map((a, i) => ({ ...a, idx: i }))
      .filter((a) => a.bookId === bookId && exclusiveIds.includes(a.shelfId));
    toRemove.reverse().forEach((a) => mockShelfAssignments.splice(a.idx, 1));
  }
  const assignment: BookShelfAssignment = {
    id: mockShelfAssignments.length + 1,
    bookId,
    shelfId,
    assignedAt: new Date().toISOString(),
  };
  mockShelfAssignments.push(assignment);
  return assignment;
}

export function removeBookFromShelf(bookId: number, shelfId: number): boolean {
  const idx = mockShelfAssignments.findIndex(
    (a) => a.bookId === bookId && a.shelfId === shelfId
  );
  if (idx === -1) return false;
  mockShelfAssignments.splice(idx, 1);
  return true;
}

export function getExclusiveShelfForBook(bookId: number): BookShelf | undefined {
  const assignment = mockShelfAssignments.find((a) => {
    const shelf = mockShelves.find((s) => s.id === a.shelfId);
    return a.bookId === bookId && shelf?.exclusive;
  });
  if (!assignment) return undefined;
  return mockShelves.find((s) => s.id === assignment.shelfId);
}

export function getAllShelvesForBook(bookId: number): BookShelf[] {
  const shelfIds = mockShelfAssignments
    .filter((a) => a.bookId === bookId)
    .map((a) => a.shelfId);
  return mockShelves.filter((s) => shelfIds.includes(s.id));
}

// ─── Progress ───────────────────────────────────────────────────────────────

export function getProgressForBook(bookId: number): BookProgressEntry[] {
  return mockProgress
    .filter((p) => p.bookId === bookId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLatestProgress(bookId: number): BookProgressEntry | undefined {
  return getProgressForBook(bookId)[0];
}

export function addProgress(entry: Omit<BookProgressEntry, 'id' | 'createdAt'>): BookProgressEntry {
  const newEntry: BookProgressEntry = {
    ...entry,
    id: mockProgress.length + 1,
    createdAt: new Date().toISOString(),
  };
  mockProgress.push(newEntry);
  return newEntry;
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export function getReviewForBook(bookId: number): BookReview | undefined {
  return mockReviews.find((r) => r.bookId === bookId);
}

export function getAllReviews(): BookReview[] {
  return [...mockReviews];
}

export function createReview(review: Omit<BookReview, 'id' | 'createdAt'>): BookReview {
  const newReview: BookReview = {
    ...review,
    id: mockReviews.length + 1,
    createdAt: new Date().toISOString(),
  };
  mockReviews.push(newReview);
  return newReview;
}

export function updateReview(bookId: number, updates: Partial<BookReview>): BookReview | undefined {
  const idx = mockReviews.findIndex((r) => r.bookId === bookId);
  if (idx === -1) return undefined;
  mockReviews[idx] = { ...mockReviews[idx], ...updates };
  return mockReviews[idx];
}

// ─── Reading Challenge ──────────────────────────────────────────────────────

export function getChallenge(year: number): ReadingChallenge | undefined {
  return year === mockChallenge.year ? { ...mockChallenge } : undefined;
}

export function setChallenge(year: number, goal: number): ReadingChallenge {
  mockChallenge.year = year;
  mockChallenge.goal = goal;
  return { ...mockChallenge };
}

export function getBooksReadInYear(year: number): Book[] {
  const readShelf = mockShelves.find((s) => s.name === 'Read');
  if (!readShelf) return [];
  const bookIds = mockShelfAssignments
    .filter((a) => a.shelfId === readShelf.id && a.assignedAt.startsWith(String(year)))
    .map((a) => a.bookId);
  return mockBooks.filter((b) => bookIds.includes(b.id));
}

export function getCurrentlyReading(): Array<Book & { latestProgress: BookProgressEntry | undefined }> {
  const shelf = mockShelves.find((s) => s.name === 'Currently Reading');
  if (!shelf) return [];
  const books = getBooksOnShelf(shelf.id);
  return books.map((b) => ({ ...b, latestProgress: getLatestProgress(b.id) }));
}

export function getRecentlyRead(limit: number): Array<Book & { review: BookReview | undefined }> {
  const readShelf = mockShelves.find((s) => s.name === 'Read');
  if (!readShelf) return [];
  const assignments = mockShelfAssignments
    .filter((a) => a.shelfId === readShelf.id)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
  return assignments
    .slice(0, limit)
    .map((a) => {
      const book = mockBooks.find((b) => b.id === a.bookId);
      if (!book) return null;
      return { ...book, review: getReviewForBook(book.id) };
    })
    .filter(Boolean) as Array<Book & { review: BookReview | undefined }>;
}

export function getWantToRead(): Book[] {
  const shelf = mockShelves.find((s) => s.name === 'Want to Read');
  if (!shelf) return [];
  return getBooksOnShelf(shelf.id);
}

// ─── Stats helpers ──────────────────────────────────────────────────────────

export function getAllReadBooks(): Array<{ book: Book; review: BookReview | undefined; dateRead: string }> {
  const readShelf = mockShelves.find((s) => s.name === 'Read');
  if (!readShelf) return [];
  return mockShelfAssignments
    .filter((a) => a.shelfId === readShelf.id)
    .map((a) => {
      const book = mockBooks.find((b) => b.id === a.bookId);
      if (!book) return null;
      return { book, review: getReviewForBook(book.id), dateRead: a.assignedAt };
    })
    .filter(Boolean) as Array<{ book: Book; review: BookReview | undefined; dateRead: string }>;
}

export function getTotalPagesRead(): number {
  const readBooks = getAllReadBooks();
  return readBooks.reduce((sum, { book }) => sum + book.pageCount, 0);
}

export function getAverageRating(): number {
  const ratings = mockReviews.map((r) => r.rating).filter((r) => r > 0);
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}

export function getRatingDistribution(): Record<number, number> {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  mockReviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++;
  });
  return dist;
}

export function getGenreCounts(): Array<{ genre: string; count: number }> {
  const counts: Record<string, number> = {};
  const readBooks = getAllReadBooks();
  readBooks.forEach(({ book }) => {
    (book.genres || []).forEach((g) => {
      counts[g] = (counts[g] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAuthorCounts(): Array<{ author: string; count: number }> {
  const counts: Record<string, number> = {};
  const readBooks = getAllReadBooks();
  readBooks.forEach(({ book }) => {
    counts[book.author] = (counts[book.author] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count);
}

export function getBooksReadPerYear(): Array<{ year: number; count: number }> {
  const counts: Record<number, number> = {};
  const readShelf = mockShelves.find((s) => s.name === 'Read');
  if (!readShelf) return [];
  mockShelfAssignments
    .filter((a) => a.shelfId === readShelf.id)
    .forEach((a) => {
      const year = parseInt(a.assignedAt.substring(0, 4));
      counts[year] = (counts[year] || 0) + 1;
    });
  return Object.entries(counts)
    .map(([y, count]) => ({ year: parseInt(y), count }))
    .sort((a, b) => a.year - b.year);
}
