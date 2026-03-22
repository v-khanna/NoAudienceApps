/**
 * Films data layer — mock implementation.
 * Uses mock data for now; will be replaced with tauri-plugin-sql calls + TMDB API.
 */

import {
  mockFilms,
  mockLogs,
  mockWatchlist,
  mockLists,
  getFilmById as _getFilmById,
  type Film,
  type FilmLog,
  type WatchlistEntry,
  type FilmList,
} from './mock';

// ─── Films ────────────────────────────────────────────────────────────────────

export function getFilms(): Film[] {
  return mockFilms;
}

export function getFilmById(id: number): Film | undefined {
  return _getFilmById(id);
}

export function addFilmFromTmdb(tmdbResult: {
  id: number;
  title: string;
  year: number;
  posterPath: string;
  backdropPath: string;
  overview: string;
}): Film {
  // Check if already exists
  const existing = mockFilms.find((f) => f.tmdbId === tmdbResult.id);
  if (existing) return existing;

  const film: Film = {
    id: mockFilms.length + 100,
    tmdbId: tmdbResult.id,
    title: tmdbResult.title,
    year: tmdbResult.year,
    director: '',
    runtime: 0,
    tagline: '',
    synopsis: tmdbResult.overview,
    posterPath: tmdbResult.posterPath,
    backdropPath: tmdbResult.backdropPath,
    genres: [],
    cast: [],
    crew: [],
    createdAt: new Date().toISOString(),
  };
  mockFilms.push(film);
  return film;
}

export function searchFilms(query: string): Film[] {
  const q = query.toLowerCase();
  return mockFilms.filter(
    (f) =>
      f.title.toLowerCase().includes(q) ||
      f.director.toLowerCase().includes(q)
  );
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export function logFilm(data: {
  filmId: number;
  watchedDate: string;
  rating: number;
  liked: boolean;
  rewatch: boolean;
  review: string;
  tags: string[];
}): FilmLog {
  const log: FilmLog = {
    id: mockLogs.length + 1,
    ...data,
    createdAt: new Date().toISOString(),
  };
  mockLogs.unshift(log);
  return log;
}

export function getFilmLogs(filmId?: number): FilmLog[] {
  if (filmId != null) {
    return mockLogs.filter((l) => l.filmId === filmId);
  }
  return [...mockLogs];
}

export function getRecentLogs(limit: number = 10): (FilmLog & { film: Film })[] {
  return mockLogs
    .slice(0, limit)
    .map((log) => ({ ...log, film: getFilmById(log.filmId)! }))
    .filter((entry) => entry.film != null);
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export function addToWatchlist(filmId: number): WatchlistEntry {
  const entry: WatchlistEntry = {
    id: mockWatchlist.length + 1,
    filmId,
    addedAt: new Date().toISOString(),
  };
  mockWatchlist.push(entry);
  return entry;
}

export function removeFromWatchlist(filmId: number): void {
  const idx = mockWatchlist.findIndex((w) => w.filmId === filmId);
  if (idx !== -1) mockWatchlist.splice(idx, 1);
}

export function getWatchlist(sort: 'added' | 'title' | 'year' = 'added'): (WatchlistEntry & { film: Film })[] {
  const entries = mockWatchlist
    .map((w) => ({ ...w, film: getFilmById(w.filmId)! }))
    .filter((e) => e.film != null);

  switch (sort) {
    case 'title':
      return entries.sort((a, b) => a.film.title.localeCompare(b.film.title));
    case 'year':
      return entries.sort((a, b) => (b.film.year ?? 0) - (a.film.year ?? 0));
    default:
      return entries.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }
}

// ─── Lists ────────────────────────────────────────────────────────────────────

export function createList(title: string, description: string, ranked: boolean): FilmList {
  const list: FilmList = {
    id: mockLists.length + 1,
    title,
    description,
    ranked,
    filmIds: [],
    createdAt: new Date().toISOString(),
  };
  mockLists.push(list);
  return list;
}

export function addToList(listId: number, filmId: number): void {
  const list = mockLists.find((l) => l.id === listId);
  if (list && !list.filmIds.includes(filmId)) {
    list.filmIds.push(filmId);
  }
}

export function getLists(): (FilmList & { films: Film[] })[] {
  return mockLists.map((list) => ({
    ...list,
    films: list.filmIds.map((id) => getFilmById(id)!).filter(Boolean),
  }));
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface FilmStats {
  totalFilms: number;
  totalHours: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  genreCounts: { genre: string; count: number }[];
  topDirectors: { director: string; count: number }[];
}

export function getFilmStats(): FilmStats {
  const loggedFilmIds = [...new Set(mockLogs.map((l) => l.filmId))];
  const loggedFilms = loggedFilmIds.map((id) => getFilmById(id)!).filter(Boolean);

  const totalMinutes = loggedFilms.reduce((sum, f) => sum + (f.runtime ?? 0), 0);
  const ratings = mockLogs.filter((l) => l.rating > 0).map((l) => l.rating);
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  // Rating distribution (0.5 to 5 in 0.5 steps)
  const ratingBuckets = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const ratingDistribution = ratingBuckets.map((r) => ({
    rating: r,
    count: mockLogs.filter((l) => l.rating === r).length,
  }));

  // Genre counts
  const genreMap: Record<string, number> = {};
  for (const film of loggedFilms) {
    for (const genre of film.genres ?? []) {
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
