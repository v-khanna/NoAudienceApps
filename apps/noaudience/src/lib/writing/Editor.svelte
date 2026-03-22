<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Placeholder from '@tiptap/extension-placeholder';
  import Highlight from '@tiptap/extension-highlight';
  import TaskList from '@tiptap/extension-task-list';
  import TaskItem from '@tiptap/extension-task-item';
  import Link from '@tiptap/extension-link';
  import Image from '@tiptap/extension-image';
  import Typography from '@tiptap/extension-typography';

  let {
    content = '',
    onUpdate,
    editable = true,
  }: {
    content?: string;
    onUpdate?: (html: string, text: string) => void;
    editable?: boolean;
  } = $props();

  let element: HTMLElement;
  let editor: Editor | undefined = $state();
  let wordCount = $state(0);
  let readingTime = $state(1);

  function updateStats(text: string) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    wordCount = words;
    readingTime = Math.max(1, Math.ceil(words / 250));
  }

  onMount(() => {
    editor = new Editor({
      element,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Placeholder.configure({
          placeholder: 'Start writing...',
        }),
        Highlight.configure({ multicolor: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
        }),
        Image,
        Typography,
      ],
      content,
      editable,
      onTransaction: ({ editor: e }) => {
        // Force Svelte reactivity
        editor = e;
      },
      onUpdate: ({ editor: e }) => {
        const html = e.getHTML();
        const text = e.getText();
        updateStats(text);
        onUpdate?.(html, text);
      },
    });

    updateStats(editor.getText());
  });

  onDestroy(() => {
    editor?.destroy();
  });

  // Toolbar actions
  function toggleBold() {
    editor?.chain().focus().toggleBold().run();
  }
  function toggleItalic() {
    editor?.chain().focus().toggleItalic().run();
  }
  function toggleStrike() {
    editor?.chain().focus().toggleStrike().run();
  }
  function toggleHighlight() {
    editor?.chain().focus().toggleHighlight().run();
  }
  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  let isSelecting = $state(false);
  let toolbarStyle = $state('display: none;');

  function updateToolbar() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      isSelecting = false;
      toolbarStyle = 'display: none;';
      return;
    }

    isSelecting = true;

    // Position toolbar near the selection
    const editorEl = element;
    if (!editorEl) return;
    const editorRect = editorEl.getBoundingClientRect();

    // Get the DOM range for positioning
    const view = editor.view;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    const left = (start.left + end.left) / 2 - editorRect.left;
    const top = start.top - editorRect.top - 48;

    toolbarStyle = `
      display: flex;
      position: absolute;
      top: ${top}px;
      left: ${left}px;
      transform: translateX(-50%);
      z-index: 50;
    `;
  }

  $effect(() => {
    if (!editor) return;

    // Listen to selection changes
    const handler = () => updateToolbar();
    editor.on('selectionUpdate', handler);
    editor.on('blur', () => {
      // Delay hiding so button clicks register
      setTimeout(() => {
        if (!editor?.isFocused) {
          isSelecting = false;
          toolbarStyle = 'display: none;';
        }
      }, 200);
    });

    return () => {
      editor?.off('selectionUpdate', handler);
    };
  });
</script>

<div class="editor-wrapper">
  <!-- Floating toolbar -->
  <div class="floating-toolbar" style={toolbarStyle}>
    <button
      class="toolbar-btn"
      class:active={editor?.isActive('bold')}
      onmousedown={(e) => { e.preventDefault(); toggleBold(); }}
      title="Bold"
    >
      <strong>B</strong>
    </button>
    <button
      class="toolbar-btn"
      class:active={editor?.isActive('italic')}
      onmousedown={(e) => { e.preventDefault(); toggleItalic(); }}
      title="Italic"
    >
      <em>I</em>
    </button>
    <button
      class="toolbar-btn"
      class:active={editor?.isActive('strike')}
      onmousedown={(e) => { e.preventDefault(); toggleStrike(); }}
      title="Strikethrough"
    >
      <s>S</s>
    </button>
    <button
      class="toolbar-btn"
      class:active={editor?.isActive('link')}
      onmousedown={(e) => { e.preventDefault(); setLink(); }}
      title="Link"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </button>
    <button
      class="toolbar-btn"
      class:active={editor?.isActive('highlight')}
      onmousedown={(e) => { e.preventDefault(); toggleHighlight(); }}
      title="Highlight"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 11-6 6v3h9l3-3" />
        <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
      </svg>
    </button>
  </div>

  <!-- Editor content -->
  <div class="editor-content" bind:this={element}></div>

  <!-- Status bar -->
  <div class="status-bar">
    <span>{wordCount} words</span>
    <span class="dot">·</span>
    <span>{readingTime} min read</span>
  </div>
</div>

<style>
  .editor-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .editor-content {
    flex: 1;
    min-height: 60vh;
  }

  /* Substack-style prose */
  .editor-content :global(.tiptap) {
    outline: none;
    font-family: Georgia, Charter, 'Times New Roman', serif;
    font-size: 18px;
    line-height: 1.65;
    color: #E0E0E0;
    max-width: 660px;
    width: 100%;
  }

  .editor-content :global(.tiptap p) {
    margin: 0 0 1em 0;
  }

  .editor-content :global(.tiptap h1) {
    font-size: 32px;
    font-weight: 700;
    margin: 1.5em 0 0.5em 0;
    line-height: 1.3;
    color: #F0F0F0;
  }

  .editor-content :global(.tiptap h2) {
    font-size: 24px;
    font-weight: 600;
    margin: 1.4em 0 0.5em 0;
    line-height: 1.35;
    color: #F0F0F0;
  }

  .editor-content :global(.tiptap h3) {
    font-size: 20px;
    font-weight: 600;
    margin: 1.3em 0 0.4em 0;
    line-height: 1.4;
    color: #F0F0F0;
  }

  .editor-content :global(.tiptap blockquote) {
    border-left: 3px solid rgba(255, 255, 255, 0.15);
    margin: 1.2em 0;
    padding-left: 1em;
    color: rgba(224, 224, 224, 0.8);
    font-style: italic;
  }

  .editor-content :global(.tiptap pre) {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    padding: 16px;
    margin: 1.2em 0;
    overflow-x: auto;
  }

  .editor-content :global(.tiptap pre code) {
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace;
    font-size: 14px;
    line-height: 1.5;
    color: #E0E0E0;
  }

  .editor-content :global(.tiptap code) {
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace;
    font-size: 0.875em;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 3px;
    padding: 2px 5px;
    color: #E0E0E0;
  }

  .editor-content :global(.tiptap ul),
  .editor-content :global(.tiptap ol) {
    margin: 0.5em 0 1em 0;
    padding-left: 1.5em;
  }

  .editor-content :global(.tiptap li) {
    margin-bottom: 0.3em;
  }

  .editor-content :global(.tiptap ul[data-type="taskList"]) {
    list-style: none;
    padding-left: 0;
  }

  .editor-content :global(.tiptap ul[data-type="taskList"] li) {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .editor-content :global(.tiptap ul[data-type="taskList"] li label) {
    flex-shrink: 0;
    margin-top: 3px;
  }

  .editor-content :global(.tiptap a) {
    color: var(--accent, #6B9FFF);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .editor-content :global(.tiptap a:hover) {
    opacity: 0.8;
  }

  .editor-content :global(.tiptap mark) {
    background: rgba(255, 213, 79, 0.3);
    color: inherit;
    border-radius: 2px;
    padding: 1px 2px;
  }

  .editor-content :global(.tiptap img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 1em 0;
  }

  .editor-content :global(.tiptap hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 2em 0;
  }

  .editor-content :global(.tiptap p.is-editor-empty:first-child::before) {
    color: rgba(255, 255, 255, 0.25);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .editor-content :global(.tiptap strong) {
    font-weight: 700;
  }

  .editor-content :global(.tiptap em) {
    font-style: italic;
  }

  /* Floating toolbar */
  .floating-toolbar {
    align-items: center;
    gap: 2px;
    background: #1E2328;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 28px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: rgba(224, 224, 224, 0.7);
    cursor: pointer;
    font-size: 13px;
    transition: all 100ms ease-out;
  }

  .toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #E0E0E0;
  }

  .toolbar-btn.active {
    background: rgba(255, 255, 255, 0.12);
    color: var(--accent, #6B9FFF);
  }

  /* Status bar */
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 8px 0;
    margin-top: 24px;
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    font-size: 11px;
    color: var(--text-tertiary, rgba(255, 255, 255, 0.35));
  }

  .status-bar .dot {
    margin: 0 6px;
  }
</style>
