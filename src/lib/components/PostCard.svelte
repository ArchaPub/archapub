<script lang="ts">
	import IconArrowRight from '~icons/ph/arrow-right';
	import IconNewspaper from '~icons/ph/newspaper';
	import { formatDate } from '#lib/dates.ts';
	import type { PostSummary } from '#lib/types.ts';
	import Img from './Img.svelte';

	let {
		post,
		featured = false,
		headingLevel = 2
	}: { post: PostSummary; featured?: boolean; headingLevel?: 2 | 3 } = $props();
</script>

<article
	class="card card-interactive group h-full bg-archa-dark p-0 {featured ? 'md:flex-row' : ''}"
>
	<div
		class="relative overflow-hidden bg-archa-green/30 {featured
			? 'aspect-video md:aspect-auto md:w-1/2'
			: 'aspect-video border-b border-white/10'}"
	>
		{#if post.image}
			<Img
				src={post.image}
				alt=""
				sizes={featured ? '(min-width: 768px) 600px, 100vw' : '(min-width: 1024px) 380px, 100vw'}
				class="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
			/>
		{:else}
			<div
				class="flex size-full min-h-48 items-center justify-center bg-gradient-to-br from-archa-green/50 to-archa-dark"
			>
				<IconNewspaper class="text-6xl text-archa-gold/40" aria-hidden="true" />
			</div>
		{/if}
	</div>
	<div class="flex flex-1 flex-col gap-3 p-6 {featured ? 'md:p-10' : ''}">
		<p class="flex items-center gap-3 text-xs font-bold tracking-widest text-white/60 uppercase">
			<time datetime={post.date}>{formatDate(post.date)}</time>
			<span aria-hidden="true">·</span>
			<span>{post.readingMinutes} min čítania</span>
		</p>
		<svelte:element
			this={`h${headingLevel}`}
			class="font-head leading-tight uppercase transition-colors group-hover:text-archa-gold {featured
				? 'text-3xl md:text-4xl'
				: 'text-2xl'}"
		>
			<a href="/blog/{post.slug}" class="stretched-link">{post.title}</a>
		</svelte:element>
		{#if post.description}
			<p class="text-sm leading-relaxed text-white/70 {featured ? '' : 'line-clamp-3'}">
				{post.description}
			</p>
		{/if}
		<p
			class="mt-auto flex items-center gap-2 pt-3 text-xs font-bold tracking-widest text-archa-gold uppercase"
			aria-hidden="true"
		>
			Čítať článok <IconArrowRight class="transition-transform group-hover:translate-x-1" />
		</p>
	</div>
</article>
