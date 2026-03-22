import { getDb } from '$lib/db';
import { settings } from '@noaudience/core/db/schema';
import { eq } from 'drizzle-orm';

export async function getSetting(key: string): Promise<string | null> {
  const rows = await getDb().select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await getDb().select().from(settings).where(eq(settings.key, key));
  if (existing.length > 0) {
    await getDb().update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await getDb().insert(settings).values({ key, value });
  }
}

export async function loadAllSettings(): Promise<{
  tmdbApiKey: string;
  substackFeedUrl: string;
  accentColor: string;
}> {
  const rows = await getDb().select().from(settings);
  const map = new Map(rows.map(r => [r.key, r.value]));
  return {
    tmdbApiKey: map.get('tmdb_api_key') || '',
    substackFeedUrl: map.get('substack_feed_url') || 'https://virkhanna.substack.com',
    accentColor: map.get('accent_color') || '#00E054',
  };
}

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNjg3ODQzOTQ2MzNhZTJhNDFmZDcyMGJhMWUxYzI0OSIsIm5iZiI6MTc3NDE2MjY0MC43MSwic3ViIjoiNjliZjkyZDAxYjU5MGE4NmM0MDFjODg0Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.-BHinys3dbMpvIOzcZpC-LYvLSoslw79ZqbdrC7bIDA';

const DEFAULT_SETTINGS: Record<string, string> = {
  substack_feed_url: 'https://virkhanna.substack.com',
  accent_color: '#00E054',
  tmdb_api_key: TMDB_TOKEN,
};

export async function seedDefaultSettings(): Promise<void> {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    try {
      const existing = await getSetting(key);
      if (existing === null) {
        await getDb().insert(settings).values({ key, value });
      }
    } catch {
      // Key already exists or DB error — skip silently
    }
  }
}
