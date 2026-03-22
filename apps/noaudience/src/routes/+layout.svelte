<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Sidebar from '@noaudience/core/components/Sidebar.svelte';
  import GlobalSearch from '$lib/GlobalSearch.svelte';
  import { page } from '$app/stores';
  import { initDatabase } from '$lib/db';
  import { seedDefaultSettings } from '$lib/settings';

  let { children } = $props();
  let ready = $state(false);
  let initError = $state('');

  onMount(async () => {
    try {
      await initDatabase();
      await seedDefaultSettings();
      ready = true;
    } catch (e: any) {
      initError = e?.message || String(e);
      console.error('App init failed:', e);
    }
  });
</script>

{#if ready}
  <GlobalSearch />
  <div class="flex h-screen overflow-hidden" style="background: var(--bg-base);">
    <Sidebar currentPath={$page.url.pathname} />
    <main class="flex-1 overflow-y-auto" style="padding: 40px 48px;">
      {@render children()}
    </main>
  </div>
{:else}
  <div class="flex items-center justify-center h-screen" style="background: var(--bg-base);">
    {#if initError}
      <div style="text-align: center; max-width: 500px;">
        <p style="color: #ff6b6b; font-size: 16px; margin-bottom: 8px;">Failed to initialize</p>
        <p style="color: var(--text-secondary, #99AABB); font-size: 14px; font-family: monospace;">{initError}</p>
      </div>
    {:else}
      <p style="color: var(--text-secondary, #99AABB);">Loading...</p>
    {/if}
  </div>
{/if}
