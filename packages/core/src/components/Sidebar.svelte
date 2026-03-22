<script lang="ts">
  import { enabledModules } from '../stores/modules';
  import SidebarItem from './SidebarItem.svelte';

  interface Props {
    currentPath?: string;
  }

  let { currentPath = '' }: Props = $props();

  let expandedModules = $state<Record<string, boolean>>({});

  function toggleModule(id: string) {
    expandedModules[id] = !expandedModules[id];
  }

  // Auto-expand the module that matches the current path
  $effect(() => {
    if (currentPath) {
      const segment = currentPath.split('/')[1];
      if (segment && !expandedModules[segment]) {
        expandedModules[segment] = true;
      }
    }
  });
</script>

<nav class="flex flex-col w-60 h-full bg-[#0F1318] border-r border-white/[0.06] select-none">
  <!-- Title -->
  <div class="px-4 h-14 flex items-center">
    <span class="text-lg font-semibold text-white tracking-tight">NoAudience</span>
  </div>

  <!-- Home -->
  <SidebarItem href="/" label="Home" {currentPath} />

  <!-- Modules -->
  <div class="flex-1 overflow-y-auto mt-2">
    {#each $enabledModules as mod (mod.id)}
      <button
        onclick={() => toggleModule(mod.id)}
        class="flex items-center justify-between w-full px-4 h-10 text-sm text-[#99AABB] hover:text-white hover:bg-white/[0.04] transition-colors duration-150"
      >
        <span>{mod.label}</span>
        <svg
          class="w-4 h-4 transition-transform duration-150 {expandedModules[mod.id] ? 'rotate-90' : ''}"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {#if expandedModules[mod.id]}
        <SidebarItem href="/{mod.id}" label="Overview" indent {currentPath} />
        {#each mod.subPages as sub (sub.path)}
          <SidebarItem href={sub.path} label={sub.label} indent {currentPath} />
        {/each}
      {/if}
    {/each}
  </div>

  <!-- Settings -->
  <div class="border-t border-white/[0.06]">
    <SidebarItem href="/settings" label="Settings" {currentPath} />
  </div>
</nav>
