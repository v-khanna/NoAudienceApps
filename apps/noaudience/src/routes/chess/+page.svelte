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

  function resultBadgeColor(result: string): string {
    if (result === '1-0') return 'text-[#00E054]';
    if (result === '0-1') return 'text-[#FF6B6B]';
    return 'text-[#99AABB]';
  }

  function formatResult(result: string): string {
    if (result === '1/2-1/2') return '\u00BD-\u00BD';
    return result;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold text-white mb-1">Chess</h1>
      <p class="text-[#99AABB] text-sm">{games.length} game{games.length !== 1 ? 's' : ''} in library</p>
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
      class="h-10 px-3 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm focus:outline-none focus:border-[#40BCF4] transition-colors cursor-pointer"
    >
      <option value="">All results</option>
      <option value="1-0">White wins (1-0)</option>
      <option value="0-1">Black wins (0-1)</option>
      <option value="1/2-1/2">Draw</option>
    </select>
    <select
      bind:value={colorFilter}
      class="h-10 px-3 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm focus:outline-none focus:border-[#40BCF4] transition-colors cursor-pointer"
    >
      <option value="">All colors</option>
      <option value="white">Playing White</option>
      <option value="black">Playing Black</option>
    </select>
  </div>

  <!-- Games Table -->
  {#if games.length === 0}
    <div class="text-center py-16">
      <p class="text-[#99AABB] text-lg mb-2">No games found</p>
      <p class="text-[#99AABB]/60 text-sm">Import a PGN to get started.</p>
    </div>
  {:else}
    <div class="bg-[#1B2028] border border-white/[0.06] rounded-[8px] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="text-left text-[#99AABB] font-medium px-4 py-3">Players</th>
            <th class="text-left text-[#99AABB] font-medium px-4 py-3">Result</th>
            <th class="text-left text-[#99AABB] font-medium px-4 py-3 hidden sm:table-cell">Opening</th>
            <th class="text-left text-[#99AABB] font-medium px-4 py-3 hidden md:table-cell">Date</th>
            <th class="text-center text-[#99AABB] font-medium px-4 py-3 hidden md:table-cell">Your Color</th>
          </tr>
        </thead>
        <tbody>
          {#each games as game (game.id)}
            <tr
              class="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
              onclick={() => { window.location.href = `/chess/${game.id}`; }}
            >
              <td class="px-4 py-3">
                <span class="text-white font-medium">{game.white}</span>
                <span class="text-[#99AABB] mx-1">vs</span>
                <span class="text-white font-medium">{game.black}</span>
              </td>
              <td class="px-4 py-3">
                <span class="font-mono font-semibold {resultBadgeColor(game.result)}">{formatResult(game.result)}</span>
              </td>
              <td class="px-4 py-3 text-[#99AABB] hidden sm:table-cell">{game.openingName || '—'}</td>
              <td class="px-4 py-3 text-[#99AABB] hidden md:table-cell">{game.date || '—'}</td>
              <td class="px-4 py-3 text-center hidden md:table-cell">
                {#if game.yourColor === 'white'}
                  <span class="inline-block w-4 h-4 rounded-full bg-white border border-white/20" title="White"></span>
                {:else if game.yourColor === 'black'}
                  <span class="inline-block w-4 h-4 rounded-full bg-[#2C3440] border border-white/20" title="Black"></span>
                {:else}
                  <span class="text-[#99AABB]/40">—</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Import PGN Modal -->
<Modal open={importModalOpen} onclose={() => { importModalOpen = false; importError = ''; }} title="Import PGN">
  <div class="space-y-4">
    <p class="text-[#99AABB] text-sm">Paste one or more PGN games below.</p>
    <textarea
      bind:value={importText}
      placeholder="[Event &quot;...&quot;]&#10;[White &quot;...&quot;]&#10;[Black &quot;...&quot;]&#10;&#10;1.e4 e5 2.Nf3 ..."
      rows="12"
      class="w-full bg-[#14181C] border border-white/[0.06] rounded-[6px] text-white text-sm p-3 font-mono placeholder:text-[#99AABB]/40 focus:outline-none focus:border-[#40BCF4] resize-none transition-colors"
    ></textarea>
    {#if importError}
      <p class="text-[#FF6B6B] text-sm">{importError}</p>
    {/if}
    <div class="flex justify-end gap-3">
      <Button variant="ghost" onclick={() => { importModalOpen = false; importError = ''; }}>Cancel</Button>
      <Button variant="primary" onclick={handleImport}>Import</Button>
    </div>
  </div>
</Modal>
