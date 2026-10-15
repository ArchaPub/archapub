<script lang="ts">
	import IconArrowLeft from '~icons/ph/arrow-left';
	import IconCalendarBlank from '~icons/ph/calendar-blank';
	import IconClock from '~icons/ph/clock';
	import Img from '#lib/components/Img.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { formatDate } from '#lib/dates.ts';
	import { imageUrl } from '#lib/images.ts';
	import { articleSchema, breadcrumbSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const post = $derived(data.post);
	const ogImage = $derived(imageUrl(post.image));
</script>

<Seo
	title={post.title}
	description={post.description}
	image={ogImage}
	type="article"
	publishedTime={post.date}
	jsonLd={[
		articleSchema(post, data.settings, ogImage),
		breadcrumbSchema([
			{ name: 'Blog', path: '/blog' },
			{ name: post.title, path: `/blog/${post.slug}` }
		])
	]}
/>

<div class="wrapper">
	<article class="mx-auto max-w-3xl">
		<a
			href="/blog"
			class="mb-6 inline-flex items-center gap-2 text-sm font-bold tracking-widest text-white/70 uppercase hover:text-archa-gold"
		>
			<IconArrowLeft aria-hidden="true" /> Blog
		</a>

		<header class="mb-8">
			<h1 class="heading-xl text-balance">{post.title}</h1>
			<p class="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
				<span
					class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
				>
					<IconCalendarBlank class="text-archa-gold" aria-hidden="true" />
					<time datetime={post.date}>{formatDate(post.date)}</time>
				</span>
				<span
					class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
				>
					<IconClock class="text-archa-gold" aria-hidden="true" />
					{post.readingMinutes} min čítania
				</span>
			</p>
			{#if post.description}
				<p class="mt-6 text-xl leading-relaxed text-white/80">{post.description}</p>
			{/if}
		</header>

		{#if post.image}
			<Img
				src={post.image}
				alt=""
				priority
				sizes="(min-width: 768px) 768px, 100vw"
				class="mb-10 aspect-video w-full rounded-3xl border border-white/10 object-cover"
			/>
		{/if}

		<div class="prose-archa">
			{@html post.html}
		</div>

		<aside class="card mt-12 flex-row flex-wrap items-center justify-between gap-4 bg-archa-green">
			<p class="font-head text-2xl uppercase">Zastavte sa u nás</p>
			<a href="/rezervacia" class="btn btn-gold">Rezervovať stôl</a>
		</aside>
	</article>

	{#if data.morePosts.length > 0}
		<section class="mx-auto mt-16 max-w-5xl" aria-labelledby="more-posts">
			<h2 id="more-posts" class="heading-lg mb-6">Ďalšie články</h2>
			<ul class="grid gap-6 md:grid-cols-2">
				{#each data.morePosts as other (other.slug)}
					<li><PostCard post={other} headingLevel={3} /></li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
