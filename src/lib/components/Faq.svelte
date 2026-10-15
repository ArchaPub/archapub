<script lang="ts">
	import IconCaretDown from '~icons/ph/caret-down';
	import IconQuestion from '~icons/ph/question';
	import { englishDayRange, type Locale } from '#lib/i18n.ts';
	import { jsonLdScript } from '#lib/schema.ts';
	import type { DrinkItem, HoursEntry, Settings } from '#lib/types.ts';

	interface Props {
		settings: Settings;
		hours: HoursEntry[];
		drinks: DrinkItem[];
		locale: Locale;
	}

	let { settings, hours, drinks, locale }: Props = $props();

	const taps = $derived([
		...new Set(drinks.filter((d) => d.tap && d.category === 'Pivo').map((d) => d.name))
	]);

	// Answers are built from the same data as the rest of the site, so they never contradict it
	const items = $derived.by(() => {
		const sk = locale === 'sk';
		const schedule = hours
			.map((h) => `${sk ? h.label : englishDayRange(h.days)} ${h.opens}–${h.closes}`)
			.join(', ');
		const list = [
			sk
				? {
						q: 'Do koľkej má Archa Pub otvorené?',
						a: `Otvárame každý deň večer a zatvárame až nad ránom: ${schedule}.`
					}
				: {
						q: 'How late is Archa Pub open?',
						a: `We open every evening and close in the early hours: ${schedule}.`
					},
			sk
				? {
						q: 'Dá sa u vás rezervovať stôl?',
						a: `Áno. Stôl si rezervujete online na stránke Rezervácia alebo telefonicky na čísle ${settings.phone}. Pre väčšie skupiny a oslavy je najlepšie zavolať.`
					}
				: {
						q: 'Can I book a table?',
						a: `Yes. Book online on the Book a table page or call us on ${settings.phone}. For large groups and parties, calling is best.`
					},
			sk
				? {
						q: 'Kde Archa Pub nájdem?',
						a: `V centre Prešova na adrese ${settings.street}, ${settings.postalCode} ${settings.city}, pod historickou kamennou klenbou.`
					}
				: {
						q: 'Where is Archa Pub?',
						a: `In the centre of Prešov at ${settings.street}, ${settings.postalCode} ${settings.city}, under a historic stone vault.`
					},
			sk
				? {
						q: 'Čo sa dá u vás robiť okrem piva?',
						a: 'V herni máme šípky a stolný futbal. Podľa programu robíme aj párty, kvízy, koncerty či športové prenosy – pozrite si, čo sa chystá.'
					}
				: {
						q: 'What else is there besides beer?',
						a: 'Our games room has darts and table football, and our events programme includes parties, quizzes, concerts and sports nights.'
					}
		];
		if (taps.length > 0) {
			list.splice(
				1,
				0,
				sk
					? { q: 'Aké pivo čapujete?', a: `Na čape máme ${taps.join(', ')}.` }
					: { q: 'Which beers are on tap?', a: `On tap: ${taps.join(', ')}.` }
			);
		}
		return list;
	});

	const schema = $derived({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.q,
			acceptedAnswer: { '@type': 'Answer', text: item.a }
		}))
	});
</script>

<svelte:head>
	{@html jsonLdScript(schema)}
</svelte:head>

<section class="reveal grid gap-8 lg:grid-cols-3" aria-labelledby="faq-heading">
	<div>
		<p class="eyebrow mb-2">
			<IconQuestion aria-hidden="true" />
			{locale === 'sk' ? 'Časté otázky' : 'FAQ'}
		</p>
		<h2 id="faq-heading" class="heading-lg">
			{locale === 'sk' ? 'Než prídete' : 'Before you come'}
		</h2>
	</div>
	<div class="flex flex-col gap-3 lg:col-span-2">
		{#each items as item (item.q)}
			<details class="group card bg-archa-dark p-0 open:border-archa-gold/30">
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden"
				>
					{item.q}
					<IconCaretDown
						class="shrink-0 text-archa-gold transition-transform group-open:rotate-180"
						aria-hidden="true"
					/>
				</summary>
				<p class="px-5 pb-5 leading-relaxed text-white/80">{item.a}</p>
			</details>
		{/each}
	</div>
</section>
