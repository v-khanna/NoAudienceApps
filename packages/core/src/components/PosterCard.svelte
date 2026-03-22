<script lang="ts">
  interface Props {
    src: string;
    alt?: string;
    title?: string;
    subtitle?: string;
    rating?: number;
    href?: string;
    status?: 'watched' | 'watchlist' | 'none';
  }

  let {
    src,
    alt = '',
    title,
    subtitle,
    rating,
    href = '#',
    status = 'none',
  }: Props = $props();

  let ringColor = $derived(
    status === 'watched' ? 'hover:ring-[#00E054]' :
    status === 'watchlist' ? 'hover:ring-[#FF8000]' :
    'hover:ring-[#40BCF4]'
  );
</script>

<a {href} class="group block">
  <div
    class="relative aspect-[2/3] rounded-[6px] overflow-hidden ring-2 ring-transparent transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:shadow-lg {ringColor}"
  >
    <img
      {src}
      {alt}
      class="w-full h-full object-cover"
      loading="lazy"
    />
  </div>
  {#if title || subtitle || rating != null}
    <div class="mt-2 space-y-0.5">
      {#if title}
        <p class="text-white text-sm font-medium truncate">{title}</p>
      {/if}
      {#if subtitle}
        <p class="text-[#99AABB] text-xs truncate">{subtitle}</p>
      {/if}
    </div>
  {/if}
</a>
