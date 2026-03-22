import { mockWritings, mockFolders, type Writing, type Folder } from './mock';

let writings = $state<Writing[]>([...mockWritings]);
let folders = $state<Folder[]>([...mockFolders]);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 250));
}

// --- Writings CRUD ---

export function getAllWritings(): Writing[] {
  return writings;
}

export function getWritingById(id: string): Writing | undefined {
  return writings.find((w) => w.id === id);
}

export function createWriting(): Writing {
  const now = new Date().toISOString();
  const writing: Writing = {
    id: generateId(),
    title: 'Untitled',
    content: '',
    excerpt: '',
    tags: [],
    folder: null,
    wordCount: 0,
    readingTime: 1,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
  };
  writings = [writing, ...writings];
  return writing;
}

export function updateWriting(id: string, updates: Partial<Pick<Writing, 'title' | 'content' | 'tags' | 'folder' | 'status'>>): Writing | undefined {
  const index = writings.findIndex((w) => w.id === id);
  if (index === -1) return undefined;

  const existing = writings[index];
  const content = updates.content ?? existing.content;
  const wordCount = countWords(content);
  const excerpt = content.replace(/[#*_~`>\-\[\]()]/g, '').slice(0, 160).trim();

  const updated: Writing = {
    ...existing,
    ...updates,
    content,
    wordCount,
    readingTime: calculateReadingTime(wordCount),
    excerpt,
    updatedAt: new Date().toISOString(),
  };

  writings = writings.map((w, i) => (i === index ? updated : w));
  return updated;
}

export function deleteWriting(id: string): boolean {
  const len = writings.length;
  writings = writings.filter((w) => w.id !== id);
  return writings.length < len;
}

// --- Tags ---

export function getAllTags(): { tag: string; count: number }[] {
  const tagMap = new Map<string, number>();
  for (const w of writings) {
    for (const t of w.tags) {
      tagMap.set(t, (tagMap.get(t) || 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getWritingsByTag(tag: string): Writing[] {
  return writings.filter((w) => w.tags.includes(tag));
}

// --- Folders ---

export function getAllFolders(): Folder[] {
  return folders;
}

export function getWritingsByFolder(folderName: string): Writing[] {
  return writings.filter((w) => w.folder === folderName);
}

export function createFolder(name: string): Folder {
  const folder: Folder = {
    id: generateId(),
    name,
    writingCount: 0,
  };
  folders = [...folders, folder];
  return folder;
}

export function deleteFolder(id: string): boolean {
  const len = folders.length;
  folders = folders.filter((f) => f.id !== id);
  return folders.length < len;
}
