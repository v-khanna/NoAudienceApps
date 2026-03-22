<script lang="ts">
  import { getOwnPosts } from '$lib/articles/db';

  let posts = $derived(getOwnPosts());

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
</script>

<div class="mb-10">
  <a href="/articles" class="inline-flex items-center gap-1.5 text-sm text-[#778899] hover:text-white transition-colors duration-200 mb-5">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    Articles
  </a>
  <h1 class="text-3xl font-bold text-white tracking-tight" style="font-family: Georgia, 'Times New Roman', serif;">Your Posts</h1>
  <p class="text-[#778899] text-sm mt-2">Your synced Substack posts</p>
</div>

{#if posts.length === 0}
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    </div>
    <p class="text-[#778899] text-sm">No posts synced yet</p>
    <p class="text-[#556677] text-xs mt-1">Connect your Substack to see your posts here</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each posts as article}
      <a href="/articles/{article.id}" class="group block rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
        <div class="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#1B2028] to-[#2C3440]">
          {#if article.coverImagePath}
            <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {/if}
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-5">
          <h3 class="text-white font-bold text-lg leading-snug line-clamp-2 mb-1.5" style="font-family: Georgia, 'Times New Roman', serif;">{article.title}</h3>
          <p class="text-white/50 text-xs">{formatDate(article.datePublished)}</p>
        </div>
      </a>
    {/each}
  </div>
{/if}
