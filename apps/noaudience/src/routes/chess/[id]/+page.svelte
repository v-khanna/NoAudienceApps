<script lang="ts">
  import { page } from '$app/stores';
  import { getGameById, getParsedGame } from '$lib/chess/db';
  import { pieceToUnicode } from '$lib/chess/pgn';

  const gameId = $derived(Number($page.params.id));
  const game = $derived(getGameById(gameId));
  const parsed = $derived(getParsedGame(gameId));

  let currentMove = $state(0);
  let flipped = $state(false);
  let moveListEl: HTMLDivElement | undefined = $state();

  let currentBoard = $derived(parsed ? parsed.positions[currentMove] : null);
  let totalMoves = $derived(parsed ? parsed.moves.length : 0);

  let annotation = $derived.by(() => {
    if (!game?.annotations || currentMove === 0) return '';
    return (game.annotations as Record<number, string>)[currentMove] ?? '';
  });

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
    return (row + col) % 2 === 0 ? '#769656' : '#EEEED2';
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
  <div style="text-align: center; padding: 48px 0;">
    <p style="font-size: 12px; color: var(--text-secondary);">Game not found.</p>
    <a href="/chess" style="font-size: 11px; color: var(--accent); text-decoration: none;">Back to library</a>
  </div>
{:else}
  <div>
    <!-- Header: inline game info -->
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
      <a href="/chess" style="font-size: 12px; color: var(--text-tertiary); text-decoration: none;" class="back-link">&larr;</a>
      <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">{game.white} vs {game.black}</span>
      <span style="font-size: 12px; color: var(--text-tertiary);">&middot;</span>
      <span style="font-size: 12px; font-family: ui-monospace, monospace; color: var(--text-secondary);">{formatResult(game.result)}</span>
      {#if game.openingName}
        <span style="font-size: 12px; color: var(--text-tertiary);">&middot;</span>
        <span style="font-size: 12px; color: var(--text-secondary);">{game.openingName}</span>
      {/if}
    </div>

    <!-- Main layout: Board + Moves -->
    <div style="display: flex; gap: 20px; align-items: flex-start;" class="main-layout">
      <!-- Board Section -->
      <div style="flex-shrink: 0;">
        <!-- Board container -->
        <div
          style="
            border: 1px solid var(--border-strong);
            border-radius: 2px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "
        >
          {#each Array(8) as _, displayRow}
            <div style="display: flex;">
              {#each Array(8) as _, displayCol}
                {@const boardRow = getBoardRow(displayRow)}
                {@const boardCol = getBoardCol(displayCol)}
                {@const piece = currentBoard[boardRow][boardCol]}
                {@const isHighlighted = lastMoveSquares.has(`${boardRow},${boardCol}`)}
                {@const bgColor = isHighlighted ? getHighlightColor(boardRow, boardCol) : getSquareColor(boardRow, boardCol)}
                <div
                  class="board-square"
                  style="background-color: {bgColor}; position: relative;"
                >
                  {#if displayCol === 0}
                    <span
                      style="
                        position: absolute;
                        top: 2px;
                        left: 3px;
                        font-size: 9px;
                        font-weight: 600;
                        line-height: 1;
                        pointer-events: none;
                        color: {(boardRow + boardCol) % 2 === 0 ? '#EEEED2' : '#769656'};
                        opacity: 0.8;
                      "
                    >
                      {String(boardRow + 1)}
                    </span>
                  {/if}
                  {#if displayRow === 7}
                    <span
                      style="
                        position: absolute;
                        bottom: 2px;
                        right: 3px;
                        font-size: 9px;
                        font-weight: 600;
                        line-height: 1;
                        pointer-events: none;
                        color: {(boardRow + boardCol) % 2 === 0 ? '#EEEED2' : '#769656'};
                        opacity: 0.8;
                      "
                    >
                      {'abcdefgh'[boardCol]}
                    </span>
                  {/if}
                  {#if piece}
                    <span style="font-size: 2.5rem; line-height: 1; user-select: none; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                      {pieceToUnicode(piece)}
                    </span>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>

        <!-- Controls: simple text buttons -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 10px;">
          <button
            onclick={goFirst}
            disabled={currentMove === 0}
            class="ctrl-btn"
            title="First move (Home)"
          >&#9198;</button>
          <button
            onclick={goPrev}
            disabled={currentMove === 0}
            class="ctrl-btn"
            title="Previous move (Left)"
          >&#9664;</button>
          <span style="font-size: 11px; font-family: ui-monospace, monospace; color: var(--text-tertiary); min-width: 48px; text-align: center;">
            {currentMove}/{totalMoves}
          </span>
          <button
            onclick={goNext}
            disabled={currentMove === totalMoves}
            class="ctrl-btn"
            title="Next move (Right)"
          >&#9654;</button>
          <button
            onclick={goLast}
            disabled={currentMove === totalMoves}
            class="ctrl-btn"
            title="Last move (End)"
          >&#9197;</button>
          <button
            onclick={toggleFlip}
            class="ctrl-btn"
            title="Flip board"
            style="margin-left: 8px;"
          >&#128260;</button>
        </div>
      </div>

      <!-- Move List -->
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px;">
        <div
          bind:this={moveListEl}
          style="
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid var(--border);
            border-radius: 6px;
            background: var(--bg-surface);
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.08) transparent;
          "
        >
          <div class="move-grid">
            {#each parsed.moves as move, i}
              {#if move.color === 'w'}
                <span class="move-number">{move.moveNumber}.</span>
              {/if}
              <button
                data-active={i + 1 === currentMove}
                class="move-btn"
                class:active={i + 1 === currentMove}
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

        <!-- Annotation -->
        {#if annotation}
          <textarea
            readonly
            value={annotation}
            rows="3"
            style="
              width: 100%;
              background: var(--bg-inset);
              border: 1px solid var(--border);
              border-radius: 4px;
              color: var(--text-secondary);
              font-size: 12px;
              padding: 8px;
              outline: none;
              resize: vertical;
              font-style: italic;
              box-sizing: border-box;
            "
          ></textarea>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .board-square {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }

  @media (min-width: 768px) {
    .board-square {
      width: 64px;
      height: 64px;
    }
  }

  .ctrl-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: color 150ms ease-out;
    line-height: 1;
  }

  .ctrl-btn:hover:not(:disabled) {
    color: var(--text-primary);
  }

  .ctrl-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .back-link:hover {
    color: var(--text-secondary);
  }

  .move-grid {
    display: grid;
    grid-template-columns: 2rem 1fr 1fr;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    padding: 4px;
  }

  .move-number {
    color: var(--text-tertiary);
    text-align: right;
    padding-right: 6px;
    padding-top: 3px;
    padding-bottom: 3px;
    font-size: 11px;
    align-self: center;
  }

  .move-btn {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: ui-monospace, monospace;
    font-size: 12px;
    text-align: left;
    padding: 3px 6px;
    cursor: pointer;
    border-radius: 3px;
    transition: background 100ms ease-out;
  }

  .move-btn:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .move-btn.active {
    background: var(--accent-muted);
    color: var(--accent);
    font-weight: 500;
  }

  .main-layout {
    flex-direction: column;
  }

  @media (min-width: 1024px) {
    .main-layout {
      flex-direction: row;
    }
  }
</style>
