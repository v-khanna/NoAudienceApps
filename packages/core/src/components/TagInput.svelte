<script lang="ts">
  interface Props {
    tags?: string[];
    placeholder?: string;
    onchange?: (tags: string[]) => void;
  }

  let {
    tags = $bindable([]),
    placeholder = 'Add tag...',
    onchange,
  }: Props = $props();

  let inputValue = $state('');

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      tags = [...tags, tag];
      onchange?.(tags);
    }
    inputValue = '';
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index);
    onchange?.(tags);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }
</script>

<div class="flex flex-wrap items-center gap-2 p-2 bg-[#1B2028] border border-white/[0.06] rounded-[6px] focus-within:border-[#40BCF4] transition-colors">
  {#each tags as tag, i}
    <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2C3440] rounded-[4px] text-sm text-white">
      {tag}
      <button
        class="text-[#99AABB] hover:text-white cursor-pointer"
        onclick={() => removeTag(i)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  {/each}
  <input
    type="text"
    bind:value={inputValue}
    {placeholder}
    onkeydown={handleKeydown}
    class="flex-1 min-w-[80px] bg-transparent text-white text-sm placeholder:text-[#99AABB] focus:outline-none"
  />
</div>
