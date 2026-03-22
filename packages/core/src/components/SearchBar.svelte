<script lang="ts">
  interface Props {
    value?: string;
    placeholder?: string;
    oninput?: (e: Event) => void;
  }

  let {
    value = $bindable(''),
    placeholder = 'Search...',
    oninput,
  }: Props = $props();
</script>

<div class="relative">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="absolute left-3 top-1/2 -translate-y-1/2 text-[#99AABB] pointer-events-none"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
  <input
    type="text"
    bind:value
    {placeholder}
    {oninput}
    class="w-full pl-10 pr-4 h-10 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors"
  />
</div>
