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

  let currentBoard = $derived(parsed ? parsed.positions[currentMove] : null);
  let totalMoves = $derived(parsed ? parsed.moves.length : 0);

  let annotation = $derived.by(() => {
    if (!game?.annotations || currentMove === 0) return '';
    return (game.annotations as Record<number, string>)[currentMove] ?? '';
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
    return (row + col) % 2 === 0 ? '#769656' : '#EEEED2';
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
</script>

<svelte:window onkeydown={handleKeydown} />

{#if !game || !parsed || !currentBoard}
  <div class="text-center py-16">
    <p class="text-[#99AABB] text-lg">Game not found.</p>
    <a href="/chess" class="text-[#40BCF4] hover:underline text-sm mt-2 inline-block">Back to library</a>
  </div>
{:else}
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <a href="/chess" class="text-[#99AABB] hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </a>
      <div class="flex-1">
        <h1 class="text-xl font-bold text-white">
          {game.white} <span class="text-[#99AABB] font-normal">vs</span> {game.black}
        </h1>
        <p class="text-[#99AABB] text-sm">
          {game.openingName || 'Unknown Opening'}
          {#if game.date} &middot; {game.date}{/if}
          &middot; <span class="font-mono font-semibold">{formatResult(game.result)}</span>
        </p>
      </div>
    </div>

    <!-- Main layout: Board + Moves -->
    <div class="flex gap-6 flex-col lg:flex-row">
      <!-- Board Section -->
      <div class="flex-shrink-0">
        <!-- Board -->
        <div class="inline-block border-2 border-[#2C3440] rounded-[4px] overflow-hidden">
          {#each Array(8) as _, displayRow}
            <div class="flex">
              {#each Array(8) as _, displayCol}
                {@const boardRow = getBoardRow(displayRow)}
                {@const boardCol = getBoardCol(displayCol)}
                {@const piece = currentBoard[boardRow][boardCol]}
                {@const bgColor = getSquareColor(boardRow, boardCol)}
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center select-none relative"
                  style="background-color: {bgColor};"
                >
                  <!-- Coordinate labels -->
                  {#if displayCol === 0}
                    <span
                      class="absolute top-0.5 left-0.5 text-[10px] font-semibold leading-none"
                      style="color: {(boardRow + boardCol) % 2 === 0 ? '#EEEED2' : '#769656'};"
                    >
                      {String(boardRow + 1)}
                    </span>
                  {/if}
                  {#if displayRow === 7}
                    <span
                      class="absolute bottom-0.5 right-1 text-[10px] font-semibold leading-none"
                      style="color: {(boardRow + boardCol) % 2 === 0 ? '#EEEED2' : '#769656'};"
                    >
                      {'abcdefgh'[boardCol]}
                    </span>
                  {/if}
                  {#if piece}
                    <span class="text-3xl sm:text-4xl md:text-[42px] leading-none" style="text-shadow: 0 1px 3px rgba(0,0,0,0.3);">
                      {pieceToUnicode(piece)}
                    </span>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-center gap-2 mt-3">
          <Button variant="ghost" size="sm" onclick={goFirst} disabled={currentMove === 0}>
            <span class="text-lg">&#x23EE;</span>
          </Button>
          <Button variant="ghost" size="sm" onclick={goPrev} disabled={currentMove === 0}>
            <span class="text-lg">&#x25C0;</span>
          </Button>
          <span class="text-[#99AABB] text-sm font-mono min-w-[60px] text-center">
            {currentMove} / {totalMoves}
          </span>
          <Button variant="ghost" size="sm" onclick={goNext} disabled={currentMove === totalMoves}>
            <span class="text-lg">&#x25B6;</span>
          </Button>
          <Button variant="ghost" size="sm" onclick={goLast} disabled={currentMove === totalMoves}>
            <span class="text-lg">&#x23ED;</span>
          </Button>
          <div class="w-px h-6 bg-white/10 mx-1"></div>
          <Button variant="ghost" size="sm" onclick={toggleFlip}>
            <span class="text-lg">&#x1F504;</span>
          </Button>
        </div>

        <!-- Annotation -->
        {#if annotation}
          <div class="mt-3 p-3 bg-[#1B2028] border border-white/[0.06] rounded-[6px]">
            <p class="text-[#99AABB] text-sm italic">{annotation}</p>
          </div>
        {/if}
      </div>

      <!-- Move List -->
      <div class="flex-1 min-w-0">
        <div class="bg-[#1B2028] border border-white/[0.06] rounded-[8px] p-4 max-h-[520px] overflow-y-auto">
          <h3 class="text-white font-semibold text-sm mb-3">Moves</h3>
          <div class="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-0.5 text-sm font-mono">
            {#each parsed.moves as move, i}
              {#if move.color === 'w'}
                <span class="text-[#99AABB]/50 text-right pr-1">{move.moveNumber}.</span>
              {/if}
              <button
                class="text-left px-1.5 py-0.5 rounded-[3px] transition-colors cursor-pointer {
                  i + 1 === currentMove
                    ? 'bg-[#40BCF4]/20 text-[#40BCF4]'
                    : 'text-white hover:bg-white/[0.06]'
                }"
                onclick={() => { currentMove = i + 1; }}
              >
                {move.san}
              </button>
              {#if move.color === 'w' && i === parsed.moves.length - 1}
                <!-- Odd number of moves — fill the black cell -->
                <span></span>
              {/if}
            {/each}
          </div>
        </div>

        <!-- Game Info -->
        <div class="mt-4 bg-[#1B2028] border border-white/[0.06] rounded-[8px] p-4">
          <h3 class="text-white font-semibold text-sm mb-2">Game Info</h3>
          <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <span class="text-[#99AABB]">Event</span>
            <span class="text-white">{parsed.headers.event ?? '—'}</span>
            <span class="text-[#99AABB]">Date</span>
            <span class="text-white">{game.date || '—'}</span>
            <span class="text-[#99AABB]">ECO</span>
            <span class="text-white">{game.openingEco || '—'}</span>
            <span class="text-[#99AABB]">Opening</span>
            <span class="text-white">{game.openingName || '—'}</span>
            <span class="text-[#99AABB]">Result</span>
            <span class="text-white font-mono">{formatResult(game.result)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
