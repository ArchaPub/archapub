<script lang="ts">
	import { page } from '$app/state';
	import { clock } from '#lib/clock.svelte.ts';
	import { businessDay, zonedTime } from '#lib/hours.ts';
	import { englishDayRange, localeOf, ui } from '#lib/i18n.ts';
	import type { HoursEntry } from '#lib/types.ts';

	let { hours, tone = 'dark' }: { hours: HoursEntry[]; tone?: 'dark' | 'green' } = $props();

	const locale = $derived(localeOf(page.url.pathname));
	const today = $derived(clock.now ? businessDay(hours, zonedTime(clock.now)) : null);
</script>

<dl>
	{#each hours as entry (entry.label)}
		{@const isToday = today !== null && entry.days.includes(today)}
		<div
			class="list-row {tone === 'green' ? 'border-white/20' : ''} {isToday
				? 'font-bold text-archa-gold'
				: entry.highlight
					? 'text-archa-beige'
					: 'text-white/75'}"
		>
			<dt class="flex items-center gap-2">
				{locale === 'en' ? englishDayRange(entry.days) : entry.label}
				{#if isToday}<span class="tag bg-archa-gold/15 px-2 py-0.5 text-[10px] text-archa-gold"
						>{ui[locale].todayTag}</span
					>{/if}
			</dt>
			<dd class="tabular-nums">{entry.opens} – {entry.closes}</dd>
		</div>
	{/each}
</dl>
