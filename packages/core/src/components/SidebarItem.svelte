<script lang="ts">
  interface Props {
    href: string;
    label: string;
    indent?: boolean;
    currentPath?: string;
    icon?: string;
  }

  let { href, label, indent = false, currentPath = '', icon = '' }: Props = $props();
  let active = $derived(currentPath === href || (href !== '/' && currentPath.startsWith(href + '/')));
</script>

<a
  {href}
  class="group flex items-center gap-3 mx-2 h-9 text-sm transition-all duration-200 relative rounded-lg
    {indent ? 'pl-10 pr-3' : 'px-3'}
    {active
      ? 'text-white bg-white/[0.08]'
      : 'text-[#8899AA] hover:text-white hover:bg-white/[0.05]'}"
>
  {#if active && !indent}
    <span class="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#40BCF4]"></span>
  {/if}
  {#if indent}
    <span class="absolute left-[26px] top-0 bottom-0 w-px bg-white/[0.06]"></span>
  {/if}
  {#if icon}
    <span class="w-5 h-5 flex items-center justify-center text-current opacity-70 group-hover:opacity-100 transition-opacity">
      {@html icon}
    </span>
  {/if}
  <span class="truncate">{label}</span>
</a>
