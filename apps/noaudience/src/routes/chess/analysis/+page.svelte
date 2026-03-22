<script lang="ts">
  import { createStartingPosition, pieceToUnicode } from '$lib/chess/pgn';

  const board = createStartingPosition();

  function getSquareColor(row: number, col: number): string {
    return (row + col) % 2 === 0 ? '#769656' : '#EEEED2';
  }
</script>

<div>
  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
    <a href="/chess" style="font-size: 12px; color: var(--text-tertiary); text-decoration: none;" class="back-link">&larr;</a>
    <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Analysis Board</h1>
  </div>

  <div style="display: flex; gap: 20px; align-items: flex-start;" class="main-layout">
    <!-- Eval bar + Board -->
    <div style="display: flex; gap: 0; flex-shrink: 0;">
      <!-- Eval Bar -->
      <div
        class="eval-bar"
        style="
          width: 20px;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: 2px;
          overflow: hidden;
          margin-right: 6px;
        "
      >
        <div style="flex: 1; background: #EEEED2;"></div>
        <div style="flex: 1; background: #2C2C2C;"></div>
      </div>

      <!-- Board -->
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
              {@const boardRow = 7 - displayRow}
              {@const boardCol = displayCol}
              {@const piece = board[boardRow][boardCol]}
              {@const bgColor = getSquareColor(boardRow, boardCol)}
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
    </div>

    <!-- Analysis Panel -->
    <div style="flex: 1; min-width: 0;">
      <p style="font-size: 12px; color: var(--text-tertiary);">Engine analysis coming soon</p>
    </div>
  </div>
</div>

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

  .eval-bar {
    height: calc(8 * 56px);
  }

  @media (min-width: 768px) {
    .eval-bar {
      height: calc(8 * 64px);
    }
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
</style>
