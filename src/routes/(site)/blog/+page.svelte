<script lang="ts">
	import IconArticle from '~icons/ph/article';
	import IconRss from '~icons/ph/rss';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { breadcrumbSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const [featured, ...rest] = $derived(data.posts);
</script>

<Seo
	title="Blog"
	description="Novinky, príbehy a zaujímavosti o pive z Archa Pubu v Prešove."
	jsonLd={[breadcrumbSchema([{ name: 'Blog', path: '/blog' }])]}
/>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="Archa Pub · Blog" href="/blog/rss.xml" />
</svelte:head>

<div class="wrapper">
	<PageHeader eyebrow="Archa Pub" title="Blog" lead="Novinky a zaujímavosti z Archa Pubu.">
		<a
			href="/blog/rss.xml"
			class="flex items-center gap-2 text-sm font-bold tracking-widest text-white/70 uppercase hover:text-archa-gold"
		>
			<IconRss aria-hidden="true" /> RSS
		</a>
	</PageHeader>

	{#if featured}
		<div class="flex flex-col gap-6">
			<PostCard post={featured} featured />
			{#if rest.length > 0}
				<ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each rest as post (post.slug)}
						<li><PostCard {post} /></li>
					{/each}
				</ul>
			{/if}
		</div>
	{:else}
		<div class="card items-center bg-archa-dark py-16 text-center">
			<IconArticle class="mb-4 text-6xl text-white/25" aria-hidden="true" />
			<h2 class="font-head text-3xl uppercase">Zatiaľ žiadne články</h2>
			<p class="mt-3 max-w-md text-white/70">Prvé články čoskoro.</p>
		</div>
	{/if}
</div>
