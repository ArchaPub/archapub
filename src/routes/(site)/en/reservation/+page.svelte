<script lang="ts">
	import ReservationForm from '#lib/components/ReservationForm.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Seo
	title="Book a table"
	description="Book a table at Archa Pub on the main street of Prešov. Open until late, until 4 am at weekends."
/>

<ReservationForm {data} {form} locale="en" />
