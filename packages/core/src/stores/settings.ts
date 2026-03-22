import { writable } from 'svelte/store';

export interface AppSettings {
  tmdbApiKey: string;
  substackFeedUrl: string;
  accentColor: string;
}

export const appSettings = writable<AppSettings>({
  tmdbApiKey: '',
  substackFeedUrl: '',
  accentColor: '#00E054'
});
