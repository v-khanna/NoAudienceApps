<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    pill?: boolean;
    onclick?: (e: MouseEvent) => void;
    disabled?: boolean;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    pill = false,
    onclick,
    disabled = false,
    children,
  }: Props = $props();

  let sizeClasses = $derived(
    size === 'sm' ? 'px-3 h-8 text-sm' :
    size === 'lg' ? 'px-6 h-12 text-base' :
    'px-4 h-10 text-sm'
  );

  let variantClasses = $derived(
    variant === 'primary'
      ? 'bg-[#00E054] text-[#14181C] hover:bg-[#00C44A] font-semibold'
      : variant === 'secondary'
        ? 'bg-transparent border border-white/[0.12] text-white hover:border-white/[0.25]'
        : 'bg-transparent text-[#99AABB] hover:text-white'
  );

  let radiusClass = $derived(pill ? 'rounded-[999px]' : 'rounded-[6px]');
</script>

<button
  class="inline-flex items-center justify-center transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed {sizeClasses} {variantClasses} {radiusClass}"
  {onclick}
  {disabled}
>
  {@render children()}
</button>
