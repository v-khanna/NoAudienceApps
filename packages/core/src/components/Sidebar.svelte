<script lang="ts">
  import { enabledModules } from '../stores/modules';
  import SidebarItem from './SidebarItem.svelte';
  import { slide } from 'svelte/transition';

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

  const moduleIcons: Record<string, string> = {
    films: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><rect x="3" y="4" width="14" height="12" rx="2"/><path d="M3 8h14M3 12h14M7 4v12M13 4v12"/></svg>',
    books: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><path d="M4 3h4a2 2 0 012 2v12a1.5 1.5 0 00-1.5-1.5H4V3zM16 3h-4a2 2 0 00-2 2v12a1.5 1.5 0 011.5-1.5H16V3z"/></svg>',
    articles: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 6h6M7 10h6M7 14h4"/></svg>',
    writing: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z"/><path d="M11 6l3 3"/></svg>',
    chess: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><path d="M10 2v3M8 5h4M7 8l1.5-3h3L13 8M6 17h8M7 14h6M6 17l1-3M14 17l-1-3M7 8c-1 2-1.5 4-1 6M13 8c1 2 1.5 4 1 6"/></svg>'
  };

  const homeIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><path d="M3 10l7-7 7 7M5 8.5V16a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8.5"/></svg>';
  const settingsIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5"><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M17.07 5l-1.73 1M4.66 14l-1.73 1M18 10h-2M4 10H2M17.07 15l-1.73-1M4.66 6L2.93 5"/></svg>';
</script>

<nav class="flex flex-col w-60 h-full bg-gradient-to-b from-[#0F1318] to-[#0A0D11] border-r border-white/[0.06] select-none">
  <!-- Logo -->
  <div class="px-4 h-14 flex items-center gap-2.5 border-b border-white/[0.04]">
    <div class="w-6 h-6 rounded-md bg-gradient-to-br from-[#40BCF4] to-[#2D8AB8] flex items-center justify-center">
      <span class="text-[11px] font-bold text-white leading-none">N</span>
    </div>
    <span class="text-[15px] font-semibold text-white/90 tracking-tight">NoAudience</span>
  </div>

  <!-- Home -->
  <div class="mt-2">
    <SidebarItem href="/" label="Home" {currentPath} icon={homeIcon} />
  </div>

  <!-- Modules -->
  <div class="flex-1 overflow-y-auto mt-1">
    <div class="px-4 pt-4 pb-1.5">
      <span class="text-[10px] font-semibold uppercase tracking-widest text-[#556677]">Modules</span>
    </div>
    {#each $enabledModules as mod (mod.id)}
      <button
        onclick={() => toggleModule(mod.id)}
        class="group flex items-center justify-between w-full mx-2 px-3 h-9 text-sm text-[#8899AA] hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-200"
        style="width: calc(100% - 16px)"
      >
        <span class="flex items-center gap-3">
          <span class="w-5 h-5 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
            {@html moduleIcons[mod.id] || ''}
          </span>
          <span>{mod.label}</span>
        </span>
        <svg
          class="w-3.5 h-3.5 transition-transform duration-200 opacity-50 {expandedModules[mod.id] ? 'rotate-90' : ''}"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {#if expandedModules[mod.id]}
        <div transition:slide={{ duration: 150 }}>
          <SidebarItem href="/{mod.id}" label="Overview" indent {currentPath} />
          {#each mod.subPages as sub (sub.path)}
            <SidebarItem href={sub.path} label={sub.label} indent {currentPath} />
          {/each}
        </div>
      {/if}
    {/each}
  </div>

  <!-- Settings -->
  <div class="border-t border-white/[0.06] pt-1 pb-2">
    <SidebarItem href="/settings" label="Settings" {currentPath} icon={settingsIcon} />
  </div>
</nav>
