<script lang="ts">
  import { onMount } from 'svelte';
  import { allModules, enabledModuleIds, type ModuleId } from '@noaudience/core/stores/modules';
  import { loadAllSettings, setSetting } from '$lib/settings';

  let tmdbApiKey = $state('');
  let substackFeedUrl = $state('');
  let showTmdbKey = $state(false);
  let loaded = $state(false);

  onMount(async () => {
    const s = await loadAllSettings();
    tmdbApiKey = s.tmdbApiKey;
    substackFeedUrl = s.substackFeedUrl;
    loaded = true;
  });

  function toggleModule(id: ModuleId) {
    enabledModuleIds.update((ids: Set<ModuleId>) => {
      const next = new Set(ids);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function updateTmdbKey(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    tmdbApiKey = value;
    await setSetting('tmdb_api_key', value);
  }

  async function updateSubstackUrl(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    substackFeedUrl = value;
    await setSetting('substack_feed_url', value);
  }
</script>

{#if !loaded}
  <p style="color: var(--text-secondary); font-size: 15px;">Loading settings...</p>
{:else}
<div style="max-width: 560px;">
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 36px;">Settings</h1>

  <!-- Modules -->
  <section style="margin-bottom: 48px;">
    <h2 style="font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin: 0 0 16px;">Modules</h2>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      {#each allModules as mod (mod.id)}
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 15px; color: var(--text-primary);">
          <input
            type="checkbox"
            checked={$enabledModuleIds.has(mod.id)}
            onchange={() => toggleModule(mod.id)}
            style="accent-color: var(--accent); width: 16px; height: 16px;"
          />
          {mod.label}
        </label>
      {/each}
    </div>
  </section>

  <!-- API Keys -->
  <section style="margin-bottom: 48px;">
    <h2 style="font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin: 0 0 16px;">API Keys</h2>
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <label for="tmdb-key" style="font-size: 15px; color: var(--text-secondary);">TMDB Access Token</label>
          <button
            type="button"
            onclick={() => showTmdbKey = !showTmdbKey}
            style="font-size: 13px; color: var(--text-tertiary); background: none; border: none; cursor: pointer;"
            class="toggle-btn"
          >
            {showTmdbKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id="tmdb-key"
          type={showTmdbKey ? 'text' : 'password'}
          value={tmdbApiKey}
          oninput={updateTmdbKey}
          placeholder="Enter your TMDB access token"
          style="
            width: 100%;
            height: 40px;
            padding: 0 14px;
            font-size: 15px;
            background: var(--bg-inset);
            border: 1px solid var(--border);
            border-radius: 4px;
            color: var(--text-primary);
            outline: none;
            box-sizing: border-box;
          "
          class="settings-input"
        />
        <p style="font-size: 13px; color: var(--text-tertiary); margin: 6px 0 0;">Required for film search and poster images. Get one at themoviedb.org.</p>
      </div>
      <div>
        <label for="substack-url" style="font-size: 15px; color: var(--text-secondary); display: block; margin-bottom: 6px;">Substack URL</label>
        <input
          id="substack-url"
          type="text"
          value={substackFeedUrl}
          oninput={updateSubstackUrl}
          placeholder="https://yourname.substack.com"
          style="
            width: 100%;
            height: 40px;
            padding: 0 14px;
            font-size: 15px;
            background: var(--bg-inset);
            border: 1px solid var(--border);
            border-radius: 4px;
            color: var(--text-primary);
            outline: none;
            box-sizing: border-box;
          "
          class="settings-input"
        />
        <p style="font-size: 13px; color: var(--text-tertiary); margin: 6px 0 0;">Your Substack articles will auto-sync from this URL.</p>
      </div>
    </div>
  </section>

  <!-- Data -->
  <section style="margin-bottom: 48px;">
    <h2 style="font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin: 0 0 16px;">Data</h2>
    <div style="display: flex; gap: 10px;">
      <button
        type="button"
        style="
          height: 40px;
          padding: 0 16px;
          font-size: 15px;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          transition: color 150ms ease-out, background 150ms ease-out;
        "
        class="data-btn"
      >
        Export All Data
      </button>
      <button
        type="button"
        style="
          height: 40px;
          padding: 0 16px;
          font-size: 15px;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          transition: color 150ms ease-out, background 150ms ease-out;
        "
        class="data-btn"
      >
        Import Data
      </button>
    </div>
  </section>
</div>
{/if}

<style>
  .settings-input:focus {
    border-color: var(--accent);
  }

  .toggle-btn:hover {
    color: var(--text-secondary);
  }

  .data-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.03);
  }
</style>
