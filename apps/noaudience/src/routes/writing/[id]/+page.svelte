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
    <!-- Top Bar - minimal -->
    <div class="flex items-center justify-between mb-12">
      <a
        href="/writing"
        class="inline-flex items-center gap-1.5 text-sm text-[#667788] hover:text-white transition-colors duration-200"
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
          class="w-full bg-transparent text-[38px] font-bold text-white placeholder:text-[#334455] focus:outline-none mb-10 leading-[1.15] tracking-tight"
          style="font-family: Charter, Georgia, 'Times New Roman', serif;"
        />

        <!-- Content Textarea -->
        <textarea
          value={content}
          oninput={handleContentInput}
          use:autoResize
          placeholder="Start writing..."
          class="w-full bg-transparent text-[18px] text-[#CCDDEE] placeholder:text-[#334455] focus:outline-none resize-none leading-[1.75] min-h-[60vh]"
          style="font-family: Charter, Georgia, 'Times New Roman', serif;"
        ></textarea>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="sticky bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 mt-8 border-t border-white/[0.04] bg-[#14181C]/80 backdrop-blur-sm">
      <div class="flex items-center gap-4 text-xs text-[#556677]">
        <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
        <span class="text-white/10">·</span>
        <span>{readingTime} min read</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-[#556677]">
        {#if saveStatus === 'Draft saved'}
          <span class="w-1.5 h-1.5 rounded-full bg-[#00E054] shadow-[0_0_6px_rgba(0,224,84,0.4)]"></span>
        {/if}
        <span>{saveStatus}</span>
      </div>
    </div>
  </div>
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    </div>
    <p class="text-[#778899] mb-3">Writing not found</p>
    <a href="/writing" class="text-sm text-[#40BCF4] hover:underline">Back to writings</a>
  </div>
{/if}
