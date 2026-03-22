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

<nav style="
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 100%;
  background: var(--bg-base);
  border-right: 1px solid var(--border);
  user-select: none;
">
  <!-- Brand -->
  <div style="padding: 16px 12px 12px; font-size: 13px; font-weight: 600; color: var(--text-secondary);">
    NoAudience
  </div>

  <!-- Home -->
  <SidebarItem href="/" label="Home" {currentPath} />

  <!-- Modules -->
  <div style="flex: 1; overflow-y: auto; margin-top: 4px;">
    {#each $enabledModules as mod (mod.id)}
      <button
        onclick={() => toggleModule(mod.id)}
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 28px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-left: 2px solid transparent;
          cursor: pointer;
          transition: color 150ms ease-out, background 150ms ease-out;
          text-align: left;
        "
        class="module-toggle"
      >
        <span>{mod.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          style="transform: {expandedModules[mod.id] ? 'rotate(90deg)' : 'rotate(0)'}; opacity: 0.4;"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {#if expandedModules[mod.id]}
        <div>
          <SidebarItem href="/{mod.id}" label="Overview" indent {currentPath} />
          {#each mod.subPages as sub (sub.path)}
            <SidebarItem href={sub.path} label={sub.label} indent {currentPath} />
          {/each}
        </div>
      {/if}
    {/each}
  </div>

  <!-- Settings -->
  <div style="border-top: 1px solid var(--border); padding-top: 4px; padding-bottom: 8px;">
    <SidebarItem href="/settings" label="Settings" {currentPath} />
  </div>
</nav>

<style>
  .module-toggle:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.03);
  }
</style>
