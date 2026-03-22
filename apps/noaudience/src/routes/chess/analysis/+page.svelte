<script lang="ts">
  import Button from '@noaudience/core/components/Button.svelte';
  import { createStartingPosition, pieceToUnicode, type Board } from '$lib/chess/pgn';

  const board = createStartingPosition();

  function getSquareColor(row: number, col: number): string {
    return (row + col) % 2 === 0 ? '#769656' : '#EEEED2';
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <a href="/chess" class="text-[#99AABB] hover:text-white transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </a>
    <div>
      <h1 class="text-2xl font-bold text-white">Analysis Board</h1>
      <p class="text-[#99AABB] text-sm">Analyze positions with engine assistance</p>
    </div>
  </div>

  <div class="flex gap-6 flex-col lg:flex-row">
    <!-- Board -->
    <div class="flex-shrink-0">
      <div class="inline-block border-2 border-[#2C3440] rounded-[4px] overflow-hidden">
        {#each Array(8) as _, displayRow}
          <div class="flex">
            {#each Array(8) as _, displayCol}
              {@const boardRow = 7 - displayRow}
              {@const boardCol = displayCol}
              {@const piece = board[boardRow][boardCol]}
              {@const bgColor = getSquareColor(boardRow, boardCol)}
              <div
                class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center select-none"
                style="background-color: {bgColor};"
              >
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
    </div>

    <!-- Analysis Panel -->
    <div class="flex-1 min-w-0 space-y-4">
      <!-- Eval Bar Placeholder -->
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[8px] p-4">
        <h3 class="text-white font-semibold text-sm mb-3">Engine Evaluation</h3>
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1 h-6 bg-[#2C3440] rounded-full overflow-hidden">
            <div class="h-full w-1/2 bg-gradient-to-r from-white/80 to-white/60 rounded-full"></div>
          </div>
          <span class="text-white font-mono text-sm">0.0</span>
        </div>
        <div class="flex items-center justify-center py-8 border border-dashed border-white/[0.08] rounded-[6px]">
          <div class="text-center">
            <p class="text-[#99AABB] text-sm mb-1">Stockfish integration coming soon</p>
            <p class="text-[#99AABB]/50 text-xs">Deep analysis with WASM-based engine</p>
          </div>
        </div>
      </div>

      <!-- Lines Placeholder -->
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[8px] p-4">
        <h3 class="text-white font-semibold text-sm mb-3">Top Lines</h3>
        <div class="space-y-2">
          {#each [1, 2, 3] as line}
            <div class="flex items-center gap-3 p-2 bg-white/[0.02] rounded-[4px]">
              <span class="text-[#99AABB]/30 font-mono text-xs">{line}.</span>
              <div class="flex-1 h-3 bg-white/[0.04] rounded animate-pulse"></div>
              <span class="text-[#99AABB]/30 font-mono text-xs">—</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
