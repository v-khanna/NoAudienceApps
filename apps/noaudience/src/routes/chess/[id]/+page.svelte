<script lang="ts">
  import { page } from '$app/stores';
  import Button from '@noaudience/core/components/Button.svelte';
  import { getGameById, getParsedGame } from '$lib/chess/db';
  import { pieceToUnicode } from '$lib/chess/pgn';

  const gameId = $derived(Number($page.params.id));
  const game = $derived(getGameById(gameId));
  const parsed = $derived(getParsedGame(gameId));

  let currentMove = $state(0); // 0 = starting position
  let flipped = $state(false);
  let moveListEl: HTMLDivElement | undefined = $state();

  let currentBoard = $derived(parsed ? parsed.positions[currentMove] : null);
  let totalMoves = $derived(parsed ? parsed.moves.length : 0);

  let annotation = $derived.by(() => {
    if (!game?.annotations || currentMove === 0) return '';
    return (game.annotations as Record<number, string>)[currentMove] ?? '';
  });

  // Derive last-move squares by diffing positions
  let lastMoveSquares = $derived.by(() => {
    if (!parsed || currentMove === 0) return new Set<string>();
    const prev = parsed.positions[currentMove - 1];
    const curr = parsed.positions[currentMove];
    const changed = new Set<string>();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = prev[r][c];
        const q = curr[r][c];
        if (p !== q) {
          // They differ if one is null and other isn't, or different piece/color
          if (p === null || q === null || p.type !== q.type || p.color !== q.color) {
            changed.add(`${r},${c}`);
          }
        }
      }
    }
    return changed;
  });

  function goFirst() { currentMove = 0; }
  function goPrev() { if (currentMove > 0) currentMove--; }
  function goNext() { if (currentMove < totalMoves) currentMove++; }
  function goLast() { currentMove = totalMoves; }
  function toggleFlip() { flipped = !flipped; }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'ArrowRight') goNext();
    else if (e.key === 'Home') goFirst();
    else if (e.key === 'End') goLast();
  }

  function getSquareColor(row: number, col: number): string {
    return (row + col) % 2 === 0 ? '#779556' : '#EBECD0';
  }

  function getHighlightColor(row: number, col: number): string {
    return (row + col) % 2 === 0 ? '#BACA2B' : '#F6F669';
  }

  function getBoardRow(row: number): number {
    return flipped ? row : 7 - row;
  }

  function getBoardCol(col: number): number {
    return flipped ? 7 - col : col;
  }

  function formatResult(result: string): string {
    if (result === '1/2-1/2') return '\u00BD-\u00BD';
    return result;
  }

  function resultBadgeClasses(result: string): string {
    if (result === '1-0') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (result === '0-1') return 'bg-red-500/15 text-red-400 border-red-500/20';
    return 'bg-white/[0.06] text-[#99AABB] border-white/[0.08]';
  }

  // Scroll active move into view
  $effect(() => {
    if (moveListEl && currentMove > 0) {
      const activeBtn = moveListEl.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if !game || !parsed || !currentBoard}
  <div class="text-center py-16">
    <p class="text-[#99AABB] text-lg">Game not found.</p>
    <a href="/chess" class="text-[#40BCF4] hover:underline text-sm mt-2 inline-block">Back to library</a>
  </div>
{:else}
  <div class="space-y-5 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <a href="/chess" class="text-[#99AABB] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.05]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </a>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-xl font-bold text-white truncate">
            {game.white} <span class="text-[#99AABB] font-normal text-base">vs</span> {game.black}
          </h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border {resultBadgeClasses(game.result)}">
            {formatResult(game.result)}
          </span>
        </div>
        <p class="text-[#99AABB]/70 text-sm mt-0.5">
          {game.openingName || 'Unknown Opening'}
          {#if game.date} &middot; {game.date}{/if}
        </p>
      </div>
    </div>

    <!-- Main layout: Board + Moves -->
    <div class="flex gap-6 flex-col lg:flex-row items-start">
      <!-- Board Section -->
      <div class="flex-shrink-0">
        <!-- Board container with shadow and frame -->
        <div class="rounded-lg shadow-2xl" style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255,255,255,0.05);">
          <div class="rounded-lg overflow-hidden border-2 border-[#3D3426]" style="box-shadow: inset 0 2px 8px rgba(0,0,0,0.15);">
            {#each Array(8) as _, displayRow}
              <div class="flex">
                {#each Array(8) as _, displayCol}
                  {@const boardRow = getBoardRow(displayRow)}
                  {@const boardCol = getBoardCol(displayCol)}
                  {@const piece = currentBoard[boardRow][boardCol]}
                  {@const isHighlighted = lastMoveSquares.has(`${boardRow},${boardCol}`)}
                  {@const bgColor = isHighlighted ? getHighlightColor(boardRow, boardCol) : getSquareColor(boardRow, boardCol)}
                  <div
                    class="w-12 h-12 sm:w-14 sm:h-14 md:w-[4.25rem] md:h-[4.25rem] flex items-center justify-center select-none relative"
                    style="background-color: {bgColor};"
                  >
                    <!-- Coordinate labels -->
                    {#if displayCol === 0}
                      <span
                        class="absolute top-[2px] left-[3px] text-[10px] font-bold leading-none opacity-70 pointer-events-none"
                        style="color: {(boardRow + boardCol) % 2 === 0 ? '#EBECD0' : '#779556'};"
                      >
                        {String(boardRow + 1)}
                      </span>
                    {/if}
                    {#if displayRow === 7}
                      <span
                        class="absolute bottom-[2px] right-[3px] text-[10px] font-bold leading-none opacity-70 pointer-events-none"
                        style="color: {(boardRow + boardCol) % 2 === 0 ? '#EBECD0' : '#779556'};"
                      >
                        {'abcdefgh'[boardCol]}
                      </span>
                    {/if}
                    {#if piece}
                      <span
                        class="text-3xl sm:text-4xl md:text-[2.75rem] leading-none drop-shadow-sm"
                        style="text-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15); filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));"
                      >
                        {pieceToUnicode(piece)}
                      </span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        </div>

        <!-- Controls bar -->
        <div class="flex items-center justify-center gap-1.5 mt-4 bg-[#1B2028]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl px-3 py-2">
          <button
            onclick={goFirst}
            disabled={currentMove === 0}
            class="w-9 h-9 flex items-center justify-center rounded-lg text-[#99AABB] hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="First move (Home)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><line x1="7" y1="12" x2="18" y2="12"></line><line x1="18" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <button
            onclick={goPrev}
            disabled={currentMove === 0}
            class="w-9 h-9 flex items-center justify-center rounded-lg text-[#99AABB] hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous move (Left)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span class="text-[#99AABB]/60 text-xs font-mono min-w-[56px] text-center tabular-nums select-none">
            {currentMove} / {totalMoves}
          </span>
          <button
            onclick={goNext}
            disabled={currentMove === totalMoves}
            class="w-9 h-9 flex items-center justify-center rounded-lg text-[#99AABB] hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next move (Right)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button
            onclick={goLast}
            disabled={currentMove === totalMoves}
            class="w-9 h-9 flex items-center justify-center rounded-lg text-[#99AABB] hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Last move (End)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><line x1="6" y1="12" x2="17" y2="12"></line><line x1="6" y1="6" x2="6" y2="18"></line></svg>
          </button>
          <div class="w-px h-5 bg-white/[0.08] mx-1"></div>
          <button
            onclick={toggleFlip}
            class="w-9 h-9 flex items-center justify-center rounded-lg transition-all {flipped ? 'bg-[#40BCF4]/15 text-[#40BCF4]' : 'text-[#99AABB] hover:text-white hover:bg-white/[0.08]'}"
            title="Flip board"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
          </button>
        </div>

        <!-- Annotation -->
        {#if annotation}
          <div class="mt-3 p-3 bg-[#1B2028] border border-white/[0.06] rounded-lg">
            <p class="text-[#99AABB] text-sm italic leading-relaxed">{annotation}</p>
          </div>
        {/if}
      </div>

      <!-- Move List + Info -->
      <div class="flex-1 min-w-0 space-y-4">
        <!-- Move List -->
        <div class="bg-[#1B2028] border border-white/[0.06] rounded-xl overflow-hidden">
          <div class="px-4 py-3 border-b border-white/[0.06]">
            <h3 class="text-white/80 font-semibold text-xs uppercase tracking-wider">Moves</h3>
          </div>
          <div
            bind:this={moveListEl}
            class="max-h-[420px] overflow-y-auto p-3 scroll-smooth"
            style="scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;"
          >
            <div class="grid grid-cols-[2rem_1fr_1fr] gap-y-px text-sm font-mono">
              {#each parsed.moves as move, i}
                {#if move.color === 'w'}
                  <span class="text-[#99AABB]/40 text-right pr-2 py-1 text-xs self-center tabular-nums">{move.moveNumber}.</span>
                {/if}
                <button
                  data-active={i + 1 === currentMove}
                  class="text-left px-2 py-1 rounded transition-all cursor-pointer text-[13px] {
                    i + 1 === currentMove
                      ? 'bg-[#40BCF4]/15 text-[#40BCF4] font-medium'
                      : 'text-white/90 hover:bg-white/[0.05]'
                  }"
                  onclick={() => { currentMove = i + 1; }}
                >
                  {move.san}
                </button>
                {#if move.color === 'w' && i === parsed.moves.length - 1}
                  <span></span>
                {/if}
              {/each}
            </div>
          </div>
        </div>

        <!-- Game Info -->
        <div class="bg-[#1B2028] border border-white/[0.06] rounded-xl overflow-hidden">
          <div class="px-4 py-3 border-b border-white/[0.06]">
            <h3 class="text-white/80 font-semibold text-xs uppercase tracking-wider">Game Info</h3>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-[5.5rem_1fr] gap-y-2.5 text-sm">
              <span class="text-[#99AABB]/60 text-xs uppercase tracking-wider self-center">Event</span>
              <span class="text-white/90">{parsed.headers.event ?? '—'}</span>
              <span class="text-[#99AABB]/60 text-xs uppercase tracking-wider self-center">Date</span>
              <span class="text-white/90">{game.date || '—'}</span>
              <span class="text-[#99AABB]/60 text-xs uppercase tracking-wider self-center">ECO</span>
              <span class="text-white/90 font-mono">{game.openingEco || '—'}</span>
              <span class="text-[#99AABB]/60 text-xs uppercase tracking-wider self-center">Opening</span>
              <span class="text-white/90">{game.openingName || '—'}</span>
              <span class="text-[#99AABB]/60 text-xs uppercase tracking-wider self-center">Result</span>
              <span class="font-mono font-semibold {
                game.result === '1-0' ? 'text-emerald-400' :
                game.result === '0-1' ? 'text-red-400' : 'text-[#99AABB]'
              }">{formatResult(game.result)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
