<script lang="ts">
	import { page } from '$app/state';
	import { clock } from '#lib/clock.svelte.ts';
	import { ON_DAY, openStatus, zonedTime } from '#lib/hours.ts';
	import { localeOf, onDay, ui } from '#lib/i18n.ts';
	import type { HoursEntry } from '#lib/types.ts';

	let { hours, class: className = '' }: { hours: HoursEntry[]; class?: string } = $props();

	const status = $derived(clock.now ? openStatus(hours, zonedTime(clock.now)) : null);

	const locale = $derived(localeOf(page.url.pathname));

	const label = $derived.by(() => {
		const t = ui[locale];
		if (!status) return '';
		if (status.open) return t.openUntil(status.closesAt);
		if (!status.opensAt) return t.closed;
		const { daysAhead, day, time } = status.opensAt;
		const when =
			daysAhead === 0 ? t.today : daysAhead === 1 ? t.tomorrow : onDay(day, locale, ON_DAY);
		return t.opens(when, time);
	});
</script>

<!-- Fixed height keeps the layout steady before the client knows the time -->
<p class="flex h-7 items-center {className}" aria-live="polite">
	{#if status}
		<span
			class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold {status.open
				? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
				: 'border-white/15 bg-white/5 text-white/75'}"
		>
			<span class="relative flex size-2" aria-hidden="true">
				{#if status.open}
					<span
						class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60"
					></span>
				{/if}
				<span
					class="relative inline-flex size-2 rounded-full {status.open
						? 'bg-emerald-400'
						: 'bg-white/40'}"
				></span>
			</span>
			{label}
		</span>
	{/if}
</p>
