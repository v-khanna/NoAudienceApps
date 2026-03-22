/**
 * Films data layer — real SQLite via Drizzle ORM.
 */

import { getDb } from '$lib/db';
import {
  films,
  filmLogs,
  filmWatchlist,
  filmLists,
  filmListItems,
} from '@noaudience/core/db/schema';
import { eq, desc, like, or, asc, sql, inArray } from 'drizzle-orm';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Film = typeof films.$inferSelect;
export type FilmLog = typeof filmLogs.$inferSelect;
export type WatchlistEntry = typeof filmWatchlist.$inferSelect;
export type FilmListRow = typeof filmLists.$inferSelect;
export type FilmListItem = typeof filmListItems.$inferSelect;

export interface FilmLogWithFilm extends FilmLog {
  film: Film;
}

export interface WatchlistEntryWithFilm extends WatchlistEntry {
  film: Film;
}

export interface FilmListWithFilms extends FilmListRow {
  films: Film[];
}

export interface FilmStats {
  totalFilms: number;
  totalHours: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  genreCounts: { genre: string; count: number }[];
  topDirectors: { director: string; count: number }[];
}

// ─── Films ───────────────────────────────────────────────────────────────────

export async function getFilms(): Promise<Film[]> {
  const db = getDb();
  return db.select().from(films).orderBy(desc(films.createdAt));
}

export async function getFilmById(id: number): Promise<Film | undefined> {
  const db = getDb();
  const rows = await db.select().from(films).where(eq(films.id, id)).limit(1);
  return rows[0];
}

export async function addFilmFromTmdb(tmdbResult: {
  id: number;
  title: string;
  year: number;
  posterPath: string;
  backdropPath: string;
  overview: string;
}): Promise<Film> {
  const db = getDb();

  const existing = await db
    .select()
    .from(films)
    .where(eq(films.tmdbId, tmdbResult.id))
    .limit(1);
  if (existing.length > 0) return existing[0];

  await db.insert(films).values({
    tmdbId: tmdbResult.id,
    title: tmdbResult.title,
    year: tmdbResult.year || null,
    director: '',
    runtime: 0,
    tagline: '',
    synopsis: tmdbResult.overview || '',
    posterPath: tmdbResult.posterPath || '',
    backdropPath: tmdbResult.backdropPath || '',
    genres: [],
    cast: [],
    crew: [],
  });

  const rows = await db.select().from(films).where(eq(films.tmdbId, tmdbResult.id));
  return rows[0];
}

export async function searchFilms(query: string): Promise<Film[]> {
  const db = getDb();
  const pattern = `%${query}%`;
  return db
    .select()
    .from(films)
    .where(or(like(films.title, pattern), like(films.director, pattern)))
    .orderBy(films.title);
}

// ─── Logs ────────────────────────────────────────────────────────────────────

export async function logFilm(data: {
  filmId: number;
  watchedDate: string;
  rating: number;
  liked: boolean;
  rewatch: boolean;
  review: string;
  tags: string[];
}): Promise<FilmLog> {
  const db = getDb();

  await db.insert(filmLogs).values({
    filmId: data.filmId,
    watchedDate: data.watchedDate,
    rating: data.rating,
    liked: data.liked,
    rewatch: data.rewatch,
    review: data.review || '',
    tags: data.tags || [],
  });

  const rows = await db.select().from(filmLogs)
    .where(eq(filmLogs.filmId, data.filmId))
    .orderBy(desc(filmLogs.createdAt))
    .limit(1);
  return rows[0];
}

export async function getFilmLogs(filmId?: number): Promise<FilmLog[]> {
  const db = getDb();
  if (filmId != null) {
    return db
      .select()
      .from(filmLogs)
      .where(eq(filmLogs.filmId, filmId))
      .orderBy(desc(filmLogs.watchedDate));
  }
  return db.select().from(filmLogs).orderBy(desc(filmLogs.watchedDate));
}

export async function getRecentLogs(
  limit: number = 10
): Promise<FilmLogWithFilm[]> {
  const db = getDb();
  const logs = await db
    .select()
    .from(filmLogs)
    .orderBy(desc(filmLogs.watchedDate))
    .limit(limit);

  const filmIds = [...new Set(logs.map((l) => l.filmId).filter((id): id is number => id != null))];
  if (filmIds.length === 0) return [];

  const filmRows = await db
    .select()
    .from(films)
    .where(inArray(films.id, filmIds));
  const filmMap = new Map(filmRows.map((f) => [f.id, f]));

  return logs
    .map((log) => {
      const film = filmMap.get(log.filmId!);
      if (!film) return null;
      return { ...log, film } as FilmLogWithFilm;
    })
    .filter((entry): entry is FilmLogWithFilm => entry != null);
}

// ─── Watchlist ───────────────────────────────────────────────────────────────

export async function addToWatchlist(filmId: number): Promise<WatchlistEntry> {
  const db = getDb();
  await db.insert(filmWatchlist).values({ filmId });
  const rows = await db
    .select()
    .from(filmWatchlist)
    .where(eq(filmWatchlist.filmId, filmId))
    .limit(1);
  return rows[0];
}

export async function removeFromWatchlist(filmId: number): Promise<void> {
  const db = getDb();
  await db.delete(filmWatchlist).where(eq(filmWatchlist.filmId, filmId));
}

export async function isOnWatchlist(filmId: number): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select()
    .from(filmWatchlist)
    .where(eq(filmWatchlist.filmId, filmId))
    .limit(1);
  return rows.length > 0;
}

export async function getWatchlist(
  sort: 'added' | 'title' | 'year' = 'added'
): Promise<WatchlistEntryWithFilm[]> {
  const db = getDb();
  const entries = await db.select().from(filmWatchlist);

  const filmIds = entries.map((e) => e.filmId).filter((id): id is number => id != null);
  if (filmIds.length === 0) return [];

  const filmRows = await db
    .select()
    .from(films)
    .where(inArray(films.id, filmIds));
  const filmMap = new Map(filmRows.map((f) => [f.id, f]));

  const results = entries
    .map((entry) => {
      const film = filmMap.get(entry.filmId!);
      if (!film) return null;
      return { ...entry, film } as WatchlistEntryWithFilm;
    })
    .filter((e): e is WatchlistEntryWithFilm => e != null);

  switch (sort) {
    case 'title':
      return results.sort((a, b) => a.film.title.localeCompare(b.film.title));
    case 'year':
      return results.sort((a, b) => (b.film.year ?? 0) - (a.film.year ?? 0));
    default:
      return results.sort(
        (a, b) =>
          new Date(b.addedAt ?? 0).getTime() -
          new Date(a.addedAt ?? 0).getTime()
      );
  }
}

// ─── Lists ───────────────────────────────────────────────────────────────────

export async function createList(
  title: string,
  description: string,
  ranked: boolean
): Promise<FilmListRow> {
  const db = getDb();
  await db.insert(filmLists).values({ title, description, ranked });
  const rows = await db
    .select()
    .from(filmLists)
    .orderBy(desc(filmLists.createdAt))
    .limit(1);
  return rows[0];
}

export async function addToList(listId: number, filmId: number): Promise<void> {
  const db = getDb();
  // Get next position
  const existing = await db
    .select()
    .from(filmListItems)
    .where(eq(filmListItems.listId, listId))
    .orderBy(desc(filmListItems.position));
  const nextPos = (existing[0]?.position ?? 0) + 1;

  // Check if already in list
  const alreadyIn = existing.find((i) => i.filmId === filmId);
  if (alreadyIn) return;

  await db
    .insert(filmListItems)
    .values({ listId, filmId, position: nextPos });
}

export async function getLists(): Promise<FilmListWithFilms[]> {
  const db = getDb();
  const lists = await db
    .select()
    .from(filmLists)
    .orderBy(desc(filmLists.createdAt));

  const result: FilmListWithFilms[] = [];

  for (const list of lists) {
    const items = await db
      .select()
      .from(filmListItems)
      .where(eq(filmListItems.listId, list.id))
      .orderBy(asc(filmListItems.position));

    const filmIds = items.map((i) => i.filmId).filter((id): id is number => id != null);
    let listFilms: Film[] = [];
    if (filmIds.length > 0) {
      const filmRows = await db
        .select()
        .from(films)
        .where(inArray(films.id, filmIds));
      const filmMap = new Map(filmRows.map((f) => [f.id, f]));
      // Preserve position order
      listFilms = filmIds
        .map((id) => filmMap.get(id))
        .filter((f): f is Film => f != null);
    }

    result.push({ ...list, films: listFilms });
  }

  return result;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getFilmStats(): Promise<FilmStats> {
  const db = getDb();

  const allLogs = await db.select().from(filmLogs);

  const loggedFilmIds = [
    ...new Set(allLogs.map((l) => l.filmId).filter((id): id is number => id != null)),
  ];

  let loggedFilms: Film[] = [];
  if (loggedFilmIds.length > 0) {
    loggedFilms = await db
      .select()
      .from(films)
      .where(inArray(films.id, loggedFilmIds));
  }

  const totalMinutes = loggedFilms.reduce(
    (sum, f) => sum + (f.runtime ?? 0),
    0
  );
  const ratings = allLogs
    .filter((l) => (l.rating ?? 0) > 0)
    .map((l) => l.rating!);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  // Rating distribution (0.5 to 5 in 0.5 steps)
  const ratingBuckets = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const ratingDistribution = ratingBuckets.map((r) => ({
    rating: r,
    count: allLogs.filter((l) => l.rating === r).length,
  }));

  // Genre counts
  const genreMap: Record<string, number> = {};
  for (const film of loggedFilms) {
    const genres = (film.genres ?? []) as string[];
    for (const genre of genres) {
      genreMap[genre] = (genreMap[genre] ?? 0) + 1;
    }
  }
  const genreCounts = Object.entries(genreMap)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);

  // Top directors
  const directorMap: Record<string, number> = {};
  for (const film of loggedFilms) {
    if (film.director) {
      directorMap[film.director] = (directorMap[film.director] ?? 0) + 1;
    }
  }
  const topDirectors = Object.entries(directorMap)
    .map(([director, count]) => ({ director, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalFilms: loggedFilmIds.length,
    totalHours: Math.round(totalMinutes / 60),
    averageRating: Math.round(avgRating * 10) / 10,
    ratingDistribution,
    genreCounts,
    topDirectors,
  };
}
