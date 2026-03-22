import { writable, derived } from 'svelte/store';

export type ModuleId = 'films' | 'books' | 'articles' | 'writing' | 'chess';

export interface Module {
  id: ModuleId;
  label: string;
  subPages: { label: string; path: string }[];
}

const allModules: Module[] = [
  { id: 'films', label: 'Films', subPages: [
    { label: 'Diary', path: '/films/diary' },
    { label: 'Watchlist', path: '/films/watchlist' },
    { label: 'Lists', path: '/films/lists' },
    { label: 'Stats', path: '/films/stats' }
  ]},
  { id: 'books', label: 'Books', subPages: [
    { label: 'Library', path: '/books/library' },
    { label: 'Shelves', path: '/books/shelves' },
    { label: 'Challenge', path: '/books/challenge' },
    { label: 'Stats', path: '/books/stats' }
  ]},
  { id: 'articles', label: 'Articles', subPages: [
    { label: 'Your Posts', path: '/articles/yours' },
    { label: 'Saved', path: '/articles/saved' },
    { label: 'Feeds', path: '/articles/feeds' },
    { label: 'Annotations', path: '/articles/annotations' }
  ]},
  { id: 'writing', label: 'Writing', subPages: [
    { label: 'All Writings', path: '/writing' },
    { label: 'Tags', path: '/writing/tags' },
    { label: 'Folders', path: '/writing/folders' }
  ]},
  { id: 'chess', label: 'Chess', subPages: [
    { label: 'Games', path: '/chess' },
    { label: 'Analysis', path: '/chess/analysis' }
  ]}
];

export const enabledModuleIds = writable<Set<ModuleId>>(
  new Set(['films', 'books', 'articles', 'writing', 'chess'])
);

export const enabledModules = derived(enabledModuleIds, ($ids) =>
  allModules.filter((m) => $ids.has(m.id))
);

export { allModules };
