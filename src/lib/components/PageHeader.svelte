<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		eyebrow?: string;
		title: string;
		lead?: string;
		children?: Snippet;
	}

	let { eyebrow, title, lead, children }: Props = $props();
</script>

<header class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
	<div class="max-w-2xl">
		{#if eyebrow}<p class="eyebrow mb-3">{eyebrow}</p>{/if}
		<h1 class="heading-xl">{title}</h1>
		<div class="mt-4 h-1 w-12 rounded-full bg-archa-gold" aria-hidden="true"></div>
		{#if lead}<p class="mt-4 text-lg text-white/70">{lead}</p>{/if}
	</div>
	{@render children?.()}
</header>
