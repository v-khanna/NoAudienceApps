/**
 * TMDB API integration for film search and metadata.
 */

import { getSetting } from '$lib/settings';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Fallback token used if settings DB hasn't been seeded yet
const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNjg3ODQzOTQ2MzNhZTJhNDFmZDcyMGJhMWUxYzI0OSIsIm5iZiI6MTc3NDE2MjY0MC43MSwic3ViIjoiNjliZjkyZDAxYjU5MGE4NmM0MDFjODg0Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.-BHinys3dbMpvIOzcZpC-LYvLSoslw79ZqbdrC7bIDA';

async function getTmdbToken(): Promise<string> {
  try {
    const token = await getSetting('tmdb_api_key');
    return token || FALLBACK_TOKEN;
  } catch {
    return FALLBACK_TOKEN;
  }
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  year: number;
  posterPath: string;
  backdropPath: string;
  overview: string;
  releaseDate: string;
}

export interface TmdbFilmDetail {
  id: number;
  tmdbId: number;
  title: string;
  year: number;
  director: string;
  runtime: number;
  tagline: string;
  synopsis: string;
  posterPath: string;
  backdropPath: string;
  genres: string[];
  cast: { name: string; character: string }[];
  crew: { name: string; job: string }[];
}

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const token = await getTmdbToken();
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

export function posterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function searchTmdb(query: string): Promise<TmdbSearchResult[]> {
  if (!query || query.length < 2) return [];

  const data = await tmdbFetch('/search/movie', {
    query,
    include_adult: 'false',
    language: 'en-US',
    page: '1',
  });

  return (data.results || []).slice(0, 8).map((r: any) => ({
    id: r.id,
    title: r.title,
    year: r.release_date ? parseInt(r.release_date.split('-')[0]) : 0,
    posterPath: posterUrl(r.poster_path, 'w185'),
    backdropPath: backdropUrl(r.backdrop_path),
    overview: r.overview || '',
    releaseDate: r.release_date || '',
  }));
}

export async function getFilmDetails(tmdbId: number): Promise<TmdbFilmDetail> {
  const [movie, credits] = await Promise.all([
    tmdbFetch(`/movie/${tmdbId}`, { language: 'en-US' }),
    tmdbFetch(`/movie/${tmdbId}/credits`, { language: 'en-US' }),
  ]);

  const director = credits.crew?.find((c: any) => c.job === 'Director')?.name || '';

  return {
    id: 0, // will be set when saved to local DB
    tmdbId: movie.id,
    title: movie.title,
    year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : 0,
    director,
    runtime: movie.runtime || 0,
    tagline: movie.tagline || '',
    synopsis: movie.overview || '',
    posterPath: posterUrl(movie.poster_path),
    backdropPath: backdropUrl(movie.backdrop_path),
    genres: (movie.genres || []).map((g: any) => g.name),
    cast: (credits.cast || []).slice(0, 20).map((c: any) => ({
      name: c.name,
      character: c.character,
    })),
    crew: (credits.crew || []).slice(0, 20).map((c: any) => ({
      name: c.name,
      job: c.job,
    })),
  };
}
