<script lang="ts">
	import { resolveImage } from '#lib/images.ts';

	interface Props {
		src: string | undefined;
		alt: string;
		class?: string;
		sizes?: string;
		/** Set for the largest above-the-fold image (LCP). */
		priority?: boolean;
	}

	let { src, alt, class: className = '', sizes, priority = false }: Props = $props();

	const resolved = $derived(resolveImage(src));
	const loading = $derived(priority ? 'eager' : 'lazy');
	const fetchpriority = $derived(priority ? 'high' : undefined);
</script>

{#if typeof resolved === 'object'}
	<enhanced:img src={resolved} {alt} class={className} {sizes} {loading} {fetchpriority} />
{:else if resolved}
	<img src={resolved} {alt} class={className} {loading} {fetchpriority} decoding="async" />
{/if}
