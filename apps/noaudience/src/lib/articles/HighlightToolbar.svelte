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
    style="
      position: fixed;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 6px;
      left: {x}px;
      top: {y}px;
      transform: translateX(-50%) translateY(-120%);
    "
  >
    {#each colors as [name, hex]}
      <button
        class="color-btn"
        style="background-color: {hex};"
        title="Highlight {name}"
        onclick={() => onselect(name)}
      ></button>
    {/each}
  </div>
{/if}

<style>
  .color-btn {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: border-color 150ms ease-out;
  }

  .color-btn:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }
</style>
