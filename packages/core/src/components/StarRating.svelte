<script lang="ts">
  interface Props {
    value: number;
    max?: number;
    halfStars?: boolean;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    onchange?: (value: number) => void;
  }

  let {
    value = 0,
    max = 5,
    halfStars = true,
    readonly = false,
    size = 'md',
    onchange,
  }: Props = $props();

  let hoverValue = $state<number | null>(null);
  let displayValue = $derived(hoverValue ?? value);

  let starSize = $derived(
    size === 'sm' ? 16 : size === 'lg' ? 32 : 24
  );

  function handleClick(starIndex: number, e: MouseEvent) {
    if (readonly) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    let newValue = halfStars && isLeftHalf ? starIndex + 0.5 : starIndex + 1;
    if (newValue === value) newValue = 0;
    onchange?.(newValue);
  }

  function handleMouseMove(starIndex: number, e: MouseEvent) {
    if (readonly) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    hoverValue = halfStars && isLeftHalf ? starIndex + 0.5 : starIndex + 1;
  }

  function handleMouseLeave() {
    hoverValue = null;
  }

  function fillForStar(index: number): 'full' | 'half' | 'empty' {
    if (displayValue >= index + 1) return 'full';
    if (displayValue >= index + 0.5) return 'half';
    return 'empty';
  }
</script>

<div
  class="inline-flex gap-0.5"
  role={readonly ? 'img' : 'slider'}
  aria-label="Rating: {value} out of {max}"
  onmouseleave={handleMouseLeave}
>
  {#each Array(max) as _, i}
    {@const fill = fillForStar(i)}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={starSize}
      height={starSize}
      viewBox="0 0 24 24"
      class="{readonly ? '' : 'cursor-pointer'} transition-colors"
      onclick={(e: MouseEvent) => handleClick(i, e)}
      onmousemove={(e: MouseEvent) => handleMouseMove(i, e)}
    >
      <defs>
        <clipPath id="star-left-{i}">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
        <clipPath id="star-right-{i}">
          <rect x="12" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      {#if fill === 'full'}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          fill="#00E054"
          stroke="#00E054"
          stroke-width="1"
        />
      {:else if fill === 'half'}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          fill="#00E054"
          stroke="#535353"
          stroke-width="1"
          clip-path="url(#star-left-{i})"
        />
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          fill="none"
          stroke="#535353"
          stroke-width="1"
          clip-path="url(#star-right-{i})"
        />
      {:else}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          fill="none"
          stroke="#535353"
          stroke-width="1"
        />
      {/if}
    </svg>
  {/each}
</div>
