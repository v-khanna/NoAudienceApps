<script lang="ts">
  interface Props {
    value: number;
    max?: number;
    color?: 'green' | 'blue' | 'gradient';
    height?: 'sm' | 'md';
  }

  let {
    value,
    max = 100,
    color = 'green',
    height = 'md',
  }: Props = $props();

  let percent = $derived(Math.min(100, Math.max(0, (value / max) * 100)));

  let heightClass = $derived(height === 'sm' ? 'h-1.5' : 'h-2.5');

  let fillStyle = $derived(
    color === 'green' ? 'background-color: #00E054' :
    color === 'blue' ? 'background-color: #40BCF4' :
    'background: linear-gradient(90deg, #00E054, #40BCF4)'
  );
</script>

<div
  class="w-full bg-white/[0.08] rounded-full overflow-hidden {heightClass}"
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
>
  <div
    class="h-full rounded-full transition-[width] duration-300 ease-out"
    style="{fillStyle}; width: {percent}%"
  ></div>
</div>
