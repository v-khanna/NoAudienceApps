// Mock data for Articles module

export interface Article {
  id: number;
  feedId: number | null;
  sourceUrl: string;
  title: string;
  author: string;
  publication: string;
  datePublished: string;
  coverImagePath: string;
  contentHtml: string;
  readingTimeMinutes: number;
  isOwnPost: boolean;
  excerpt: string;
  createdAt: string;
}

export interface Highlight {
  id: number;
  articleId: number;
  color: 'yellow' | 'blue' | 'green' | 'pink';
  note: string;
  textExact: string;
  textPrefix: string;
  textSuffix: string;
  positionStart: number;
  positionEnd: number;
  createdAt: string;
}

export interface Feed {
  id: number;
  url: string;
  name: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

export const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#FACC15',
  blue: '#60A5FA',
  green: '#4ADE80',
  pink: '#F472B6',
};

export const mockFeeds: Feed[] = [
  {
    id: 1,
    url: 'https://stratechery.com/feed/',
    name: 'Stratechery',
    lastSyncedAt: '2026-03-21T14:30:00Z',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    url: 'https://www.slowboring.com/feed',
    name: 'Slow Boring',
    lastSyncedAt: '2026-03-20T09:15:00Z',
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 3,
    url: 'https://astralcodexten.substack.com/feed',
    name: 'Astral Codex Ten',
    lastSyncedAt: null,
    createdAt: '2026-03-10T12:00:00Z',
  },
];

export const mockArticles: Article[] = [
  {
    id: 1,
    feedId: 1,
    sourceUrl: 'https://stratechery.com/2026/the-ai-supply-chain/',
    title: 'The AI Supply Chain',
    author: 'Ben Thompson',
    publication: 'Stratechery',
    datePublished: '2026-03-18',
    coverImagePath: 'https://placehold.co/800x450/1B2028/99AABB?text=AI+Supply+Chain',
    readingTimeMinutes: 12,
    isOwnPost: false,
    excerpt: 'The most important thing to understand about the AI supply chain is that it is fundamentally different from the cloud computing supply chain that preceded it.',
    createdAt: '2026-03-18T08:00:00Z',
    contentHtml: `
      <h2>The New Landscape</h2>
      <p>The most important thing to understand about the AI supply chain is that it is fundamentally different from the cloud computing supply chain that preceded it. While cloud computing was about renting commodity hardware, AI is about specialized silicon, massive datasets, and proprietary model architectures.</p>
      <p>This distinction matters because it changes the dynamics of competition. In cloud computing, the primary differentiator was scale and operational excellence. In AI, the differentiators are more numerous and more defensible.</p>
      <blockquote>
        <p>"The companies that control the key chokepoints in the AI supply chain will have outsized influence over the trajectory of the technology."</p>
      </blockquote>
      <h2>Compute as the New Oil</h2>
      <p>GPU clusters have become the essential resource of the AI era. The demand for compute has grown exponentially, far outstripping supply. This has created a new kind of resource scarcity that shapes everything from startup strategy to geopolitics.</p>
      <p>Consider the numbers: training a frontier model now requires tens of thousands of GPUs running for months. The capital expenditure involved is measured in billions. This is not a game that many can play.</p>
      <h2>The Data Moat</h2>
      <p>While compute gets the headlines, data may be the more durable advantage. Companies with unique, high-quality datasets have something that cannot be easily replicated. This is especially true for specialized applications in healthcare, finance, and scientific research.</p>
      <p>The challenge is that data quality matters far more than data quantity. A carefully curated dataset of expert annotations can be worth more than petabytes of scraped web text.</p>
      <h2>Implications for Startups</h2>
      <p>For startups, this supply chain analysis suggests a clear strategy: focus on areas where you can build unique advantages that don't depend on having the most compute. This means domain-specific applications, novel architectures for efficiency, and proprietary data collection.</p>
    `,
  },
  {
    id: 2,
    feedId: 2,
    sourceUrl: 'https://www.slowboring.com/p/housing-policy-2026',
    title: 'Why Housing Policy Still Matters in 2026',
    author: 'Matthew Yglesias',
    publication: 'Slow Boring',
    datePublished: '2026-03-15',
    coverImagePath: 'https://placehold.co/800x450/1B2028/99AABB?text=Housing+Policy',
    readingTimeMinutes: 8,
    isOwnPost: false,
    excerpt: 'Despite years of attention to the housing crisis, the fundamental dynamics have not changed. Restrictive zoning continues to constrain supply in the places where people most want to live.',
    createdAt: '2026-03-15T10:00:00Z',
    contentHtml: `
      <h2>The Persistent Crisis</h2>
      <p>Despite years of attention to the housing crisis, the fundamental dynamics have not changed. Restrictive zoning continues to constrain supply in the places where people most want to live. Prices remain high, and the gap between housing costs and incomes continues to grow.</p>
      <p>What has changed is the political landscape. There is now broader recognition across the political spectrum that housing affordability is a critical issue. But recognition alone does not build homes.</p>
      <h2>Supply Side Solutions</h2>
      <p>The evidence is overwhelming that the primary driver of high housing costs is insufficient supply. Cities that have made it easier to build have seen moderation in price growth. Cities that have maintained restrictive policies continue to see prices climb.</p>
      <blockquote>
        <p>"You cannot solve a supply problem with demand-side interventions. Subsidies without new construction simply bid up the price of existing units."</p>
      </blockquote>
      <h2>What Works</h2>
      <p>The most effective policies are straightforward: allow more housing to be built in more places. This means reforming zoning codes, streamlining permitting processes, and reducing the ability of small groups of neighbors to block new construction.</p>
      <p>Several states have made progress on these fronts. The results, while still early, are encouraging. But much more remains to be done.</p>
    `,
  },
  {
    id: 3,
    feedId: null,
    sourceUrl: 'https://paulgraham.com/persistence.html',
    title: 'Persistence and Determination',
    author: 'Paul Graham',
    publication: 'paulgraham.com',
    datePublished: '2026-03-10',
    coverImagePath: 'https://placehold.co/800x450/1B2028/99AABB?text=Persistence',
    readingTimeMinutes: 6,
    isOwnPost: false,
    excerpt: 'The most common trait I see in successful founders is not brilliance or creativity, though those help. It is persistence — the willingness to keep going when everything suggests you should stop.',
    createdAt: '2026-03-10T14:00:00Z',
    contentHtml: `
      <h2>What Makes Founders Succeed</h2>
      <p>The most common trait I see in successful founders is not brilliance or creativity, though those help. It is persistence — the willingness to keep going when everything suggests you should stop.</p>
      <p>This is not the same as stubbornness. Stubborn people stick with their original plan regardless of feedback. Persistent people adapt their approach while maintaining their commitment to the goal.</p>
      <h2>The Valley of Despair</h2>
      <p>Every startup goes through a period where things look hopeless. Revenue is flat, the product doesn't quite work, the team is frustrated, and competitors seem to be pulling ahead. This is the point where most people give up.</p>
      <p>The founders who succeed are the ones who find a way through this valley. Sometimes it requires a pivot, sometimes it requires patience, and sometimes it requires both.</p>
      <blockquote>
        <p>"The difference between successful founders and unsuccessful ones is often just a few months of persistence."</p>
      </blockquote>
      <h2>Cultivating Persistence</h2>
      <p>Persistence is partly innate, but it can also be cultivated. The key is to find work that you care about deeply enough that quitting feels worse than continuing. If you're working on something you don't care about, no amount of willpower will sustain you.</p>
    `,
  },
  {
    id: 4,
    feedId: null,
    sourceUrl: '',
    title: 'Building in Public: Month Three',
    author: 'You',
    publication: 'Your Substack',
    datePublished: '2026-03-01',
    coverImagePath: 'https://placehold.co/800x450/1B2028/99AABB?text=Building+in+Public',
    readingTimeMinutes: 5,
    isOwnPost: true,
    excerpt: 'Three months into building NoAudience and the lessons keep coming. This month I learned about the importance of dogfooding your own product.',
    createdAt: '2026-03-01T09:00:00Z',
    contentHtml: `
      <h2>Month Three Reflections</h2>
      <p>Three months into building NoAudience and the lessons keep coming. This month I learned about the importance of dogfooding your own product. Every day I use NoAudience to track my reading, and every day I find small things that could be better.</p>
      <p>The articles feature was the big focus this month. I wanted a place to save articles from around the web and annotate them with highlights and notes, similar to what Readwise offers but integrated into my personal knowledge system.</p>
      <h2>Technical Decisions</h2>
      <p>I chose to build with Tauri v2 and SvelteKit, which has been a great combination. The app feels native on every platform, and the web technologies make iteration fast. SQLite provides a solid local-first data layer.</p>
      <p>The highlight system was the most challenging piece. Getting text selection to work reliably across different HTML structures required careful handling of range objects and text node traversal.</p>
      <h2>What's Next</h2>
      <p>Next month I'm planning to add RSS feed syncing so articles show up automatically. I also want to build an export system so highlights can be sent to other tools in my workflow.</p>
    `,
  },
  {
    id: 5,
    feedId: null,
    sourceUrl: '',
    title: 'On Taste and Curation',
    author: 'You',
    publication: 'Your Substack',
    datePublished: '2026-02-15',
    coverImagePath: 'https://placehold.co/800x450/1B2028/99AABB?text=Taste+%26+Curation',
    readingTimeMinutes: 4,
    isOwnPost: true,
    excerpt: 'In an age of infinite content, the most valuable skill is not creation but curation. Knowing what to pay attention to is itself a form of creativity.',
    createdAt: '2026-02-15T11:00:00Z',
    contentHtml: `
      <h2>The Curation Thesis</h2>
      <p>In an age of infinite content, the most valuable skill is not creation but curation. Knowing what to pay attention to is itself a form of creativity. It requires taste, judgment, and a deep understanding of what matters.</p>
      <p>This is why I built NoAudience as a private tool. The act of curation doesn't need an audience. Its value is in how it shapes your thinking, not in how it performs on social media.</p>
      <h2>Building Taste</h2>
      <p>Taste is not something you're born with. It's developed through exposure, reflection, and practice. The more you read, watch, and think critically about what you consume, the sharper your taste becomes.</p>
      <blockquote>
        <p>"Taste is the ability to say no. To filter signal from noise. To recognize quality before consensus validates it."</p>
      </blockquote>
      <h2>Tools for Thought</h2>
      <p>The right tools can amplify your curation practice. Highlighting passages, writing notes, connecting ideas across different sources — these activities transform passive consumption into active learning.</p>
    `,
  },
];

export const mockHighlights: Highlight[] = [
  {
    id: 1,
    articleId: 1,
    color: 'yellow',
    note: 'Key insight about supply chain dynamics',
    textExact: 'The most important thing to understand about the AI supply chain is that it is fundamentally different from the cloud computing supply chain that preceded it.',
    textPrefix: '',
    textSuffix: 'While cloud',
    positionStart: 0,
    positionEnd: 155,
    createdAt: '2026-03-18T09:00:00Z',
  },
  {
    id: 2,
    articleId: 1,
    color: 'blue',
    note: 'Data quality vs quantity — applies to my project too',
    textExact: 'A carefully curated dataset of expert annotations can be worth more than petabytes of scraped web text.',
    textPrefix: 'true for',
    textSuffix: '',
    positionStart: 800,
    positionEnd: 900,
    createdAt: '2026-03-18T09:05:00Z',
  },
  {
    id: 3,
    articleId: 2,
    color: 'green',
    note: '',
    textExact: 'You cannot solve a supply problem with demand-side interventions.',
    textPrefix: '',
    textSuffix: 'Subsidies',
    positionStart: 500,
    positionEnd: 565,
    createdAt: '2026-03-15T11:00:00Z',
  },
  {
    id: 4,
    articleId: 3,
    color: 'pink',
    note: 'Persistence vs stubbornness — important distinction',
    textExact: 'Stubborn people stick with their original plan regardless of feedback. Persistent people adapt their approach while maintaining their commitment to the goal.',
    textPrefix: 'stubbornness.',
    textSuffix: '',
    positionStart: 200,
    positionEnd: 360,
    createdAt: '2026-03-10T15:00:00Z',
  },
  {
    id: 5,
    articleId: 3,
    color: 'yellow',
    note: '',
    textExact: 'The difference between successful founders and unsuccessful ones is often just a few months of persistence.',
    textPrefix: '',
    textSuffix: '',
    positionStart: 600,
    positionEnd: 710,
    createdAt: '2026-03-10T15:05:00Z',
  },
  {
    id: 6,
    articleId: 5,
    color: 'blue',
    note: 'Core philosophy of the app',
    textExact: 'Taste is the ability to say no. To filter signal from noise. To recognize quality before consensus validates it.',
    textPrefix: '',
    textSuffix: '',
    positionStart: 400,
    positionEnd: 510,
    createdAt: '2026-02-15T12:00:00Z',
  },
];
