<script lang="ts">
	import ReservationForm from '#lib/components/ReservationForm.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { breadcrumbSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Seo
	title="Rezervácia stola"
	description="Rezervujte si stôl v Archa Pube na Hlavnej v Prešove. Otvorené do rána, cez víkend do 4:00."
	jsonLd={[breadcrumbSchema([{ name: 'Rezervácia', path: '/rezervacia' }])]}
/>

<ReservationForm {data} {form} locale="sk" />
