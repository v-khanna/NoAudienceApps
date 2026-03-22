CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS films (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  year INTEGER,
  director TEXT,
  runtime INTEGER,
  tagline TEXT,
  synopsis TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  genres TEXT,
  cast TEXT,
  crew TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS film_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  film_id INTEGER REFERENCES films(id),
  watched_date TEXT,
  rating REAL,
  liked INTEGER,
  rewatch INTEGER,
  review TEXT,
  tags TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS film_watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  film_id INTEGER REFERENCES films(id),
  added_at TEXT
);

CREATE TABLE IF NOT EXISTS film_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  ranked INTEGER,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS film_list_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER REFERENCES film_lists(id),
  film_id INTEGER REFERENCES films(id),
  position INTEGER,
  note TEXT
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openlibrary_id TEXT,
  title TEXT NOT NULL,
  author TEXT,
  page_count INTEGER,
  publisher TEXT,
  publish_date TEXT,
  isbn TEXT,
  language TEXT,
  description TEXT,
  genres TEXT,
  cover_path TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS book_shelves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  exclusive INTEGER,
  position INTEGER
);

CREATE TABLE IF NOT EXISTS book_shelf_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER REFERENCES books(id),
  shelf_id INTEGER REFERENCES book_shelves(id),
  assigned_at TEXT
);

CREATE TABLE IF NOT EXISTS book_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER REFERENCES books(id),
  progress_type TEXT,
  progress_value INTEGER,
  note TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS book_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER REFERENCES books(id),
  rating INTEGER,
  review TEXT,
  date_read TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS reading_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  goal INTEGER NOT NULL,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  name TEXT,
  last_synced_at TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_id INTEGER REFERENCES feeds(id),
  source_url TEXT,
  title TEXT NOT NULL,
  author TEXT,
  publication TEXT,
  date_published TEXT,
  cover_image_path TEXT,
  content_html TEXT,
  reading_time_minutes INTEGER,
  is_own_post INTEGER,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER REFERENCES articles(id),
  color TEXT,
  note TEXT,
  text_exact TEXT,
  text_prefix TEXT,
  text_suffix TEXT,
  position_start INTEGER,
  position_end INTEGER,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS writings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content_markdown TEXT,
  content_html TEXT,
  word_count INTEGER,
  tags TEXT,
  folder TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS writing_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  writing_id INTEGER REFERENCES writings(id),
  linked_type TEXT,
  linked_id INTEGER,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS chess_games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pgn_text TEXT,
  white TEXT,
  black TEXT,
  result TEXT,
  date TEXT,
  opening_eco TEXT,
  opening_name TEXT,
  your_color TEXT,
  annotations TEXT,
  created_at TEXT
);

-- Default book shelves
INSERT OR IGNORE INTO book_shelves (id, name, exclusive, position) VALUES (1, 'Want to Read', 1, 0);
INSERT OR IGNORE INTO book_shelves (id, name, exclusive, position) VALUES (2, 'Currently Reading', 1, 1);
INSERT OR IGNORE INTO book_shelves (id, name, exclusive, position) VALUES (3, 'Read', 1, 2);
