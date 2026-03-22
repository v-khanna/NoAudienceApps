<script lang="ts">
  import Button from '@noaudience/core/components/Button.svelte';
  import { allModules, enabledModuleIds, type ModuleId } from '@noaudience/core/stores/modules';
  import { appSettings } from '@noaudience/core/stores/settings';

  let settings = $state({ tmdbApiKey: '', substackFeedUrl: '' });
  let showTmdbKey = $state(false);

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

<div class="px-8 py-12 max-w-2xl mx-auto">
  <div class="mb-10">
    <h1 class="text-3xl font-bold text-white tracking-tight">Settings</h1>
    <p class="text-[#8899AA] mt-1.5">Configure your NoAudience experience.</p>
  </div>

  <!-- Modules -->
  <section class="mb-8">
    <div class="bg-[#161B22] border border-white/[0.06] rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-white/[0.04]">
        <h2 class="text-[15px] font-semibold text-white">Modules</h2>
        <p class="text-[12px] text-[#667788] mt-0.5">Enable or disable sections of the app.</p>
      </div>
      <div class="divide-y divide-white/[0.04]">
        {#each allModules as mod (mod.id)}
          <label
            class="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors duration-150"
          >
            <span class="text-[14px] text-white/90">{mod.label}</span>
            <!-- Custom toggle -->
            <button
              type="button"
              role="switch"
              aria-checked={$enabledModuleIds.has(mod.id)}
              onclick={() => toggleModule(mod.id)}
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#40BCF4]/40 focus:ring-offset-2 focus:ring-offset-[#161B22]
                {$enabledModuleIds.has(mod.id) ? 'bg-emerald-500' : 'bg-white/[0.12]'}"
            >
              <span
                class="inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm
                  {$enabledModuleIds.has(mod.id) ? 'translate-x-6' : 'translate-x-1'}"
              ></span>
            </button>
          </label>
        {/each}
      </div>
    </div>
  </section>

  <!-- API Keys -->
  <section class="mb-8">
    <div class="bg-[#161B22] border border-white/[0.06] rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-white/[0.04]">
        <h2 class="text-[15px] font-semibold text-white">API Keys</h2>
        <p class="text-[12px] text-[#667788] mt-0.5">Connect external services.</p>
      </div>
      <div class="p-5 flex flex-col gap-5">
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-[13px] text-[#99AABB] font-medium" for="tmdb-key">TMDB API Key</label>
            <button
              type="button"
              onclick={() => showTmdbKey = !showTmdbKey}
              class="text-[11px] text-[#667788] hover:text-[#99AABB] transition-colors"
            >
              {showTmdbKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="tmdb-key"
            type={showTmdbKey ? 'text' : 'password'}
            value={settings.tmdbApiKey}
            oninput={updateTmdbKey}
            class="w-full bg-[#0D1117] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[14px] text-white placeholder-[#445566] focus:outline-none focus:border-[#40BCF4]/50 focus:ring-1 focus:ring-[#40BCF4]/20 transition-all"
            placeholder="Enter your TMDB API key"
          />
          <p class="text-[12px] text-[#556677] mt-1.5">Required for film metadata and poster images.</p>
        </div>
        <div>
          <label class="block text-[13px] text-[#99AABB] font-medium mb-1.5" for="substack-url">Substack Feed URL</label>
          <input
            id="substack-url"
            type="text"
            value={settings.substackFeedUrl}
            oninput={updateSubstackUrl}
            class="w-full bg-[#0D1117] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[14px] text-white placeholder-[#445566] focus:outline-none focus:border-[#40BCF4]/50 focus:ring-1 focus:ring-[#40BCF4]/20 transition-all"
            placeholder="https://yourname.substack.com/feed"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Data -->
  <section class="mb-8">
    <div class="bg-[#161B22] border border-white/[0.06] rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-white/[0.04]">
        <h2 class="text-[15px] font-semibold text-white">Data</h2>
        <p class="text-[12px] text-[#667788] mt-0.5">Export or import your data.</p>
      </div>
      <div class="p-5 flex gap-3">
        <Button variant="secondary" onclick={() => {}}>Export All Data</Button>
        <Button variant="secondary" onclick={() => {}}>Import Data</Button>
      </div>
    </div>
  </section>
</div>
