import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Settings ───────────────────────────────────────────────────────────────

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
});

// ─── Films ──────────────────────────────────────────────────────────────────

export const films = sqliteTable('films', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tmdbId: integer('tmdb_id').unique(),
  title: text('title').notNull(),
  year: integer('year'),
  director: text('director'),
  runtime: integer('runtime'),
  tagline: text('tagline'),
  synopsis: text('synopsis'),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  genres: text('genres', { mode: 'json' }),
  cast: text('cast', { mode: 'json' }),
  crew: text('crew', { mode: 'json' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const filmLogs = sqliteTable('film_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filmId: integer('film_id').references(() => films.id),
  watchedDate: text('watched_date'),
  rating: real('rating'),
  liked: integer('liked', { mode: 'boolean' }),
  rewatch: integer('rewatch', { mode: 'boolean' }),
  review: text('review'),
  tags: text('tags', { mode: 'json' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const filmWatchlist = sqliteTable('film_watchlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filmId: integer('film_id').references(() => films.id),
  addedAt: text('added_at').$defaultFn(() => new Date().toISOString()),
});

export const filmLists = sqliteTable('film_lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  ranked: integer('ranked', { mode: 'boolean' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const filmListItems = sqliteTable('film_list_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').references(() => filmLists.id),
  filmId: integer('film_id').references(() => films.id),
  position: integer('position'),
  note: text('note'),
});

// ─── Books ──────────────────────────────────────────────────────────────────

export const books = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  openlibraryId: text('openlibrary_id'),
  title: text('title').notNull(),
  author: text('author'),
  pageCount: integer('page_count'),
  publisher: text('publisher'),
  publishDate: text('publish_date'),
  isbn: text('isbn'),
  language: text('language'),
  description: text('description'),
  genres: text('genres', { mode: 'json' }),
  coverPath: text('cover_path'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const bookShelves = sqliteTable('book_shelves', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  exclusive: integer('exclusive', { mode: 'boolean' }),
  position: integer('position'),
});

export const bookShelfAssignments = sqliteTable('book_shelf_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').references(() => books.id),
  shelfId: integer('shelf_id').references(() => bookShelves.id),
  assignedAt: text('assigned_at').$defaultFn(() => new Date().toISOString()),
});

export const bookProgress = sqliteTable('book_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').references(() => books.id),
  progressType: text('progress_type'),
  progressValue: integer('progress_value'),
  note: text('note'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const bookReviews = sqliteTable('book_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').references(() => books.id),
  rating: integer('rating'),
  review: text('review'),
  dateRead: text('date_read'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const readingChallenges = sqliteTable('reading_challenges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull(),
  goal: integer('goal').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Articles / Feeds ───────────────────────────────────────────────────────

export const feeds = sqliteTable('feeds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  name: text('name'),
  lastSyncedAt: text('last_synced_at'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  feedId: integer('feed_id').references(() => feeds.id),
  sourceUrl: text('source_url'),
  title: text('title').notNull(),
  author: text('author'),
  publication: text('publication'),
  datePublished: text('date_published'),
  coverImagePath: text('cover_image_path'),
  contentHtml: text('content_html'),
  readingTimeMinutes: integer('reading_time_minutes'),
  isOwnPost: integer('is_own_post', { mode: 'boolean' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const highlights = sqliteTable('highlights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id').references(() => articles.id),
  color: text('color'),
  note: text('note'),
  textExact: text('text_exact'),
  textPrefix: text('text_prefix'),
  textSuffix: text('text_suffix'),
  positionStart: integer('position_start'),
  positionEnd: integer('position_end'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Writing ────────────────────────────────────────────────────────────────

export const writings = sqliteTable('writings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  contentMarkdown: text('content_markdown'),
  contentHtml: text('content_html'),
  wordCount: integer('word_count'),
  tags: text('tags', { mode: 'json' }),
  folder: text('folder'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const writingLinks = sqliteTable('writing_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  writingId: integer('writing_id').references(() => writings.id),
  linkedType: text('linked_type'),
  linkedId: integer('linked_id'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Chess ──────────────────────────────────────────────────────────────────

export const chessGames = sqliteTable('chess_games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pgnText: text('pgn_text'),
  white: text('white'),
  black: text('black'),
  result: text('result'),
  date: text('date'),
  openingEco: text('opening_eco'),
  openingName: text('opening_name'),
  yourColor: text('your_color'),
  annotations: text('annotations', { mode: 'json' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});
