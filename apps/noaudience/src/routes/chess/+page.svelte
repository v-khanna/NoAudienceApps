<script lang="ts">
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { filterGames, importPgn, type ChessGame } from '$lib/chess/db';

  let searchQuery = $state('');
  let resultFilter = $state('');
  let colorFilter = $state<'white' | 'black' | ''>('');
  let importModalOpen = $state(false);
  let importText = $state('');
  let importError = $state('');

  let games = $derived(
    filterGames({
      query: searchQuery || undefined,
      result: resultFilter || undefined,
      color: colorFilter || undefined,
    })
  );

  function handleImport() {
    if (!importText.trim()) {
      importError = 'Please paste PGN text.';
      return;
    }
    try {
      const imported = importPgn(importText.trim());
      if (imported.length === 0) {
        importError = 'No valid games found in PGN.';
        return;
      }
      importText = '';
      importError = '';
      importModalOpen = false;
    } catch {
      importError = 'Failed to parse PGN. Please check the format.';
    }
  }

  function resultBadgeClasses(result: string): string {
    if (result === '1-0') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (result === '0-1') return 'bg-red-500/15 text-red-400 border-red-500/20';
    return 'bg-white/[0.06] text-[#99AABB] border-white/[0.08]';
  }

  function formatResult(result: string): string {
    if (result === '1/2-1/2') return '\u00BD-\u00BD';
    return result;
  }
</script>

<div class="space-y-6 max-w-5xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold text-white mb-1">Chess</h1>
      <p class="text-[#99AABB]/70 text-sm">{games.length} game{games.length !== 1 ? 's' : ''} in library</p>
    </div>
    <Button variant="primary" onclick={() => (importModalOpen = true)}>Import PGN</Button>
  </div>

  <!-- Search + Filters -->
  <div class="flex items-center gap-3 flex-wrap">
    <div class="flex-1 min-w-[200px]">
      <SearchBar bind:value={searchQuery} placeholder="Search players, openings..." />
    </div>
    <select
      bind:value={resultFilter}
      class="h-10 px-3 bg-[#1B2028] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-[#40BCF4] transition-colors cursor-pointer"
    >
      <option value="">All results</option>
      <option value="1-0">White wins (1-0)</option>
      <option value="0-1">Black wins (0-1)</option>
      <option value="1/2-1/2">Draw</option>
    </select>
    <select
      bind:value={colorFilter}
      class="h-10 px-3 bg-[#1B2028] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-[#40BCF4] transition-colors cursor-pointer"
    >
      <option value="">All colors</option>
      <option value="white">Playing White</option>
      <option value="black">Playing Black</option>
    </select>
  </div>

  <!-- Games List -->
  {#if games.length === 0}
    <div class="text-center py-20">
      <div class="text-5xl mb-4 opacity-30">&#9812;</div>
      <p class="text-[#99AABB] text-lg mb-2">No games found</p>
      <p class="text-[#99AABB]/50 text-sm">Import a PGN to get started.</p>
    </div>
  {:else}
    <div class="grid gap-3">
      {#each games as game (game.id)}
        <a
          href="/chess/{game.id}"
          class="group block bg-[#1B2028] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] hover:bg-[#1E2530] transition-all duration-200 hover:-translate-y-px hover:shadow-lg hover:shadow-black/20"
        >
          <div class="flex items-center gap-4">
            <!-- Chess piece icon -->
            <div class="flex-shrink-0 w-11 h-11 rounded-lg bg-white/[0.04] flex items-center justify-center text-2xl opacity-50 group-hover:opacity-70 transition-opacity">
              {#if game.yourColor === 'white'}
                &#9812;
              {:else if game.yourColor === 'black'}
                &#9818;
              {:else}
                &#9822;
              {/if}
            </div>

            <!-- Game info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-white font-semibold truncate">{game.white}</span>
                <span class="text-[#99AABB]/50 text-xs">vs</span>
                <span class="text-white font-semibold truncate">{game.black}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                {#if game.openingName}
                  <span class="text-[#99AABB]/60 truncate">{game.openingName}</span>
                {/if}
                {#if game.date}
                  <span class="text-[#99AABB]/30">&middot;</span>
                  <span class="text-[#99AABB]/50 flex-shrink-0">{game.date}</span>
                {/if}
              </div>
            </div>

            <!-- Result badge -->
            <div class="flex items-center gap-3 flex-shrink-0">
              {#if game.yourColor}
                <span
                  class="w-4 h-4 rounded-full border flex-shrink-0 {
                    game.yourColor === 'white'
                      ? 'bg-white/90 border-white/30'
                      : 'bg-[#2C3440] border-white/15'
                  }"
                  title="{game.yourColor === 'white' ? 'Playing White' : 'Playing Black'}"
                ></span>
              {/if}
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-mono border {resultBadgeClasses(game.result)}">
                {formatResult(game.result)}
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<!-- Import PGN Modal -->
<Modal open={importModalOpen} onclose={() => { importModalOpen = false; importError = ''; }} title="Import PGN">
  <div class="space-y-4">
    <p class="text-[#99AABB]/70 text-sm">Paste one or more PGN games below.</p>
    <div class="relative rounded-lg overflow-hidden border border-white/[0.08] focus-within:border-[#40BCF4]/50 transition-colors" style="background: linear-gradient(135deg, rgba(20,24,28,0.95), rgba(27,32,40,0.95)); backdrop-filter: blur(12px);">
      <textarea
        bind:value={importText}
        placeholder="[Event &quot;...&quot;]&#10;[White &quot;...&quot;]&#10;[Black &quot;...&quot;]&#10;&#10;1.e4 e5 2.Nf3 ..."
        rows="14"
        class="w-full bg-transparent text-emerald-200/80 text-sm p-4 font-mono placeholder:text-[#99AABB]/30 focus:outline-none resize-none leading-relaxed"
        spellcheck="false"
      ></textarea>
    </div>
    {#if importError}
      <p class="text-red-400 text-sm flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        {importError}
      </p>
    {/if}
    <div class="flex justify-end gap-3 pt-1">
      <Button variant="ghost" onclick={() => { importModalOpen = false; importError = ''; }}>Cancel</Button>
      <Button variant="primary" onclick={handleImport}>Import</Button>
    </div>
  </div>
</Modal>
