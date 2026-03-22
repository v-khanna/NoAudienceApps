<script lang="ts">
  import { HIGHLIGHT_COLORS } from './mock';

  interface Props {
    x: number;
    y: number;
    visible: boolean;
    onselect: (color: string) => void;
  }

  let { x, y, visible, onselect }: Props = $props();

  const colors = Object.entries(HIGHLIGHT_COLORS);
</script>

{#if visible}
  <div
    class="fixed z-50 flex items-center gap-1.5 px-2 py-1.5 bg-[#2C3440] border border-white/[0.12] rounded-[8px] shadow-xl"
    style="left: {x}px; top: {y}px; transform: translateX(-50%) translateY(-120%);"
  >
    {#each colors as [name, hex]}
      <button
        class="w-7 h-7 rounded-full border-2 border-transparent hover:border-white/40 transition-colors cursor-pointer hover:scale-110"
        style="background-color: {hex};"
        title="Highlight {name}"
        onclick={() => onselect(name)}
      ></button>
    {/each}
  </div>
{/if}
