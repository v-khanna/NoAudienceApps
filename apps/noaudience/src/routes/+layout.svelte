<script>
  import '../app.css';
  import Sidebar from '@noaudience/core/components/Sidebar.svelte';
  import { page } from '$app/stores';
  let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden" style="background: var(--bg-base);">
  <Sidebar currentPath={$page.url.pathname} />
  <main class="flex-1 overflow-y-auto" style="padding: 24px 32px;">
    {@render children()}
  </main>
</div>
