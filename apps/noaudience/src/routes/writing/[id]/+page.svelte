<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getWritingById, updateWriting, deleteWriting, type Writing } from '$lib/writing/db';
  import Editor from '$lib/writing/Editor.svelte';

  let writing = $state<Writing | undefined>(undefined);
  let title = $state('');
  let loading = $state(true);
  let saveStatus = $state('Saved');
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  onMount(async () => {
    const id = Number($page.params.id);
    if (isNaN(id)) {
      loading = false;
      return;
    }
    const result = await getWritingById(id);
    if (result) {
      writing = result;
      title = result.title;
    }
    loading = false;
  });

  function scheduleSave(updates: Partial<{ title: string; contentHtml: string; contentMarkdown: string }>) {
    if (!writing) return;
    saveStatus = 'Saving...';
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      if (!writing) return;
      const updated = await updateWriting(writing.id, updates);
      if (updated) {
        writing = updated;
      }
      saveStatus = 'Saved';
    }, 500);
  }

  function handleTitleInput(e: Event) {
    title = (e.target as HTMLInputElement).value;
    scheduleSave({ title });
  }

  function handleEditorUpdate(html: string, text: string) {
    scheduleSave({ contentHtml: html, contentMarkdown: text });
  }

  async function handleDelete() {
    if (!writing) return;
    const confirmed = window.confirm('Delete this writing?');
    if (!confirmed) return;
    await deleteWriting(writing.id);
    goto('/writing');
  }
</script>

{#if loading}
  <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading...</p>
  </div>
{:else if writing}
  <div style="display: flex; flex-direction: column; min-height: 100%;">
    <!-- Top bar -->
    <div style="display: flex; align-items: center; margin-bottom: 40px;">
      <a
        href="/writing"
        class="back-link"
        style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-tertiary); text-decoration: none;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Writing
      </a>
      <div style="flex: 1;"></div>
      <span style="font-size: 13px; color: var(--text-tertiary); margin-right: 16px;">{saveStatus}</span>
      <button class="delete-btn" onclick={handleDelete} title="Delete writing">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>

    <!-- Editor area -->
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 100%; max-width: 720px;">
        <!-- Title -->
        <input
          type="text"
          value={title}
          oninput={handleTitleInput}
          placeholder="Title"
          style="
            width: 100%;
            background: transparent;
            font-size: 32px;
            font-weight: 700;
            color: var(--text-primary);
            border: none;
            outline: none;
            margin-bottom: 28px;
            line-height: 1.3;
            font-family: Georgia, Charter, 'Times New Roman', serif;
            box-sizing: border-box;
          "
        />

        <!-- TipTap Editor -->
        <Editor
          content={writing.contentHtml ?? ''}
          onUpdate={handleEditorUpdate}
          editable={true}
        />
      </div>
    </div>
  </div>
{:else}
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Writing not found</p>
    <a href="/writing" style="font-size: 13px; color: var(--accent); text-decoration: none; margin-top: 12px;">Back to writings</a>
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-primary);
  }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 150ms ease-out;
  }

  .delete-btn:hover {
    background: rgba(255, 80, 80, 0.1);
    color: #ff5050;
  }

  input::placeholder {
    color: var(--text-muted);
  }
</style>
