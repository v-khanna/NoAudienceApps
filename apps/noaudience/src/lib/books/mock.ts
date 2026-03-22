// ─── Types ──────────────────────────────────────────────────────────────────

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  pageCount: number;
  publisher: string;
  publishDate: string;
  description: string;
  genres: string[];
  coverPath: string;
  createdAt: string;
}

export interface BookShelf {
  id: number;
  name: string;
  exclusive: boolean;
  position: number;
}

export interface BookShelfAssignment {
  id: number;
  bookId: number;
  shelfId: number;
  assignedAt: string;
}

export interface BookProgressEntry {
  id: number;
  bookId: number;
  progressType: 'page' | 'percent';
  progressValue: number;
  note: string;
  createdAt: string;
}

export interface BookReview {
  id: number;
  bookId: number;
  rating: number;
  review: string;
  dateStarted: string;
  dateRead: string;
  createdAt: string;
}

export interface ReadingChallenge {
  id: number;
  year: number;
  goal: number;
  createdAt: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

export const mockBooks: Book[] = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    pageCount: 180,
    publisher: 'Scribner',
    publishDate: '1925-04-10',
    description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted "ichmaking has become a nuisance in the summer colony." A portrait of the Jazz Age in all of its decadence and excess, The Great Gatsby captured the spirit of the author\'s generation and has resonated with readers ever since.',
    genres: ['fiction', 'classics', 'literary fiction'],
    coverPath: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    pageCount: 336,
    publisher: 'Harper Perennial',
    publishDate: '1960-07-11',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. "To Kill A Mockingbird" became both an instant bestseller and a critical success when it was first published in 1960. It went on to win the Pulitzer Prize in 1961 and was later made into an Academy Award-winning film.',
    genres: ['fiction', 'classics', 'historical fiction'],
    coverPath: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    createdAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    pageCount: 328,
    publisher: 'Signet Classic',
    publishDate: '1949-06-08',
    description: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its dystopian purgatory becomes more real. Published in 1949, the book offers political satirist George Orwell\'s nightmarish vision of a totalitarian, bureaucratic world and one poor stiff\'s attempt to find individuality.',
    genres: ['fiction', 'dystopian', 'science fiction', 'classics'],
    coverPath: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 4,
    title: 'On the Road',
    author: 'Jack Kerouac',
    isbn: '9780140283334',
    pageCount: 307,
    publisher: 'Penguin Books',
    publishDate: '1957-09-05',
    description: 'On the Road chronicles Jack Kerouac\'s years traveling the North American continent with his friend Neal Cassady, "a sideburned hero of the snowy West." As "ichfather" of the Beats and a primary figure of the counterculture, Kerouac has influenced generations of writers and artists.',
    genres: ['fiction', 'classics', 'travel', 'beat generation'],
    coverPath: 'https://covers.openlibrary.org/b/isbn/9780140283334-L.jpg',
    createdAt: '2025-03-05T10:00:00Z',
  },
  {
    id: 5,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isbn: '9780316769488',
    pageCount: 277,
    publisher: 'Little, Brown and Company',
    publishDate: '1951-07-16',
    description: 'The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield. Through circumstances that tend to preclude adult, rational control, Holden finds himself alone in the big city on a Saturday night in December.',
    genres: ['fiction', 'classics', 'coming of age'],
    coverPath: 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg',
    createdAt: '2025-03-20T10:00:00Z',
  },
  {
    id: 6,
    title: 'Beloved',
    author: 'Toni Morrison',
    isbn: '9780679720201',
    pageCount: 324,
    publisher: 'Vintage',
    publishDate: '1987-09-02',
    description: 'Staring unflinchingly into the abyss of slavery, this spellbinding novel transforms history into a story as powerful as Exodus and as intimate as a lullaby. Sethe was born a slave and escaped to Ohio, but eighteen years later she is still not free.',
    genres: ['fiction', 'classics', 'historical fiction', 'african american'],
    coverPath: 'https://covers.openlibrary.org/b/isbn/9780679720201-L.jpg',
    createdAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 7,
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '9780062316097',
    pageCount: 464,
    publisher: 'Harper',
    publishDate: '2015-02-10',
    description: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be "human."',
    genres: ['nonfiction', 'history', 'science', 'anthropology'],
    coverPath: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    createdAt: '2025-05-10T10:00:00Z',
  },
  {
    id: 8,
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780385333481',
    pageCount: 688,
    publisher: 'Ace',
    publishDate: '1965-08-01',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange, a drug capable of extending life and expanding consciousness.',
    genres: ['science fiction', 'fiction', 'fantasy', 'classics'],
    coverPath: 'https://covers.openlibrary.org/b/isbn/9780385333481-L.jpg',
    createdAt: '2025-06-01T10:00:00Z',
  },
];

export const mockShelves: BookShelf[] = [
  { id: 1, name: 'Want to Read', exclusive: true, position: 0 },
  { id: 2, name: 'Currently Reading', exclusive: true, position: 1 },
  { id: 3, name: 'Read', exclusive: true, position: 2 },
  { id: 4, name: 'Favorites', exclusive: false, position: 3 },
  { id: 5, name: 'Sci-Fi Picks', exclusive: false, position: 4 },
];

export const mockShelfAssignments: BookShelfAssignment[] = [
  // Currently reading
  { id: 1, bookId: 4, shelfId: 2, assignedAt: '2026-03-01T10:00:00Z' },
  { id: 2, bookId: 7, shelfId: 2, assignedAt: '2026-03-10T10:00:00Z' },
  // Read
  { id: 3, bookId: 1, shelfId: 3, assignedAt: '2025-06-15T10:00:00Z' },
  { id: 4, bookId: 2, shelfId: 3, assignedAt: '2025-08-20T10:00:00Z' },
  { id: 5, bookId: 3, shelfId: 3, assignedAt: '2025-10-05T10:00:00Z' },
  { id: 6, bookId: 5, shelfId: 3, assignedAt: '2025-12-01T10:00:00Z' },
  { id: 7, bookId: 6, shelfId: 3, assignedAt: '2026-01-15T10:00:00Z' },
  { id: 8, bookId: 8, shelfId: 3, assignedAt: '2026-02-20T10:00:00Z' },
  // Want to read (none currently, the two are being read)
  // Favorites
  { id: 9, bookId: 1, shelfId: 4, assignedAt: '2025-06-16T10:00:00Z' },
  { id: 10, bookId: 8, shelfId: 4, assignedAt: '2026-02-21T10:00:00Z' },
  { id: 11, bookId: 3, shelfId: 4, assignedAt: '2025-10-06T10:00:00Z' },
  // Sci-Fi Picks
  { id: 12, bookId: 3, shelfId: 5, assignedAt: '2025-10-06T10:00:00Z' },
  { id: 13, bookId: 8, shelfId: 5, assignedAt: '2026-02-21T10:00:00Z' },
];

export const mockProgress: BookProgressEntry[] = [
  // On the Road — currently reading, at page 142 of 307
  { id: 1, bookId: 4, progressType: 'page', progressValue: 142, note: 'Really enjoying the Denver section', createdAt: '2026-03-15T10:00:00Z' },
  { id: 2, bookId: 4, progressType: 'page', progressValue: 80, note: 'Started the road trip', createdAt: '2026-03-08T10:00:00Z' },
  // Sapiens — currently reading, at page 210 of 464
  { id: 3, bookId: 7, progressType: 'page', progressValue: 210, note: 'Agricultural revolution chapter is fascinating', createdAt: '2026-03-18T10:00:00Z' },
  { id: 4, bookId: 7, progressType: 'page', progressValue: 100, note: '', createdAt: '2026-03-12T10:00:00Z' },
];

export const mockReviews: BookReview[] = [
  { id: 1, bookId: 1, rating: 5, review: 'A masterpiece of American literature. The prose is gorgeous and the themes of the American Dream still resonate.', dateRead: '2025-06-15', createdAt: '2025-06-15T10:00:00Z' },
  { id: 2, bookId: 2, rating: 5, review: 'Powerful and moving. Scout\'s perspective makes the heavy themes accessible. A must-read.', dateRead: '2025-08-20', createdAt: '2025-08-20T10:00:00Z' },
  { id: 3, bookId: 3, rating: 4, review: 'Chillingly prescient. The surveillance state themes feel more relevant than ever.', dateRead: '2025-10-05', createdAt: '2025-10-05T10:00:00Z' },
  { id: 4, bookId: 5, rating: 3, review: 'Interesting voice but Holden can be grating. I understand its importance though.', dateRead: '2025-12-01', createdAt: '2025-12-01T10:00:00Z' },
  { id: 5, bookId: 6, rating: 5, review: 'Haunting and beautiful. Morrison\'s prose is unlike anything else. Devastating.', dateRead: '2026-01-15', createdAt: '2026-01-15T10:00:00Z' },
  { id: 6, bookId: 8, rating: 4, review: 'Epic world-building. The political intrigue and ecology are brilliantly interwoven.', dateRead: '2026-02-20', createdAt: '2026-02-20T10:00:00Z' },
];

export const mockChallenge: ReadingChallenge = {
  id: 1,
  year: 2026,
  goal: 24,
  createdAt: '2026-01-01T10:00:00Z',
};

// ─── Helper functions ───────────────────────────────────────────────────────

export function getBookById(id: number): Book | undefined {
  return mockBooks.find((b) => b.id === id);
}

export function getBooksOnShelf(shelfId: number): Book[] {
  const bookIds = mockShelfAssignments
    .filter((a) => a.shelfId === shelfId)
    .map((a) => a.bookId);
  return mockBooks.filter((b) => bookIds.includes(b.id));
}

export function getShelfForBook(bookId: number): BookShelf | undefined {
  const assignment = mockShelfAssignments.find(
    (a) => a.bookId === bookId && mockShelves.find((s) => s.id === a.shelfId)?.exclusive
  );
  if (!assignment) return undefined;
  return mockShelves.find((s) => s.id === assignment.shelfId);
}

export function getShelvesForBook(bookId: number): BookShelf[] {
  const shelfIds = mockShelfAssignments
    .filter((a) => a.bookId === bookId)
    .map((a) => a.shelfId);
  return mockShelves.filter((s) => shelfIds.includes(s.id));
}

export function getLatestProgress(bookId: number): BookProgressEntry | undefined {
  return mockProgress
    .filter((p) => p.bookId === bookId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function getReviewForBook(bookId: number): BookReview | undefined {
  return mockReviews.find((r) => r.bookId === bookId);
}

export function getShelfBookCount(shelfId: number): number {
  return mockShelfAssignments.filter((a) => a.shelfId === shelfId).length;
}

export function getBooksReadThisYear(year: number): Book[] {
  const readShelf = mockShelves.find((s) => s.name === 'Read');
  if (!readShelf) return [];
  const bookIds = mockShelfAssignments
    .filter((a) => a.shelfId === readShelf.id && a.assignedAt.startsWith(String(year)))
    .map((a) => a.bookId);
  return mockBooks.filter((b) => bookIds.includes(b.id));
}

export function getRecentlyRead(limit: number): Book[] {
  const readShelf = mockShelves.find((s) => s.name === 'Read');
  if (!readShelf) return [];
  const assignments = mockShelfAssignments
    .filter((a) => a.shelfId === readShelf.id)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));
  return assignments.slice(0, limit).map((a) => mockBooks.find((b) => b.id === a.bookId)!).filter(Boolean);
}

export function getCurrentlyReading(): Array<Book & { progress: BookProgressEntry | undefined }> {
  const shelf = mockShelves.find((s) => s.name === 'Currently Reading');
  if (!shelf) return [];
  const books = getBooksOnShelf(shelf.id);
  return books.map((b) => ({ ...b, progress: getLatestProgress(b.id) }));
}
