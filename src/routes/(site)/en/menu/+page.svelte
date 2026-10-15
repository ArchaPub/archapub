<script lang="ts">
	import MenuView from '#lib/components/MenuView.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo
	title="Menu & drinks"
	description="Beer on tap, wine, spirits, soft drinks and bar snacks at Archa Pub on the main street of Prešov. Current drinks list and prices."
/>

<MenuView
	food={data.food}
	drinks={data.drinks}
	allergens={data.allergens}
	menuInfo={data.menuInfo}
	locale="en"
/>
