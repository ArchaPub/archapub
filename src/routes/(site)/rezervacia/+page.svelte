<script lang="ts">
	import ReservationForm from '#lib/components/ReservationForm.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { breadcrumbSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Seo
	title="Rezervácia stola"
	description="Rezervujte si stôl v Archa Pube na Hlavnej 23 v Prešove online za minútu. Na oslavu, partiu šípok alebo len na pivo s priateľmi – otvorené do rána."
	jsonLd={[breadcrumbSchema([{ name: 'Rezervácia', path: '/rezervacia' }])]}
/>

<ReservationForm {data} {form} locale="sk" />
