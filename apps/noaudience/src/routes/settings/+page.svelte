<script lang="ts">
  import Button from '@noaudience/core/components/Button.svelte';
  import { allModules, enabledModuleIds, type ModuleId } from '@noaudience/core/stores/modules';
  import { appSettings } from '@noaudience/core/stores/settings';

  let settings = $state({ tmdbApiKey: '', substackFeedUrl: '' });

  appSettings.subscribe((s) => {
    settings.tmdbApiKey = s.tmdbApiKey;
    settings.substackFeedUrl = s.substackFeedUrl;
  });

  function toggleModule(id: ModuleId) {
    enabledModuleIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function updateTmdbKey(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    appSettings.update((s) => ({ ...s, tmdbApiKey: value }));
  }

  function updateSubstackUrl(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    appSettings.update((s) => ({ ...s, substackFeedUrl: value }));
  }
</script>

<div class="px-8 py-10 max-w-2xl">
  <h1 class="text-[28px] font-bold text-white mb-1">Settings</h1>
  <p class="text-[#99AABB] mb-8">Configure your NoAudience experience.</p>

  <!-- Modules -->
  <section class="mb-10">
    <h2 class="text-[16px] font-semibold text-white mb-4">Modules</h2>
    <div class="flex flex-col gap-2">
      {#each allModules as mod (mod.id)}
        <label
          class="flex items-center justify-between bg-[#1B2028] border border-[rgba(255,255,255,0.06)] rounded-[6px] px-4 py-3 cursor-pointer hover:border-[rgba(255,255,255,0.16)] hover:bg-[#2C3440] transition-colors duration-150"
        >
          <span class="text-[14px] text-white">{mod.label}</span>
          <input
            type="checkbox"
            checked={$enabledModuleIds.has(mod.id)}
            onchange={() => toggleModule(mod.id)}
            class="w-4 h-4 accent-[#00E054] cursor-pointer"
          />
        </label>
      {/each}
    </div>
  </section>

  <!-- API Keys -->
  <section class="mb-10">
    <h2 class="text-[16px] font-semibold text-white mb-4">API Keys</h2>
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-[13px] text-[#99AABB] mb-1" for="tmdb-key">TMDB API Key</label>
        <input
          id="tmdb-key"
          type="password"
          value={settings.tmdbApiKey}
          oninput={updateTmdbKey}
          class="w-full bg-[#1B2028] border border-[rgba(255,255,255,0.06)] rounded-[6px] px-3 py-2 text-[14px] text-white placeholder-[#667788] focus:outline-none focus:border-[#00E054]"
          placeholder="Enter your TMDB API key"
        />
        <p class="text-[12px] text-[#667788] mt-1">Required for film metadata and poster images.</p>
      </div>
      <div>
        <label class="block text-[13px] text-[#99AABB] mb-1" for="substack-url">Substack Feed URL</label>
        <input
          id="substack-url"
          type="text"
          value={settings.substackFeedUrl}
          oninput={updateSubstackUrl}
          class="w-full bg-[#1B2028] border border-[rgba(255,255,255,0.06)] rounded-[6px] px-3 py-2 text-[14px] text-white placeholder-[#667788] focus:outline-none focus:border-[#00E054]"
          placeholder="https://yourname.substack.com/feed"
        />
      </div>
    </div>
  </section>

  <!-- Data -->
  <section class="mb-10">
    <h2 class="text-[16px] font-semibold text-white mb-4">Data</h2>
    <div class="flex gap-3">
      <Button variant="secondary" onclick={() => {}}>Export All Data</Button>
      <Button variant="secondary" onclick={() => {}}>Import Data</Button>
    </div>
  </section>
</div>
