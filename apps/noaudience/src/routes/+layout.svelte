<script>
  import '../app.css';
  import Sidebar from '@noaudience/core/components/Sidebar.svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';

  let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-[#14181C]">
  <Sidebar currentPath={$page.url.pathname} />
  <main class="flex-1 overflow-y-auto p-6 lg:p-8">
    {#key $page.url.pathname}
      <div in:fade={{ duration: 150, delay: 50 }} class="max-w-7xl mx-auto">
        {@render children()}
      </div>
    {/key}
  </main>
</div>
