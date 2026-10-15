<script lang="ts">
	import IconArrowLeft from '~icons/ph/arrow-left';
	import IconGhost from '~icons/ph/ghost';
	import EventCard from '#lib/components/EventCard.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { breadcrumbSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const byYear = $derived.by(() => {
		const years = new Map<string, typeof data.events>();
		for (const event of data.events) {
			const year = event.date.slice(0, 4);
			years.set(year, [...(years.get(year) ?? []), event]);
		}
		return [...years];
	});
</script>

<Seo
	title="Archív akcií"
	description="Archív akcií Archa Pubu v Prešove – párty, koncerty a kvízy, ktoré u nás už prebehli."
	jsonLd={[breadcrumbSchema([{ name: 'Archív akcií', path: '/archive' }])]}
/>

<div class="wrapper">
	<PageHeader eyebrow="Program" title="Archív akcií" lead="To najlepšie, čo sme už spolu zažili.">
		<a
			href="/events"
			class="flex items-center gap-2 text-sm font-bold tracking-widest text-white/70 uppercase hover:text-archa-gold"
		>
			<IconArrowLeft aria-hidden="true" /> Aktuálny program
		</a>
	</PageHeader>

	{#if byYear.length > 0}
		<div class="flex flex-col gap-12">
			{#each byYear as [year, events] (year)}
				<section aria-labelledby="year-{year}">
					<h2 id="year-{year}" class="eyebrow mb-4">{year}</h2>
					<ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each events as event (event.slug)}
							<li><EventCard {event} past /></li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	{:else}
		<div class="card items-center bg-archa-dark py-16 text-center">
			<IconGhost class="mb-4 text-6xl text-white/25" aria-hidden="true" />
			<h2 class="font-head text-3xl uppercase">Archív je zatiaľ prázdny</h2>
			<p class="mt-3 max-w-md text-white/70">Keď nejaká akcia prebehne, nájdete ju tu.</p>
		</div>
	{/if}
</div>
