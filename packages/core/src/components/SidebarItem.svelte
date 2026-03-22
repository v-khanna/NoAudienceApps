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
  class="sidebar-item"
  class:active
  class:indent
  style="
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    font-size: {indent ? '11px' : '12px'};
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
