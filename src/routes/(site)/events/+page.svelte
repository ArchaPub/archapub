<script lang="ts">
	import IconArrowRight from '~icons/ph/arrow-right';
	import IconCalendarBlank from '~icons/ph/calendar-blank';
	import EventCard from '#lib/components/EventCard.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { formatMonthYear } from '#lib/dates.ts';
	import { breadcrumbSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const categories = $derived([
		...new Set(data.events.map((event) => event.category).filter(Boolean))
	]);
	let category = $state<string | null>(null);

	const filtered = $derived(
		category ? data.events.filter((event) => event.category === category) : data.events
	);

	const byMonth = $derived.by(() => {
		const months = new Map<string, typeof filtered>();
		for (const event of filtered) {
			const month = formatMonthYear(event.date);
			months.set(month, [...(months.get(month) ?? []), event]);
		}
		return [...months];
	});
</script>

<Seo
	title="Program a akcie"
	description="Najbližšie akcie v Archa Pube v Prešove: párty, koncerty, pub kvízy a šport. Pozrite si program a rezervujte si stôl na večer."
	jsonLd={[breadcrumbSchema([{ name: 'Program', path: '/events' }])]}
/>

<div class="wrapper">
	<PageHeader
		eyebrow="Archa Pub"
		title="Program"
		lead="Párty, koncerty, kvízy a šport. Stôl si môžete rezervovať priamo pri akcii."
	>
		<a
			href="/archive"
			class="flex items-center gap-2 text-sm font-bold tracking-widest text-white/70 uppercase hover:text-archa-gold"
		>
			Archív akcií <IconArrowRight aria-hidden="true" />
		</a>
	</PageHeader>

	{#if categories.length > 1}
		<div role="group" aria-label="Filtrovať podľa typu" class="mb-8 flex flex-wrap gap-2">
			{#each [null, ...categories] as option (option)}
				<button
					type="button"
					aria-pressed={category === option}
					class="min-h-10 rounded-full border border-white/15 px-4 text-sm font-semibold capitalize transition-colors hover:border-archa-gold aria-pressed:border-archa-gold aria-pressed:bg-archa-gold aria-pressed:text-black"
					onclick={() => (category = option)}
				>
					{option ?? 'Všetko'}
				</button>
			{/each}
		</div>
	{/if}

	{#if filtered.length > 0}
		<div class="flex flex-col gap-12">
			{#each byMonth as [month, events] (month)}
				<section aria-labelledby="month-{month}">
					<h2 id="month-{month}" class="eyebrow mb-4 capitalize">{month}</h2>
					<ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each events as event (event.slug)}
							<li><EventCard {event} /></li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	{:else}
		<div class="card items-center bg-archa-dark py-16 text-center">
			<IconCalendarBlank class="mb-4 text-6xl text-white/25" aria-hidden="true" />
			<h2 class="font-head text-3xl uppercase">Zatiaľ nie je nič v pláne</h2>
			<p class="mt-3 max-w-md text-white/70">
				Nové akcie zverejňujeme tu aj na sociálnych sieťach. Do baru sa dá prísť aj bez programu.
			</p>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<a href="/rezervacia" class="btn btn-gold">Rezervovať stôl</a>
				<a href="/archive" class="btn btn-dark">Pozrieť archív</a>
			</div>
		</div>
	{/if}
</div>
