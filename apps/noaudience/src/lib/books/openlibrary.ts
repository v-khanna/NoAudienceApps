/**
 * Open Library API integration for book search and metadata.
 * No API key needed — completely free.
 */

const OL_BASE = 'https://openlibrary.org';
const OL_COVERS = 'https://covers.openlibrary.org';

export interface OLSearchResult {
  id: string; // Open Library key like /works/OL123W
  title: string;
  author: string;
  year: number;
  coverUrl: string;
  isbn: string;
  pageCount: number;
}

export async function searchOpenLibrary(query: string): Promise<OLSearchResult[]> {
  if (!query || query.length < 2) return [];

  const url = `${OL_BASE}/search.json?q=${encodeURIComponent(query)}&limit=8&fields=key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);

  const data = await res.json();

  return (data.docs || []).map((doc: any) => ({
    id: doc.key || '',
    title: doc.title || 'Unknown',
    author: doc.author_name?.[0] || 'Unknown Author',
    year: doc.first_publish_year || 0,
    coverUrl: doc.cover_i
      ? `${OL_COVERS}/b/id/${doc.cover_i}-M.jpg`
      : '',
    isbn: doc.isbn?.[0] || '',
    pageCount: doc.number_of_pages_median || 0,
  }));
}

export function coverUrl(coverId: number | string, size: 'S' | 'M' | 'L' = 'M'): string {
  if (!coverId) return '';
  return `${OL_COVERS}/b/id/${coverId}-${size}.jpg`;
}
