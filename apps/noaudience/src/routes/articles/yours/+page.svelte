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

<div class="mb-8">
  <a href="/articles" class="inline-flex items-center gap-1.5 text-sm text-[#99AABB] hover:text-white transition-colors mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    Articles
  </a>
  <h1 class="text-3xl font-bold text-white">Your Posts</h1>
  <p class="text-[#99AABB] text-sm mt-1">Your synced Substack posts</p>
</div>

{#if posts.length === 0}
  <div class="flex items-center justify-center h-48">
    <p class="text-[#99AABB]">No posts synced yet.</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each posts as article}
      <a href="/articles/{article.id}" class="group block bg-[#1B2028] rounded-[10px] overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 hover:-translate-y-0.5">
        {#if article.coverImagePath}
          <div class="aspect-video overflow-hidden">
            <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        {/if}
        <div class="p-4">
          <h3 class="text-white font-semibold text-base mb-1 line-clamp-2">{article.title}</h3>
          <p class="text-[#99AABB] text-xs mb-2">{formatDate(article.datePublished)}</p>
          <p class="text-[#778899] text-sm line-clamp-2">{article.excerpt}</p>
        </div>
      </a>
    {/each}
  </div>
{/if}
