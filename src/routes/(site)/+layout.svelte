<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { localeOf, ui } from '#lib/i18n.ts';
	import Footer from '#lib/components/Footer.svelte';
	import Header from '#lib/components/Header.svelte';
	import NoticeBar from '#lib/components/NoticeBar.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const t = $derived(ui[localeOf(page.url.pathname)]);

	// Cross-fade between pages where the browser supports view transitions
	onNavigate((navigation) => {
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches)
			return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<a
	href="#obsah"
	class="sr-only z-50 rounded-full bg-archa-gold px-4 py-2 font-bold text-black focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
>
	{t.skipToContent}
</a>

<NoticeBar notices={data.notices} />
<Header settings={data.settings} hours={data.hours} socials={data.socials} />

<main id="obsah" tabindex="-1" class="pt-6 focus:outline-none sm:pt-8">
	{@render children()}
</main>

<Footer settings={data.settings} hours={data.hours} socials={data.socials} />
