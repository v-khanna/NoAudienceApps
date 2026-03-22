<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chessground } from 'chessground';
  import { Chess } from 'chess.js';
  import 'chessground/assets/chessground.base.css';
  import 'chessground/assets/chessground.brown.css';
  import 'chessground/assets/chessground.cburnett.css';

  import type { Api as CgApi } from 'chessground/api';
  import type { Key } from 'chessground/types';

  interface Props {
    moves: string[];
    annotations?: Record<number, string>;
    white: string;
    black: string;
    result: string;
  }

  let { moves, annotations = {}, white, black, result }: Props = $props();

  let boardEl: HTMLDivElement | undefined = $state();
  let moveListEl: HTMLDivElement | undefined = $state();
  let ground: CgApi | undefined = $state();
  let chess: Chess | undefined = $state();

  let currentMove = $state(0);
  let orientation = $state<'white' | 'black'>('white');
  let autoPlaying = $state(false);
  let autoPlayTimer: ReturnType<typeof setInterval> | undefined;

  let totalMoves = $derived(moves.length);

  let annotation = $derived.by(() => {
    if (!annotations || currentMove === 0) return '';
    return annotations[currentMove] ?? '';
  });

  function formatResult(r: string): string {
    if (r === '1/2-1/2') return '\u00BD-\u00BD';
    return r;
  }

  function navigateTo(moveIndex: number) {
    if (!chess || !ground) return;
    chess.reset();

    let lastFrom: Key | undefined;
    let lastTo: Key | undefined;

    for (let i = 0; i < moveIndex; i++) {
      const result = chess.move(moves[i]);
      if (result) {
        lastFrom = result.from as Key;
        lastTo = result.to as Key;
      }
    }

    ground.set({
      fen: chess.fen(),
      lastMove: lastFrom && lastTo ? [lastFrom, lastTo] : undefined,
      turnColor: chess.turn() === 'w' ? 'white' : 'black',
    });

    currentMove = moveIndex;
  }

  function goFirst() { navigateTo(0); }
  function goPrev() { if (currentMove > 0) navigateTo(currentMove - 1); }
  function goNext() { if (currentMove < totalMoves) navigateTo(currentMove + 1); }
  function goLast() { navigateTo(totalMoves); }

  function flipBoard() {
    orientation = orientation === 'white' ? 'black' : 'white';
    ground?.set({ orientation });
  }

  function toggleAutoPlay() {
    if (autoPlaying) {
      stopAutoPlay();
    } else {
      if (currentMove >= totalMoves) navigateTo(0);
      autoPlaying = true;
      autoPlayTimer = setInterval(() => {
        if (currentMove >= totalMoves) {
          stopAutoPlay();
          return;
        }
        navigateTo(currentMove + 1);
      }, 1000);
    }
  }

  function stopAutoPlay() {
    autoPlaying = false;
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = undefined;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    else if (e.key === 'Home') { e.preventDefault(); goFirst(); }
    else if (e.key === 'End') { e.preventDefault(); goLast(); }
  }

  $effect(() => {
    if (moveListEl && currentMove > 0) {
      const activeBtn = moveListEl.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  });

  onMount(() => {
    chess = new Chess();
    if (boardEl) {
      ground = Chessground(boardEl, {
        fen: chess.fen(),
        viewOnly: true,
        orientation,
        coordinates: true,
        animation: { enabled: true, duration: 200 },
        highlight: {
          lastMove: true,
          check: true,
        },
      });
    }
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    stopAutoPlay();
    ground?.destroy();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<div class="chess-board-container">
  <!-- Header: game info -->
  <div class="game-header">
    <span class="players">{white} vs {black}</span>
    <span class="separator">&middot;</span>
    <span class="result-display">{formatResult(result)}</span>
  </div>

  <!-- Main layout: Board + Moves -->
  <div class="main-layout">
    <!-- Board Section -->
    <div class="board-section">
      <!-- Black player label (top when white orientation) -->
      <div class="player-label">
        <span class="player-color" style="background: #333;"></span>
        <span>{orientation === 'white' ? black : white}</span>
      </div>

      <!-- Chessground board -->
      <div class="board-wrap">
        <div bind:this={boardEl} class="cg-board-wrap"></div>
      </div>

      <!-- White player label (bottom when white orientation) -->
      <div class="player-label">
        <span class="player-color" style="background: #eee;"></span>
        <span>{orientation === 'white' ? white : black}</span>
      </div>

      <!-- Controls -->
      <div class="controls">
        <button onclick={goFirst} disabled={currentMove === 0} class="ctrl-btn" title="First move (Home)">
          &#9198;
        </button>
        <button onclick={goPrev} disabled={currentMove === 0} class="ctrl-btn" title="Previous move (Left)">
          &#9664;
        </button>
        <button onclick={toggleAutoPlay} class="ctrl-btn" class:active-ctrl={autoPlaying} title="Auto-play">
          {autoPlaying ? '\u23F8' : '\u25B6'}
        </button>
        <button onclick={goNext} disabled={currentMove === totalMoves} class="ctrl-btn" title="Next move (Right)">
          &#9654;
        </button>
        <button onclick={goLast} disabled={currentMove === totalMoves} class="ctrl-btn" title="Last move (End)">
          &#9197;
        </button>
        <span class="move-counter">{currentMove}/{totalMoves}</span>
        <button onclick={flipBoard} class="ctrl-btn" title="Flip board" style="margin-left: 8px;">
          &#8693;
        </button>
      </div>
    </div>

    <!-- Move List Panel -->
    <div class="move-panel">
      <div bind:this={moveListEl} class="move-list-scroll">
        <div class="move-grid">
          {#each moves as move, i}
            {#if i % 2 === 0}
              <span class="move-number">{Math.floor(i / 2) + 1}.</span>
            {/if}
            <button
              data-active={i + 1 === currentMove}
              class="move-btn"
              class:active={i + 1 === currentMove}
              onclick={() => navigateTo(i + 1)}
            >
              {move}
            </button>
            {#if i % 2 === 0 && i === moves.length - 1}
              <span></span>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Annotation -->
      {#if annotation}
        <div class="annotation-box">
          {annotation}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .chess-board-container {
    width: 100%;
  }

  .game-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .players {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .separator {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .result-display {
    font-size: 12px;
    font-family: ui-monospace, monospace;
    color: var(--text-secondary);
  }

  .main-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  @media (min-width: 1024px) {
    .main-layout {
      flex-direction: row;
    }
  }

  .board-section {
    flex-shrink: 0;
  }

  .player-label {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .player-color {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1px solid var(--border);
  }

  .board-wrap {
    border: 1px solid var(--border-strong);
    border-radius: 2px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .cg-board-wrap {
    width: 448px;
    height: 448px;
  }

  @media (min-width: 768px) {
    .cg-board-wrap {
      width: 512px;
      height: 512px;
    }
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 10px;
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

  .active-ctrl {
    color: var(--accent);
  }

  .move-counter {
    font-size: 11px;
    font-family: ui-monospace, monospace;
    color: var(--text-tertiary);
    min-width: 48px;
    text-align: center;
  }

  .move-panel {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .move-list-scroll {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-surface);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
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

  .annotation-box {
    background: var(--bg-inset);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 12px;
    padding: 8px 12px;
    font-style: italic;
    line-height: 1.5;
  }

  /* Chessground dark theme overrides */
  :global(.chess-board-container cg-board) {
    background-color: #302e2b;
  }

  :global(.chess-board-container .cg-board-wrap coords.ranks) {
    color: var(--text-tertiary);
  }

  :global(.chess-board-container .cg-board-wrap coords.files) {
    color: var(--text-tertiary);
  }
</style>
