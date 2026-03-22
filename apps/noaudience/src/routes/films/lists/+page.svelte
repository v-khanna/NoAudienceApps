<script lang="ts">
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { getLists, createList } from '$lib/films/db';

  let lists = $state(getLists());
  let showNewListModal = $state(false);

  let newTitle = $state('');
  let newDescription = $state('');
  let newRanked = $state(false);

  function handleCreateList() {
    if (!newTitle.trim()) return;
    createList(newTitle.trim(), newDescription.trim(), newRanked);
    lists = getLists();
    newTitle = '';
    newDescription = '';
    newRanked = false;
    showNewListModal = false;
  }
</script>

<div class="max-w-3xl">
  <div class="flex items-center gap-12" style="margin-bottom: 24px;">
    <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">Lists</h1>
    <button class="new-list-btn" onclick={() => showNewListModal = true}>+ New List</button>
  </div>

  {#if lists.length > 0}
    <div class="lists-container">
      {#each lists as list, i}
        <div class="list-row" class:border-bottom={i < lists.length - 1}>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-8">
              <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">{list.title}</span>
              <span style="font-size: 13px; color: var(--text-tertiary);">{list.films.length} {list.films.length === 1 ? 'film' : 'films'}</span>
            </div>
          </div>
          {#if list.films.length > 0}
            <div class="poster-preview">
              {#each list.films.slice(0, 5) as film}
                <img
                  src={film.posterPath}
                  alt={film.title}
                  class="preview-poster"
                />
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <div style="padding: 32px 0; color: var(--text-secondary); text-align: center;">
      No lists yet. Create one to curate your films.
    </div>
  {/if}
</div>

<!-- New List Modal -->
<Modal open={showNewListModal} onclose={() => showNewListModal = false} title="New List">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <label class="field-label">Title</label>
      <input
        type="text"
        bind:value={newTitle}
        placeholder="List name..."
        class="field-input"
      />
    </div>

    <div>
      <label class="field-label">Description</label>
      <textarea
        bind:value={newDescription}
        placeholder="What is this list about?"
        rows="3"
        class="field-textarea"
      ></textarea>
    </div>

    <label class="flex items-center gap-8" style="cursor: pointer;">
      <input
        type="checkbox"
        bind:checked={newRanked}
        style="accent-color: var(--accent);"
      />
      <span style="font-size: 13px; color: var(--text-primary);">Ranked list</span>
    </label>

    <div class="flex justify-end">
      <button class="save-btn" onclick={handleCreateList} disabled={!newTitle.trim()}>Create List</button>
    </div>
  </div>
</Modal>

<style>
  .new-list-btn {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 13px;
    padding: 4px 0;
    transition: color 150ms ease-out;
  }
  .new-list-btn:hover {
    color: var(--text-primary);
  }

  .lists-container {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }

  .list-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    transition: background-color 150ms ease-out;
    cursor: pointer;
  }
  .list-row:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
  .list-row.border-bottom {
    border-bottom: 1px solid var(--border-subtle);
  }

  .poster-preview {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .preview-poster {
    width: 24px;
    height: 36px;
    object-fit: cover;
    border-radius: 2px;
    border: 1px solid var(--border);
  }

  .field-label {
    display: block;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .field-input {
    width: 100%;
    height: 32px;
    padding: 0 8px;
    background: var(--bg-inset);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }
  .field-input:focus {
    border-color: var(--accent);
  }

  .field-textarea {
    width: 100%;
    padding: 8px;
    background: var(--bg-inset);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    resize: none;
  }
  .field-textarea:focus {
    border-color: var(--accent);
  }

  .save-btn {
    background: var(--accent);
    color: #000;
    border: none;
    border-radius: 4px;
    height: 28px;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 150ms ease-out;
  }
  .save-btn:hover {
    opacity: 0.9;
  }
  .save-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
