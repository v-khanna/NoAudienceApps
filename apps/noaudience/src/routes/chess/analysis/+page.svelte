<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chessground } from 'chessground';
  import { Chess } from 'chess.js';
  import 'chessground/assets/chessground.base.css';
  import 'chessground/assets/chessground.brown.css';
  import 'chessground/assets/chessground.cburnett.css';

  import type { Api as CgApi } from 'chessground/api';
  import type { Key, Color } from 'chessground/types';

  let boardEl: HTMLDivElement | undefined = $state();
  let ground: CgApi | undefined = $state();
  let chess = new Chess();

  let orientation = $state<'white' | 'black'>('white');
  let moveHistory = $state<string[]>([]);
  let currentFen = $state('');
  let fenInput = $state('');

  function toDests(): Map<Key, Key[]> {
    const dests = new Map<Key, Key[]>();
    for (const move of chess.moves({ verbose: true })) {
      const from = move.from as Key;
      const to = move.to as Key;
      if (!dests.has(from)) dests.set(from, []);
      dests.get(from)!.push(to);
    }
    return dests;
  }

  function turnColor(): Color {
    return chess.turn() === 'w' ? 'white' : 'black';
  }

  function updateBoard() {
    if (!ground) return;
    currentFen = chess.fen();
    ground.set({
      fen: currentFen,
      turnColor: turnColor(),
      movable: {
        color: turnColor(),
        free: false,
        dests: toDests(),
      },
      check: chess.isCheck(),
    });
  }

  function onMove(orig: Key, dest: Key) {
    // Try the move — handle promotion to queen by default
    const move = chess.move({ from: orig, to: dest, promotion: 'q' });
    if (move) {
      moveHistory = [...moveHistory, move.san];
      updateBoard();
    } else {
      // Invalid move, reset board
      updateBoard();
    }
  }

  function resetBoard() {
    chess.reset();
    moveHistory = [];
    updateBoard();
  }

  function undoMove() {
    const undone = chess.undo();
    if (undone) {
      moveHistory = moveHistory.slice(0, -1);
      updateBoard();
    }
  }

  function flipBoard() {
    orientation = orientation === 'white' ? 'black' : 'white';
    ground?.set({ orientation });
  }

  function loadFen() {
    if (!fenInput.trim()) return;
    try {
      chess.load(fenInput.trim());
      moveHistory = [];
      updateBoard();
      fenInput = '';
    } catch {
      // Invalid FEN — ignore
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      undoMove();
    }
  }

  onMount(() => {
    if (boardEl) {
      ground = Chessground(boardEl, {
        fen: chess.fen(),
        orientation,
        coordinates: true,
        animation: { enabled: true, duration: 200 },
        movable: {
          color: turnColor(),
          free: false,
          dests: toDests(),
        },
        highlight: {
          lastMove: true,
          check: true,
        },
        events: {
          move: onMove,
        },
      });
      currentFen = chess.fen();
    }
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    ground?.destroy();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<div>
  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
    <a href="/chess" style="font-size: 15px; color: var(--text-tertiary); text-decoration: none;" class="back-link">&larr;</a>
    <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Analysis Board</h1>
  </div>

  <div class="main-layout" style="display: flex; gap: 28px; align-items: flex-start;">
    <!-- Board -->
    <div style="flex-shrink: 0;">
      <div
        style="
          border: 1px solid var(--border-strong);
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "
      >
        <div bind:this={boardEl} class="cg-board-wrap"></div>
      </div>

      <!-- Controls -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px;">
        <button onclick={resetBoard} class="ctrl-btn" title="Reset board">
          New
        </button>
        <button onclick={undoMove} class="ctrl-btn" disabled={moveHistory.length === 0} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button onclick={flipBoard} class="ctrl-btn" title="Flip board">
          &#8693;
        </button>
      </div>
    </div>

    <!-- Analysis Panel -->
    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px;">
      <!-- FEN input -->
      <div style="display: flex; gap: 8px;">
        <input
          type="text"
          bind:value={fenInput}
          placeholder="Load FEN position..."
          style="
            flex: 1;
            height: 40px;
            padding: 0 12px;
            font-size: 13px;
            font-family: ui-monospace, monospace;
            background: var(--bg-inset);
            border: 1px solid var(--border);
            border-radius: 4px;
            color: var(--text-primary);
            outline: none;
          "
          onkeydown={(e) => { if (e.key === 'Enter') loadFen(); }}
        />
        <button
          onclick={loadFen}
          class="ctrl-btn"
          style="border: 1px solid var(--border); padding: 0 14px; font-size: 13px;"
        >
          Load
        </button>
      </div>

      <!-- Current FEN -->
      <div style="font-size: 13px; font-family: ui-monospace, monospace; color: var(--text-tertiary); word-break: break-all;">
        {currentFen}
      </div>

      <!-- Move history -->
      {#if moveHistory.length > 0}
        <div
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
            {#each moveHistory as move, i}
              {#if i % 2 === 0}
                <span class="move-number">{Math.floor(i / 2) + 1}.</span>
              {/if}
              <span class="move-entry">{move}</span>
              {#if i % 2 === 0 && i === moveHistory.length - 1}
                <span></span>
              {/if}
            {/each}
          </div>
        </div>
      {:else}
        <p style="font-size: 15px; color: var(--text-tertiary);">Make moves on the board to begin analysis.</p>
      {/if}

      <!-- Game status -->
      {#if chess.isCheckmate()}
        <div style="font-size: 15px; font-weight: 600; color: var(--accent);">
          Checkmate! {chess.turn() === 'w' ? 'Black' : 'White'} wins.
        </div>
      {:else if chess.isDraw()}
        <div style="font-size: 15px; font-weight: 600; color: var(--text-secondary);">
          Draw.
        </div>
      {:else if chess.isCheck()}
        <div style="font-size: 15px; color: #EF4444;">
          Check!
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .cg-board-wrap {
    width: 520px;
    height: 520px;
  }

  @media (min-width: 768px) {
    .cg-board-wrap {
      width: 580px;
      height: 580px;
    }
  }

  .ctrl-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 15px;
    cursor: pointer;
    padding: 6px 12px;
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

  .main-layout {
    flex-direction: column;
  }

  @media (min-width: 1024px) {
    .main-layout {
      flex-direction: row;
    }
  }

  .move-grid {
    display: grid;
    grid-template-columns: 2.5rem 1fr 1fr;
    font-family: ui-monospace, monospace;
    font-size: 15px;
    padding: 6px;
  }

  .move-number {
    color: var(--text-tertiary);
    text-align: right;
    padding-right: 8px;
    padding-top: 4px;
    padding-bottom: 4px;
    font-size: 13px;
    align-self: center;
  }

  .move-entry {
    color: var(--text-primary);
    padding: 4px 8px;
    font-size: 15px;
  }

  input:focus {
    border-color: var(--accent);
  }
</style>
