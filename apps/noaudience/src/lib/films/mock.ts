// Mock film data for development — TMDB integration comes later

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280';

export interface Film {
  id: number;
  tmdbId: number | null;
  title: string;
  year: number;
  director: string;
  runtime: number;
  tagline: string;
  synopsis: string;
  posterPath: string;
  backdropPath: string;
  genres: string[];
  cast: string[];
  crew: string[];
  createdAt: string;
}

export interface FilmLog {
  id: number;
  filmId: number;
  watchedDate: string;
  rating: number;
  liked: boolean;
  rewatch: boolean;
  review: string;
  tags: string[];
  createdAt: string;
}

export interface WatchlistEntry {
  id: number;
  filmId: number;
  addedAt: string;
}

export interface FilmList {
  id: number;
  title: string;
  description: string;
  ranked: boolean;
  filmIds: number[];
  createdAt: string;
}

export const mockFilms: Film[] = [
  {
    id: 1,
    tmdbId: 550,
    title: 'Fight Club',
    year: 1999,
    director: 'David Fincher',
    runtime: 139,
    tagline: 'Mischief. Mayhem. Soap.',
    synopsis: 'A ticking-Loss clerk forms an underground fight club that evolves into something much, much more.',
    posterPath: `${TMDB_IMG}/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg`,
    backdropPath: `${TMDB_BACKDROP}/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg`,
    genres: ['Drama', 'Thriller'],
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    crew: ['David Fincher', 'Jim Uhls'],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    tmdbId: 680,
    title: 'Pulp Fiction',
    year: 1994,
    director: 'Quentin Tarantino',
    runtime: 154,
    tagline: "You won't know the facts until you've seen the fiction.",
    synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    posterPath: `${TMDB_IMG}/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg`,
    backdropPath: `${TMDB_BACKDROP}/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg`,
    genres: ['Crime', 'Thriller'],
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    crew: ['Quentin Tarantino'],
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 3,
    tmdbId: 278,
    title: 'The Shawshank Redemption',
    year: 1994,
    director: 'Frank Darabont',
    runtime: 142,
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    synopsis: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.',
    posterPath: `${TMDB_IMG}/9cjIGRiQfljJfOLFwjAYsBqcOv8.jpg`,
    backdropPath: `${TMDB_BACKDROP}/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg`,
    genres: ['Drama', 'Crime'],
    cast: ['Tim Robbins', 'Morgan Freeman'],
    crew: ['Frank Darabont'],
    createdAt: '2026-01-17T10:00:00Z',
  },
  {
    id: 4,
    tmdbId: 13,
    title: 'Forrest Gump',
    year: 1994,
    director: 'Robert Zemeckis',
    runtime: 142,
    tagline: 'Life is like a box of chocolates.',
    synopsis: 'A man with a low IQ has accomplished great things in his life and been present during significant historic events.',
    posterPath: `${TMDB_IMG}/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg`,
    backdropPath: `${TMDB_BACKDROP}/ghgfzbEV7kbpbi1O3pokfnGCur4.jpg`,
    genres: ['Comedy', 'Drama', 'Romance'],
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    crew: ['Robert Zemeckis', 'Eric Roth'],
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 5,
    tmdbId: 155,
    title: 'The Dark Knight',
    year: 2008,
    director: 'Christopher Nolan',
    runtime: 152,
    tagline: 'Why So Serious?',
    synopsis: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    posterPath: `${TMDB_IMG}/qJ2tW6WMUDux911BTUgMe1St0x2.jpg`,
    backdropPath: `${TMDB_BACKDROP}/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg`,
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    crew: ['Christopher Nolan', 'Jonathan Nolan'],
    createdAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 6,
    tmdbId: 238,
    title: 'The Godfather',
    year: 1972,
    director: 'Francis Ford Coppola',
    runtime: 175,
    tagline: "An offer you can't refuse.",
    synopsis: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
    posterPath: `${TMDB_IMG}/3bhkrj58Vtu7enYsRolD1fZdja1.jpg`,
    backdropPath: `${TMDB_BACKDROP}/tmU7GeKVybMWFButWEGl2M4GeiP.jpg`,
    genres: ['Drama', 'Crime'],
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    crew: ['Francis Ford Coppola', 'Mario Puzo'],
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 7,
    tmdbId: 27205,
    title: 'Inception',
    year: 2010,
    director: 'Christopher Nolan',
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    synopsis: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.',
    posterPath: `${TMDB_IMG}/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg`,
    backdropPath: `${TMDB_BACKDROP}/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg`,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    crew: ['Christopher Nolan'],
    createdAt: '2026-01-21T10:00:00Z',
  },
  {
    id: 8,
    tmdbId: 120,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    year: 2001,
    director: 'Peter Jackson',
    runtime: 178,
    tagline: 'One ring to rule them all.',
    synopsis: 'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home to keep it from falling into the hands of its evil creator.',
    posterPath: `${TMDB_IMG}/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg`,
    backdropPath: `${TMDB_BACKDROP}/pIUvQ9Ed35wlWhY2oU6OmwEgzx.jpg`,
    genres: ['Adventure', 'Fantasy', 'Action'],
    cast: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen'],
    crew: ['Peter Jackson', 'Fran Walsh'],
    createdAt: '2026-01-22T10:00:00Z',
  },
];

export const mockLogs: FilmLog[] = [
  {
    id: 1,
    filmId: 1,
    watchedDate: '2026-03-20',
    rating: 4.5,
    liked: true,
    rewatch: true,
    review: 'Still hits different every time. The twist never gets old.',
    tags: ['rewatch', 'favorite'],
    createdAt: '2026-03-20T22:00:00Z',
  },
  {
    id: 2,
    filmId: 5,
    watchedDate: '2026-03-18',
    rating: 5,
    liked: true,
    rewatch: false,
    review: 'Heath Ledger delivers one of the greatest performances in cinema history.',
    tags: ['superhero', 'masterpiece'],
    createdAt: '2026-03-18T21:00:00Z',
  },
  {
    id: 3,
    filmId: 7,
    watchedDate: '2026-03-15',
    rating: 4,
    liked: true,
    rewatch: false,
    review: 'Mind-bending in the best way possible.',
    tags: ['sci-fi', 'mind-bending'],
    createdAt: '2026-03-15T20:00:00Z',
  },
  {
    id: 4,
    filmId: 2,
    watchedDate: '2026-03-10',
    rating: 4.5,
    liked: true,
    rewatch: true,
    review: 'Tarantino at his finest. The dialogue is unmatched.',
    tags: ['classic', 'rewatch'],
    createdAt: '2026-03-10T19:00:00Z',
  },
  {
    id: 5,
    filmId: 6,
    watchedDate: '2026-02-28',
    rating: 5,
    liked: true,
    rewatch: true,
    review: "An offer you truly can't refuse. Perfect cinema.",
    tags: ['classic', 'masterpiece'],
    createdAt: '2026-02-28T20:00:00Z',
  },
  {
    id: 6,
    filmId: 3,
    watchedDate: '2026-02-20',
    rating: 5,
    liked: true,
    rewatch: false,
    review: 'One of the greatest films ever made. The ending is perfection.',
    tags: ['classic', 'prison'],
    createdAt: '2026-02-20T21:00:00Z',
  },
  {
    id: 7,
    filmId: 8,
    watchedDate: '2026-02-14',
    rating: 4.5,
    liked: true,
    rewatch: true,
    review: 'Epic in every sense of the word.',
    tags: ['fantasy', 'epic'],
    createdAt: '2026-02-14T18:00:00Z',
  },
  {
    id: 8,
    filmId: 4,
    watchedDate: '2026-01-30',
    rating: 4,
    liked: false,
    rewatch: false,
    review: 'Heartwarming but a bit sentimental for my taste.',
    tags: ['drama', 'classic'],
    createdAt: '2026-01-30T20:00:00Z',
  },
];

export const mockWatchlist: WatchlistEntry[] = [
  { id: 1, filmId: 3, addedAt: '2026-03-01T10:00:00Z' },
  { id: 2, filmId: 4, addedAt: '2026-03-02T10:00:00Z' },
  { id: 3, filmId: 6, addedAt: '2026-03-05T10:00:00Z' },
  { id: 4, filmId: 8, addedAt: '2026-03-08T10:00:00Z' },
];

export const mockLists: FilmList[] = [
  {
    id: 1,
    title: 'Top 10 of All Time',
    description: 'My personal all-time favorites, ranked.',
    ranked: true,
    filmIds: [6, 3, 5, 1, 2, 7, 8, 4],
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 2,
    title: 'Christopher Nolan Marathon',
    description: 'All Nolan films in chronological order.',
    ranked: false,
    filmIds: [5, 7],
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 3,
    title: '90s Classics',
    description: 'The best films of the 1990s.',
    ranked: false,
    filmIds: [1, 2, 3, 4],
    createdAt: '2026-02-15T10:00:00Z',
  },
];

export function getFilmById(id: number): Film | undefined {
  return mockFilms.find((f) => f.id === id);
}

export function getLogsForFilm(filmId: number): FilmLog[] {
  return mockLogs.filter((l) => l.filmId === filmId);
}

export function getLogWithFilm(log: FilmLog): FilmLog & { film: Film } {
  const film = getFilmById(log.filmId)!;
  return { ...log, film };
}
