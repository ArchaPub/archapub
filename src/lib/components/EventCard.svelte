<script lang="ts">
	import IconArrowRight from '~icons/ph/arrow-right';
	import IconClock from '~icons/ph/clock';
	import { formatDateLong, formatDay, formatMonthShort, formatTimeOfDay } from '#lib/dates.ts';
	import type { EventSummary } from '#lib/types.ts';
	import { everyWeekday } from '#lib/events.ts';
	import Img from './Img.svelte';

	let {
		event,
		headingLevel = 3,
		past = false
	}: { event: EventSummary; headingLevel?: 2 | 3; past?: boolean } = $props();
</script>

<article
	class="card card-interactive group h-full bg-archa-dark p-0 {past
		? 'opacity-80 hover:opacity-100'
		: ''}"
>
	<div class="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-archa-green/30">
		{#if event.image}
			<Img
				src={event.image}
				alt=""
				sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
				class="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 {past
					? 'grayscale-[60%] group-hover:grayscale-0'
					: ''}"
			/>
		{:else}
			<div
				class="flex size-full flex-col items-center justify-center bg-gradient-to-br from-archa-green to-archa-dark font-head leading-none text-archa-beige uppercase"
				aria-hidden="true"
			>
				<span class="text-8xl">{formatDay(event.date)}</span>
				<span class="text-3xl tracking-[0.3em] text-archa-gold">{formatMonthShort(event.date)}</span
				>
			</div>
		{/if}
		{#if event.image}
			<div class="date-badge absolute top-4 left-4" aria-hidden="true">
				<span class="day">{formatDay(event.date)}</span>
				<span class="month">{formatMonthShort(event.date)}</span>
			</div>
		{/if}
		{#if event.category}
			<span class="tag absolute top-4 right-4 bg-black/70 text-archa-gold backdrop-blur-md"
				>{event.category}</span
			>
		{/if}
	</div>

	<div class="flex flex-1 flex-col gap-2 p-6">
		<p class="flex items-center gap-2 text-sm font-semibold text-archa-gold">
			<IconClock aria-hidden="true" />
			<time datetime={event.date}>{formatDateLong(event.date)} · {formatTimeOfDay(event.date)}</time
			>
		</p>
		<svelte:element
			this={`h${headingLevel}`}
			class="font-head text-2xl leading-tight uppercase transition-colors group-hover:text-archa-gold"
		>
			<a href="/events/{event.slug}" class="stretched-link">{event.title}</a>
		</svelte:element>
		{#if event.weekly || event.price}
			<p class="flex flex-wrap gap-2 text-xs font-semibold">
				{#if event.weekly}<span class="tag bg-archa-green text-archa-beige"
						>{everyWeekday(event.date)}</span
					>{/if}
				{#if event.price}<span class="tag bg-white/10 text-white/80">{event.price}</span>{/if}
			</p>
		{/if}
		{#if event.description}
			<p class="line-clamp-2 text-sm text-white/70">{event.description}</p>
		{/if}
		<p
			class="mt-auto flex items-center gap-2 pt-3 text-xs font-bold tracking-widest text-archa-gold uppercase"
			aria-hidden="true"
		>
			Viac info <IconArrowRight class="transition-transform group-hover:translate-x-1" />
		</p>
	</div>
</article>
