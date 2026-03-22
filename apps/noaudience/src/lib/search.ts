export interface SearchResult {
  type: 'film' | 'book' | 'article' | 'writing' | 'chess';
  id: number;
  title: string;
  subtitle: string;
  image?: string | null;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  // Dynamic imports to avoid circular deps and allow modules to be optional
  const results: SearchResult[] = [];

  try {
    const { searchFilms } = await import('$lib/films/db');
    const films = await searchFilms(query);
    results.push(...films.map(f => ({
      type: 'film' as const, id: f.id, title: f.title,
      subtitle: `${f.year || ''} · ${f.director || 'Unknown'}`,
      image: f.posterPath,
    })));
  } catch { /* module not loaded */ }

  try {
    const { searchBooks } = await import('$lib/books/db');
    const books = await searchBooks(query);
    results.push(...books.map(b => ({
      type: 'book' as const, id: b.id, title: b.title,
      subtitle: b.author || 'Unknown author',
      image: b.coverPath,
    })));
  } catch { /* module not loaded */ }

  try {
    const { searchArticles } = await import('$lib/articles/db');
    const articles = await searchArticles(query);
    results.push(...articles.map(a => ({
      type: 'article' as const, id: a.id, title: a.title,
      subtitle: `${a.author || ''} · ${a.publication || ''}`,
      image: a.coverImagePath,
    })));
  } catch { /* module not loaded */ }

  try {
    const { searchWritings } = await import('$lib/writing/db');
    const writings = await searchWritings(query);
    results.push(...writings.map(w => ({
      type: 'writing' as const, id: w.id, title: w.title,
      subtitle: `${w.folder || 'Unfiled'} · ${w.wordCount || 0} words`,
    })));
  } catch { /* module not loaded */ }

  try {
    const { searchGames } = await import('$lib/chess/db');
    const games = await searchGames(query);
    results.push(...games.map(g => ({
      type: 'chess' as const, id: g.id,
      title: `${g.white} vs ${g.black}`,
      subtitle: `${g.openingName || 'Unknown opening'} · ${g.result}`,
    })));
  } catch { /* module not loaded */ }

  return results;
}
