<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
  {@render children()}
</div>
