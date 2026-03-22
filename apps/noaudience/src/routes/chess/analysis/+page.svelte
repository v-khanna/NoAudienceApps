<script lang="ts">
  import Button from '@noaudience/core/components/Button.svelte';
  import { createStartingPosition, pieceToUnicode, type Board } from '$lib/chess/pgn';

  const board = createStartingPosition();

  function getSquareColor(row: number, col: number): string {
    return (row + col) % 2 === 0 ? '#779556' : '#EBECD0';
  }
</script>

<div class="space-y-6 max-w-6xl mx-auto">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/chess" class="text-[#99AABB] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.05]">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </a>
    <div>
      <h1 class="text-2xl font-bold text-white">Analysis Board</h1>
      <p class="text-[#99AABB]/60 text-sm">Analyze positions with engine assistance</p>
    </div>
  </div>

  <div class="flex gap-6 flex-col lg:flex-row items-start">
    <!-- Eval bar + Board -->
    <div class="flex gap-2 flex-shrink-0">
      <!-- Eval Bar -->
      <div class="hidden sm:flex flex-col w-7 rounded-lg overflow-hidden border border-white/[0.06]" style="height: calc(8 * 4.25rem);">
        <div class="flex-1 bg-white transition-all duration-500" style="flex: 1;"></div>
        <div class="flex-1 bg-[#1a1a1a] transition-all duration-500" style="flex: 1;"></div>
        <div class="absolute inset-x-0 flex items-center justify-center" style="top: calc(50% - 10px);">
        </div>
      </div>

      <!-- Board -->
      <div class="rounded-lg shadow-2xl" style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255,255,255,0.05);">
        <div class="rounded-lg overflow-hidden border-2 border-[#3D3426]" style="box-shadow: inset 0 2px 8px rgba(0,0,0,0.15);">
          {#each Array(8) as _, displayRow}
            <div class="flex">
              {#each Array(8) as _, displayCol}
                {@const boardRow = 7 - displayRow}
                {@const boardCol = displayCol}
                {@const piece = board[boardRow][boardCol]}
                {@const bgColor = getSquareColor(boardRow, boardCol)}
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
    </div>

    <!-- Analysis Panel -->
    <div class="flex-1 min-w-0 space-y-4">
      <!-- Engine Evaluation -->
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-xl overflow-hidden">
        <div class="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h3 class="text-white/80 font-semibold text-xs uppercase tracking-wider">Engine Evaluation</h3>
          <span class="text-white font-mono text-sm font-semibold tabular-nums">0.0</span>
        </div>
        <div class="p-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-1 h-2 bg-[#2C3440] rounded-full overflow-hidden">
              <div class="h-full w-1/2 bg-gradient-to-r from-white/90 to-white/60 rounded-full transition-all duration-300"></div>
            </div>
          </div>
          <div class="flex items-center justify-center py-10 rounded-lg border border-dashed border-white/[0.06] bg-white/[0.01]">
            <div class="text-center">
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#40BCF4]/10 border border-[#40BCF4]/20 mb-3">
                <div class="w-1.5 h-1.5 rounded-full bg-[#40BCF4] animate-pulse"></div>
                <span class="text-[#40BCF4] text-xs font-medium tracking-wide uppercase">Coming Soon</span>
              </div>
              <p class="text-[#99AABB]/50 text-xs">Deep analysis with WASM-based Stockfish</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Lines -->
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-xl overflow-hidden">
        <div class="px-4 py-3 border-b border-white/[0.06]">
          <h3 class="text-white/80 font-semibold text-xs uppercase tracking-wider">Top Lines</h3>
        </div>
        <div class="p-3 space-y-1.5">
          {#each [1, 2, 3] as line}
            <div class="flex items-center gap-3 px-3 py-2.5 bg-white/[0.02] rounded-lg">
              <span class="text-[#99AABB]/25 font-mono text-xs font-bold w-4 text-right">{line}</span>
              <div class="flex-1 h-3 bg-white/[0.03] rounded animate-pulse"></div>
              <span class="text-[#99AABB]/20 font-mono text-xs">--</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
