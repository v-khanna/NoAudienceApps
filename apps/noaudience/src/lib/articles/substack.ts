// Substack RSS fetcher
// Tauri's webview doesn't enforce CORS, so direct fetch() works.

export interface SubstackArticle {
  sourceUrl: string;
  title: string;
  author: string;
  publication: string;
  datePublished: string;
  coverImagePath: string;
  contentHtml: string;
  readingTimeMinutes: number;
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 250));
}

function extractCoverImage(html: string): string {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return match?.[1] ?? '';
}

/**
 * Fetches and parses a Substack RSS feed.
 */
export async function fetchSubstackFeed(substackUrl: string): Promise<SubstackArticle[]> {
  // In dev mode, proxy through Vite to avoid CORS. In production (Tauri), fetch directly.
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const feedUrl = isDev ? '/api/substack/feed' : `${substackUrl.replace(/\/$/, '')}/feed`;

  const response = await fetch(feedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Failed to parse RSS feed XML');
  }

  const channelTitle = doc.querySelector('channel > title')?.textContent ?? '';
  const items = doc.querySelectorAll('item');
  const articles: SubstackArticle[] = [];

  for (const item of items) {
    const title = item.querySelector('title')?.textContent ?? '';
    const link = item.querySelector('link')?.textContent ?? '';
    const pubDate = item.querySelector('pubDate')?.textContent ?? '';
    const creator = item.getElementsByTagName('dc:creator')[0]?.textContent
      ?? item.querySelector('author')?.textContent
      ?? '';

    // Substack puts content in content:encoded
    const contentEncoded = item.getElementsByTagName('content:encoded')[0]?.textContent ?? '';
    const description = item.querySelector('description')?.textContent ?? '';
    const contentHtml = contentEncoded || description;

    const datePublished = pubDate
      ? new Date(pubDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    articles.push({
      sourceUrl: link,
      title,
      author: creator,
      publication: channelTitle,
      datePublished,
      coverImagePath: extractCoverImage(contentHtml),
      contentHtml,
      readingTimeMinutes: estimateReadingTime(contentHtml),
    });
  }

  return articles;
}

/**
 * Fetches the full HTML content from a Substack article page.
 * Useful when RSS content is truncated.
 */
export async function fetchFullArticleContent(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.status}`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Substack article content is in .body.markup or .available-content
  const contentEl =
    doc.querySelector('.body.markup') ??
    doc.querySelector('.available-content') ??
    doc.querySelector('article');

  return contentEl?.innerHTML ?? '';
}

/**
 * Syncs Substack articles, returning only those not already saved.
 */
export async function syncSubstackArticles(
  substackUrl: string,
  existingUrls: Set<string>,
): Promise<SubstackArticle[]> {
  const feedArticles = await fetchSubstackFeed(substackUrl);
  return feedArticles.filter((a) => !existingUrls.has(a.sourceUrl));
}
