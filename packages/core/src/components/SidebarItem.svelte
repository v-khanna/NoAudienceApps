<script lang="ts">
  interface Props {
    href: string;
    label: string;
    indent?: boolean;
    currentPath?: string;
  }

  let { href, label, indent = false, currentPath = '' }: Props = $props();
  let active = $derived(currentPath === href || (href !== '/' && currentPath.startsWith(href + '/')));
</script>

<a
  {href}
  class="flex items-center gap-3 px-4 h-10 text-sm transition-colors duration-150 relative
    {indent ? 'pl-11' : ''}
    {active
      ? 'text-white bg-white/[0.07]'
      : 'text-[#99AABB] hover:text-white hover:bg-white/[0.04]'}"
>
  {#if active && !indent}
    <span class="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#40BCF4]"></span>
  {/if}
  <span>{label}</span>
</a>
