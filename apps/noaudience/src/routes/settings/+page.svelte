<script lang="ts">
  import { allModules, enabledModuleIds, type ModuleId } from '@noaudience/core/stores/modules';
  import { appSettings } from '@noaudience/core/stores/settings';

  let settings = $state({ tmdbApiKey: '', substackFeedUrl: '' });
  let showTmdbKey = $state(false);

  appSettings.subscribe((s) => {
    settings.tmdbApiKey = s.tmdbApiKey;
    settings.substackFeedUrl = s.substackFeedUrl;
  });

  function toggleModule(id: ModuleId) {
    enabledModuleIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function updateTmdbKey(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    appSettings.update((s) => ({ ...s, tmdbApiKey: value }));
  }

  function updateSubstackUrl(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    appSettings.update((s) => ({ ...s, substackFeedUrl: value }));
  }
</script>

<div style="max-width: 480px;">
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 24px;">Settings</h1>

  <!-- Modules -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin: 0 0 12px;">Modules</h2>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      {#each allModules as mod (mod.id)}
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text-primary);">
          <input
            type="checkbox"
            checked={$enabledModuleIds.has(mod.id)}
            onchange={() => toggleModule(mod.id)}
            style="accent-color: var(--accent);"
          />
          {mod.label}
        </label>
      {/each}
    </div>
  </section>

  <!-- API Keys -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin: 0 0 12px;">API Keys</h2>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <label for="tmdb-key" style="font-size: 12px; color: var(--text-secondary);">TMDB API Key</label>
          <button
            type="button"
            onclick={() => showTmdbKey = !showTmdbKey}
            style="font-size: 11px; color: var(--text-tertiary); background: none; border: none; cursor: pointer;"
            class="toggle-btn"
          >
            {showTmdbKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id="tmdb-key"
          type={showTmdbKey ? 'text' : 'password'}
          value={settings.tmdbApiKey}
          oninput={updateTmdbKey}
          placeholder="Enter your TMDB API key"
          style="
            width: 100%;
            height: 32px;
            padding: 0 12px;
            font-size: 12px;
            background: var(--bg-inset);
            border: 1px solid var(--border);
            border-radius: 4px;
            color: var(--text-primary);
            outline: none;
            box-sizing: border-box;
          "
          class="settings-input"
        />
        <p style="font-size: 11px; color: var(--text-tertiary); margin: 4px 0 0;">Required for film metadata and poster images.</p>
      </div>
      <div>
        <label for="substack-url" style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px;">Substack Feed URL</label>
        <input
          id="substack-url"
          type="text"
          value={settings.substackFeedUrl}
          oninput={updateSubstackUrl}
          placeholder="https://yourname.substack.com/feed"
          style="
            width: 100%;
            height: 32px;
            padding: 0 12px;
            font-size: 12px;
            background: var(--bg-inset);
            border: 1px solid var(--border);
            border-radius: 4px;
            color: var(--text-primary);
            outline: none;
            box-sizing: border-box;
          "
          class="settings-input"
        />
      </div>
    </div>
  </section>

  <!-- Data -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin: 0 0 12px;">Data</h2>
    <div style="display: flex; gap: 8px;">
      <button
        type="button"
        style="
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
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
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
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
