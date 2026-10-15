<script lang="ts">
	import ReservationForm from '#lib/components/ReservationForm.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Seo
	title="Book a table"
	description="Book a table online at Archa Pub on Hlavná street in Prešov city centre. Birthdays, a darts night or just a pint with friends – open until late."
/>

<ReservationForm {data} {form} locale="en" />
