<script lang="ts">
  import { enabledModules } from '@noaudience/core/stores/modules';

  const moduleStyles: Record<string, { gradient: string; border: string; glow: string; icon: string; desc: string }> = {
    films: {
      gradient: 'from-emerald-500/[0.06] to-transparent',
      border: 'hover:border-emerald-400/30',
      glow: 'group-hover:shadow-emerald-500/10',
      icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" class="w-8 h-8 text-emerald-400/80"><rect x="4" y="6" width="24" height="20" rx="3"/><path d="M4 12h24M4 20h24M11 6v20M21 6v20"/></svg>',
      desc: 'Track films, log diary entries, build watchlists'
    },
    books: {
      gradient: 'from-amber-500/[0.06] to-transparent',
      border: 'hover:border-amber-400/30',
      glow: 'group-hover:shadow-amber-500/10',
      icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" class="w-8 h-8 text-amber-400/80"><path d="M5 4h8a3 3 0 013 3v20a2 2 0 00-2-2H5V4zM27 4h-8a3 3 0 00-3 3v20a2 2 0 012-2h9V4z"/></svg>',
      desc: 'Organize your library, shelves, and reading goals'
    },
    articles: {
      gradient: 'from-blue-500/[0.06] to-transparent',
      border: 'hover:border-blue-400/30',
      glow: 'group-hover:shadow-blue-500/10',
      icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" class="w-8 h-8 text-blue-400/80"><rect x="5" y="3" width="22" height="26" rx="3"/><path d="M10 9h12M10 15h12M10 21h8"/></svg>',
      desc: 'Save articles, manage feeds, annotate reading'
    },
    writing: {
      gradient: 'from-purple-500/[0.06] to-transparent',
      border: 'hover:border-purple-400/30',
      glow: 'group-hover:shadow-purple-500/10',
      icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" class="w-8 h-8 text-purple-400/80"><path d="M21 5l6 6L11 27H5v-6L21 5z"/><path d="M17 9l6 6"/></svg>',
      desc: 'Write privately, organize with tags and folders'
    },
    chess: {
      gradient: 'from-slate-400/[0.06] to-transparent',
      border: 'hover:border-slate-400/30',
      glow: 'group-hover:shadow-slate-400/10',
      icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" class="w-8 h-8 text-slate-300/80"><path d="M16 3v5M13 8h6M11 13l2.5-5h5L21 13M9 27h14M11 23h10M9 27l2-4M23 27l-2-4M11 13c-2 3-2.5 7-2 10M21 13c2 3 2.5 7 2 10"/></svg>',
      desc: 'Review games and analyze positions'
    }
  };
</script>

<div class="px-8 py-12 max-w-5xl mx-auto">
  <!-- Hero -->
  <div class="relative mb-14 text-center">
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none -top-20" aria-hidden="true">
      <div class="w-[500px] h-[300px] bg-gradient-to-br from-indigo-600/[0.07] via-purple-600/[0.05] to-blue-600/[0.07] rounded-full blur-3xl"></div>
    </div>
    <h1 class="relative text-4xl font-bold text-white tracking-tight">NoAudience</h1>
    <p class="relative text-[#8899AA] italic mt-2 text-lg">Does every hobby need an audience?</p>
  </div>

  <!-- Module cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each $enabledModules as mod (mod.id)}
      {@const style = moduleStyles[mod.id]}
      <a
        href="/{mod.id}"
        class="group relative block bg-gradient-to-br {style?.gradient ?? ''} bg-[#161B22] border border-white/[0.06] rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 {style?.border ?? ''} hover:shadow-lg {style?.glow ?? ''}"
      >
        <div class="mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
          {@html style?.icon ?? ''}
        </div>
        <h2 class="text-[17px] font-semibold text-white mb-1.5">{mod.label}</h2>
        <p class="text-[13px] text-[#667788] leading-relaxed mb-3">{style?.desc ?? ''}</p>
        <span class="text-[12px] text-[#556677]">
          {mod.subPages.length} {mod.subPages.length === 1 ? 'section' : 'sections'}
        </span>
      </a>
    {/each}
  </div>
</div>
