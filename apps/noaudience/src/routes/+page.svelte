<script lang="ts">
  import { enabledModules } from '@noaudience/core/stores/modules';
</script>

<div class="px-8 py-10 max-w-4xl mx-auto">
  <div class="mb-10">
    <h1 class="text-[28px] font-bold text-white">NoAudience</h1>
    <p class="text-[#99AABB] italic mt-1">Does every hobby need an audience?</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each $enabledModules as mod (mod.id)}
      <a
        href="/{mod.id}"
        class="block bg-[#1B2028] border border-[rgba(255,255,255,0.06)] rounded-[6px] p-5 transition-colors duration-150 hover:border-[rgba(255,255,255,0.16)] hover:bg-[#2C3440]"
      >
        <h2 class="text-[16px] font-semibold text-white mb-1">{mod.label}</h2>
        <p class="text-[13px] text-[#667788]">
          {mod.subPages.length} {mod.subPages.length === 1 ? 'page' : 'pages'}
        </p>
      </a>
    {/each}
  </div>
</div>
