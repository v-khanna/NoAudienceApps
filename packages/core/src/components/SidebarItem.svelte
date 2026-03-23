<script lang="ts">
  interface Props {
    href: string;
    label: string;
    indent?: boolean;
    currentPath?: string;
  }

  let { href, label, indent = false, currentPath = '' }: Props = $props();
  // Exact match for module roots (e.g. /films, /books) so "Overview" doesn't stay active on sub-pages
  // Prefix match for sub-pages (e.g. /films/diary matches /films/diary/*)
  let isModuleRoot = $derived(href !== '/' && !indent && ['films','books','articles','writing','chess'].some(m => href === '/' + m));
  let active = $derived(
    isModuleRoot
      ? currentPath === href
      : currentPath === href || (href !== '/' && currentPath.startsWith(href + '/'))
  );
</script>

<a
  {href}
  class="sidebar-item"
  class:active
  class:indent
  style="
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 16px;
    font-size: {indent ? '13px' : '14px'};
    font-weight: 500;
    color: {active ? 'var(--text-primary)' : 'var(--text-secondary)'};
    background: transparent;
    border-left: {active ? '2px solid var(--accent)' : '2px solid transparent'};
    margin-left: {indent ? '12px' : '0'};
    text-decoration: none;
    transition: color 150ms ease-out, background 150ms ease-out;
  "
>
  {label}
</a>

<style>
  .sidebar-item:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.03);
  }
</style>
