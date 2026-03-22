<script lang="ts">
  import { filterGames, importPgn, type ChessGame } from '$lib/chess/db';

  let searchQuery = $state('');
  let resultFilter = $state('');
  let colorFilter = $state<'white' | 'black' | ''>('');
  let importModalOpen = $state(false);
  let importText = $state('');
  let importError = $state('');
  let importSuccess = $state('');

  let games = $state<ChessGame[]>([]);
  let loading = $state(true);

  // Reload counter to trigger re-fetch
  let reloadKey = $state(0);

  $effect(() => {
    // Track reactive deps
    const _q = searchQuery;
    const _r = resultFilter;
    const _c = colorFilter;
    const _k = reloadKey;

    loading = true;
    filterGames({
      query: _q || undefined,
      result: _r || undefined,
      color: _c || undefined,
    }).then((result) => {
      games = result;
      loading = false;
    });
  });

  async function handleImport() {
    if (!importText.trim()) {
      importError = 'Please paste PGN text.';
      return;
    }
    try {
      const imported = await importPgn(importText.trim());
      if (imported.length === 0) {
        importError = 'No valid games found in PGN.';
        return;
      }
      importText = '';
      importError = '';
      importSuccess = `Imported ${imported.length} game${imported.length !== 1 ? 's' : ''}.`;
      reloadKey++;
      setTimeout(() => {
        importModalOpen = false;
        importSuccess = '';
      }, 1200);
    } catch {
      importError = 'Failed to parse PGN. Please check the format.';
    }
  }

  function formatResult(result: string): string {
    if (result === '1/2-1/2') return '\u00BD-\u00BD';
    return result;
  }

  function formatDate(date: string): string {
    if (!date) return '';
    try {
      const d = new Date(date.replace(/\./g, '-'));
      if (isNaN(d.getTime())) return date;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return date;
    }
  }
</script>

<div>
  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 36px;">
    <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Chess</h1>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search players, openings..."
      style="
        height: 40px;
        padding: 0 14px;
        font-size: 15px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        outline: none;
        width: 240px;
      "
    />
    <select
      bind:value={resultFilter}
      style="
        height: 40px;
        padding: 0 10px;
        font-size: 15px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-secondary);
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
        padding-right: 28px;
        background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path fill=%22%235A5E6E%22 d=%22M0 0l5 6 5-6z%22/></svg>');
        background-repeat: no-repeat;
        background-position: right 10px center;
      "
    >
      <option value="">All results</option>
      <option value="1-0">White wins</option>
      <option value="0-1">Black wins</option>
      <option value="1/2-1/2">Draw</option>
    </select>
    <select
      bind:value={colorFilter}
      style="
        height: 40px;
        padding: 0 10px;
        font-size: 15px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-secondary);
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
        padding-right: 28px;
        background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path fill=%22%235A5E6E%22 d=%22M0 0l5 6 5-6z%22/></svg>');
        background-repeat: no-repeat;
        background-position: right 10px center;
      "
    >
      <option value="">All colors</option>
      <option value="white">White</option>
      <option value="black">Black</option>
    </select>
    <div style="flex: 1;"></div>
    <a
      href="/chess/analysis"
      style="
        height: 40px;
        padding: 0 16px;
        font-size: 15px;
        font-weight: 500;
        color: var(--text-secondary);
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        transition: background 150ms ease-out;
      "
      class="import-btn"
    >
      Analysis
    </a>
    <button
      onclick={() => importModalOpen = true}
      style="
        height: 40px;
        padding: 0 16px;
        font-size: 15px;
        font-weight: 500;
        color: var(--accent);
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 4px;
        cursor: pointer;
        transition: background 150ms ease-out;
      "
      class="import-btn"
    >
      Import PGN
    </button>
  </div>

  <!-- Games Table -->
  {#if loading}
    <div style="text-align: center; padding: 48px 0;">
      <p style="font-size: 15px; color: var(--text-tertiary);">Loading games...</p>
    </div>
  {:else if games.length === 0}
    <div style="text-align: center; padding: 48px 0;">
      <p style="font-size: 15px; color: var(--text-tertiary);">No games found. Import a PGN to get started.</p>
    </div>
  {:else}
    <!-- Table header -->
    <div
      style="
        display: flex;
        align-items: center;
        height: 36px;
        padding: 0 12px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 2px;
      "
    >
      <span style="flex: 1; font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em;">Players</span>
      <span style="width: 60px; font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">Result</span>
      <span style="width: 200px; font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; padding-left: 16px;">Opening</span>
      <span style="width: 120px; font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Date</span>
    </div>

    <!-- Game rows -->
    {#each games as game, i (game.id)}
      <a
        href="/chess/{game.id}"
        class="game-row"
        style="
          display: flex;
          align-items: center;
          height: 48px;
          padding: 0 12px;
          text-decoration: none;
          border-bottom: {i < games.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <span style="flex: 1; font-size: 15px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {game.white} <span style="color: var(--text-tertiary);">vs</span> {game.black}
        </span>
        <span style="width: 60px; font-size: 15px; font-family: ui-monospace, monospace; color: var(--text-secondary); text-align: center;">
          {formatResult(game.result ?? '')}
        </span>
        <span style="width: 200px; font-size: 15px; color: var(--text-secondary); padding-left: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {game.openingName || '\u2014'}
        </span>
        <span style="width: 120px; font-size: 13px; color: var(--text-tertiary); text-align: right;">
          {formatDate(game.date ?? '')}
        </span>
      </a>
    {/each}

    <div style="padding: 12px; font-size: 13px; color: var(--text-tertiary);">
      {games.length} game{games.length !== 1 ? 's' : ''}
    </div>
  {/if}
</div>

<!-- Import PGN Modal -->
{#if importModalOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="modal-backdrop"
    style="
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    "
    onmousedown={(e) => { if (e.target === e.currentTarget) { importModalOpen = false; importError = ''; } }}
    onkeydown={(e) => { if (e.key === 'Escape') { importModalOpen = false; importError = ''; } }}
  >
    <div
      style="
        width: 540px;
        max-width: 90vw;
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 24px;
      "
    >
      <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0;">Import PGN</h2>
      <p style="font-size: 15px; color: var(--text-secondary); margin: 0 0 16px 0;">Paste one or more PGN games below.</p>
      <textarea
        bind:value={importText}
        placeholder={"[Event \"...\"]\n[White \"...\"]\n[Black \"...\"]\n\n1.e4 e5 2.Nf3 ..."}
        rows="12"
        spellcheck="false"
        style="
          width: 100%;
          background: var(--bg-inset);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-primary);
          font-family: ui-monospace, monospace;
          font-size: 14px;
          padding: 14px;
          outline: none;
          resize: vertical;
          line-height: 1.6;
          box-sizing: border-box;
        "
      ></textarea>
      {#if importError}
        <p style="font-size: 14px; color: #EF4444; margin: 10px 0 0 0;">{importError}</p>
      {/if}
      {#if importSuccess}
        <p style="font-size: 14px; color: #22C55E; margin: 10px 0 0 0;">{importSuccess}</p>
      {/if}
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
        <button
          onclick={() => { importModalOpen = false; importError = ''; }}
          style="
            height: 40px;
            padding: 0 16px;
            font-size: 15px;
            color: var(--text-secondary);
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 4px;
            cursor: pointer;
          "
          class="import-btn"
        >
          Cancel
        </button>
        <button
          onclick={handleImport}
          style="
            height: 40px;
            padding: 0 16px;
            font-size: 15px;
            font-weight: 500;
            color: var(--accent);
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 4px;
            cursor: pointer;
          "
          class="import-btn"
        >
          Import
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .game-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .import-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  select:focus {
    border-color: var(--accent);
  }

  input:focus {
    border-color: var(--accent);
  }

  textarea:focus {
    border-color: var(--accent);
  }
</style>
