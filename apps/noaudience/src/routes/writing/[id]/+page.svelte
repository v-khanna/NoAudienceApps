<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getWritingById, updateWriting } from '$lib/writing/db.svelte';

  let writing = $derived(getWritingById($page.params.id));

  let title = $state('');
  let content = $state('');
  let saveStatus = $state('Saved');
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  // Initialize from writing data
  $effect(() => {
    if (writing) {
      title = writing.title;
      content = writing.content;
    }
  });

  let wordCount = $derived(
    content.trim() ? content.trim().split(/\s+/).length : 0
  );
  let readingTime = $derived(Math.max(1, Math.ceil(wordCount / 250)));

  function scheduleSave() {
    saveStatus = 'Saving...';
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (writing) {
        updateWriting(writing.id, { title, content });
      }
      saveStatus = 'Saved';
    }, 800);
  }

  function handleTitleInput(e: Event) {
    title = (e.target as HTMLInputElement).value;
    scheduleSave();
  }

  function handleContentInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    content = textarea.value;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    scheduleSave();
  }

  function autoResize(node: HTMLTextAreaElement) {
    function resize() {
      node.style.height = 'auto';
      node.style.height = node.scrollHeight + 'px';
    }
    resize();
    return { update: resize };
  }
</script>

{#if writing}
  <div style="display: flex; flex-direction: column; min-height: 100%;">
    <!-- Top bar -->
    <div style="display: flex; align-items: center; margin-bottom: 32px;">
      <a
        href="/writing"
        class="back-link"
        style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-tertiary); text-decoration: none;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Writing
      </a>
    </div>

    <!-- Editor -->
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 100%; max-width: 600px;">
        <!-- Title -->
        <input
          type="text"
          value={title}
          oninput={handleTitleInput}
          placeholder="Title"
          style="
            width: 100%;
            background: transparent;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            border: none;
            outline: none;
            margin-bottom: 24px;
            line-height: 1.4;
            font-family: Georgia, Charter, 'Times New Roman', serif;
            box-sizing: border-box;
          "
        />

        <!-- Content -->
        <textarea
          value={content}
          oninput={handleContentInput}
          use:autoResize
          placeholder="Start writing..."
          style="
            width: 100%;
            background: transparent;
            font-size: 16px;
            color: var(--text-primary);
            border: none;
            outline: none;
            resize: none;
            line-height: 1.7;
            min-height: 60vh;
            font-family: Georgia, Charter, 'Times New Roman', serif;
            box-sizing: border-box;
          "
        ></textarea>
      </div>
    </div>

    <!-- Status bar -->
    <div style="
      position: sticky;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 0;
      margin-top: 24px;
      border-top: 1px solid var(--border);
      background: var(--bg-base);
    ">
      <span style="font-size: 11px; color: var(--text-tertiary);">
        {wordCount} words · {readingTime} min · {saveStatus}
      </span>
    </div>
  </div>
{:else}
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;">
    <p style="font-size: 12px; color: var(--text-tertiary);">Writing not found</p>
    <a href="/writing" style="font-size: 11px; color: var(--accent); text-decoration: none; margin-top: 8px;">Back to writings</a>
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-primary);
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--text-muted);
  }
</style>
