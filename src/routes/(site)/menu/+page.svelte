<script lang="ts">
	import MenuView from '#lib/components/MenuView.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { groupByCategory } from '#lib/menu.ts';
	import { breadcrumbSchema, menuSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Mention what's actually on tap so the description follows the CMS
	const tapBeers = $derived([
		...new Set(data.drinks.filter((d) => d.tap && d.category === 'Pivo').map((d) => d.name))
	]);
</script>

<Seo
	title="Nápojový lístok a ceny"
	description={`Aktuálny nápojový lístok Archa Pubu v Prešove${tapBeers.length ? `: čapovaný ${tapBeers.join(', ')}` : ''}, víno, destiláty, nealko a niečo k pivu – s cenami.`}
	jsonLd={[
		menuSchema(groupByCategory(data.food), groupByCategory(data.drinks)),
		breadcrumbSchema([{ name: 'Menu', path: '/menu' }])
	]}
/>

<MenuView
	food={data.food}
	drinks={data.drinks}
	allergens={data.allergens}
	menuInfo={data.menuInfo}
	locale="sk"
/>
