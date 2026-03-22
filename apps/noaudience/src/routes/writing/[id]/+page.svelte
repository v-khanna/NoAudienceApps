<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getWritingById, updateWriting } from '$lib/writing/db.svelte';

  let writing = $derived(getWritingById($page.params.id));

  let title = $state('');
  let content = $state('');
  let saveStatus = $state('Draft saved');
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
      saveStatus = 'Draft saved';
    }, 800);
  }

  function handleTitleInput(e: Event) {
    title = (e.target as HTMLInputElement).value;
    scheduleSave();
  }

  function handleContentInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    content = textarea.value;
    // Auto-resize
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
  <div class="min-h-full flex flex-col">
    <!-- Top Bar -->
    <div class="flex items-center justify-between mb-8">
      <a
        href="/writing"
        class="inline-flex items-center gap-1.5 text-sm text-[#99AABB] hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </a>
    </div>

    <!-- Editor -->
    <div class="flex-1 flex flex-col items-center">
      <div class="w-full max-w-[660px]">
        <!-- Title -->
        <input
          type="text"
          value={title}
          oninput={handleTitleInput}
          placeholder="Title"
          class="w-full bg-transparent text-[32px] font-bold text-white placeholder:text-[#556677] focus:outline-none mb-8 leading-tight"
        />

        <!-- Content Textarea -->
        <textarea
          value={content}
          oninput={handleContentInput}
          use:autoResize
          placeholder="Start writing..."
          class="w-full bg-transparent text-[18px] text-[#D1D5DB] placeholder:text-[#556677] focus:outline-none resize-none leading-[1.65] min-h-[60vh]"
          style="font-family: Georgia, 'Times New Roman', serif;"
        ></textarea>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="sticky bottom-0 left-0 right-0 flex items-center justify-between px-2 py-3 mt-8 border-t border-white/[0.06] bg-[#14181C]">
      <div class="flex items-center gap-4 text-xs text-[#667788]">
        <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
        <span>{readingTime} min read</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs text-[#667788]">
        <span>{saveStatus}</span>
        {#if saveStatus === 'Draft saved'}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00E054" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center h-full">
    <div class="text-center">
      <p class="text-lg text-[#667788] mb-4">Writing not found</p>
      <a href="/writing" class="text-sm text-[#40BCF4] hover:underline">Back to writings</a>
    </div>
  </div>
{/if}
