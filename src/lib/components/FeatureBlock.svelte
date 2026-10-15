<script lang="ts">
	import type { Snippet } from 'svelte';
	import Img from './Img.svelte';

	interface Props {
		eyebrow: Snippet;
		title: string;
		text: string;
		image?: string;
		imageAlt: string;
		children?: Snippet;
	}

	let { eyebrow, title, text, image, imageAlt, children }: Props = $props();
</script>

<section class="reveal grid items-center gap-8 md:grid-cols-2 lg:gap-16" aria-label={title}>
	<div class="flex flex-col gap-5 md:order-1">
		<p class="eyebrow">{@render eyebrow()}</p>
		<h2 class="heading-xl text-balance">{title}</h2>
		<p class="text-xl leading-relaxed text-white/80">{text}</p>
		{@render children?.()}
	</div>
	{#if image}
		<div class="relative md:order-2">
			<Img
				src={image}
				alt={imageAlt}
				sizes="(min-width: 768px) 560px, 100vw"
				class="aspect-[4/5] w-full rounded-3xl border border-white/10 object-cover"
			/>
			<div
				class="absolute -bottom-3 -left-3 -z-10 size-full rounded-3xl border-2 border-archa-green"
				aria-hidden="true"
			></div>
		</div>
	{/if}
</section>
