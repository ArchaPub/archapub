<script lang="ts">
	import ReservationForm from '#lib/components/ReservationForm.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { breadcrumbSchema } from '#lib/schema.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Seo
	title="Rezervácia stola"
	description="Rezervujte si stôl v Archa Pube na Hlavnej 23 v Prešove online za minútu. Oslava, partia na šípky alebo len pivo s kamošmi – otvorené do rána."
	jsonLd={[breadcrumbSchema([{ name: 'Rezervácia', path: '/rezervacia' }])]}
/>

<ReservationForm {data} {form} locale="sk" />
