<script>
  import '../app.css';
  import Sidebar from '@noaudience/core/components/Sidebar.svelte';
  import { page } from '$app/stores';

  let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-[#14181C]">
  <Sidebar currentPath={$page.url.pathname} />
  <main class="flex-1 overflow-y-auto p-8">
    {@render children()}
  </main>
</div>
