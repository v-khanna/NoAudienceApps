<script lang="ts">
  import { page } from '$app/stores';
  import { getGameById, getParsedGame, deleteGame, type ChessGame } from '$lib/chess/db';
  import { goto } from '$app/navigation';
  import type { ParsedGame } from '$lib/chess/pgn';
  import Board from '$lib/chess/Board.svelte';

  const gameId = $derived(Number($page.params.id));

  let game = $state<ChessGame | undefined>(undefined);
  let parsed = $state<ParsedGame | null>(null);
  let loading = $state(true);
  let confirmDelete = $state(false);

  $effect(() => {
    const id = gameId;
    loading = true;
    Promise.all([getGameById(id), getParsedGame(id)]).then(([g, p]) => {
      game = g;
      parsed = p;
      loading = false;
    });
  });

  let sanMoves = $derived(parsed ? parsed.moves.map((m) => m.san) : []);

  async function handleDelete() {
    if (!game) return;
    await deleteGame(game.id);
    goto('/chess');
  }
</script>

{#if loading}
  <div style="text-align: center; padding: 48px 0;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading game...</p>
  </div>
{:else if !game || !parsed}
  <div style="text-align: center; padding: 48px 0;">
    <p style="font-size: 15px; color: var(--text-secondary);">Game not found.</p>
    <a href="/chess" style="font-size: 13px; color: var(--accent); text-decoration: none;">Back to library</a>
  </div>
{:else}
  <div>
    <!-- Header -->
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <a href="/chess" style="font-size: 15px; color: var(--text-tertiary); text-decoration: none;" class="back-link">&larr;</a>
      <span style="font-size: 18px; font-weight: 600; color: var(--text-primary);">{game.white} vs {game.black}</span>
      {#if game.openingName}
        <span style="font-size: 15px; color: var(--text-tertiary);">&middot;</span>
        <span style="font-size: 15px; color: var(--text-secondary);">{game.openingName}</span>
      {/if}
      {#if game.openingEco}
        <span style="font-size: 13px; font-family: ui-monospace, monospace; color: var(--text-tertiary);">({game.openingEco})</span>
      {/if}
      <div style="flex: 1;"></div>
      {#if !confirmDelete}
        <button
          onclick={() => confirmDelete = true}
          style="
            height: 40px;
            padding: 0 14px;
            font-size: 13px;
            color: var(--text-tertiary);
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 4px;
            cursor: pointer;
          "
          class="delete-btn"
        >
          Delete
        </button>
      {:else}
        <span style="font-size: 13px; color: var(--text-secondary);">Delete this game?</span>
        <button
          onclick={handleDelete}
          style="
            height: 40px;
            padding: 0 14px;
            font-size: 13px;
            color: #EF4444;
            background: transparent;
            border: 1px solid #EF4444;
            border-radius: 4px;
            cursor: pointer;
          "
          class="delete-btn"
        >
          Confirm
        </button>
        <button
          onclick={() => confirmDelete = false}
          style="
            height: 40px;
            padding: 0 14px;
            font-size: 13px;
            color: var(--text-secondary);
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 4px;
            cursor: pointer;
          "
          class="delete-btn"
        >
          Cancel
        </button>
      {/if}
    </div>

    <!-- Board Component -->
    <Board
      moves={sanMoves}
      annotations={game.annotations as Record<number, string> | undefined}
      white={game.white ?? 'Unknown'}
      black={game.black ?? 'Unknown'}
      result={game.result ?? '*'}
    />
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-secondary);
  }

  .delete-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
