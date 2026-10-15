<script lang="ts">
	import MenuView from '#lib/components/MenuView.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { groupByCategory } from '#lib/menu.ts';
	import { breadcrumbSchema, menuSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo
	title="Menu a nápojový lístok"
	description="Čapované pivo, víno, destiláty, nealko a niečo k pivu. Aktuálny nápojový lístok a ceny v Archa Pube na Hlavnej v Prešove."
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
