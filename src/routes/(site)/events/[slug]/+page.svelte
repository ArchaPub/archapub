<script lang="ts">
	import IconArrowLeft from '~icons/ph/arrow-left';
	import IconCalendarBlank from '~icons/ph/calendar-blank';
	import IconCalendarPlus from '~icons/ph/calendar-plus';
	import IconClock from '~icons/ph/clock';
	import IconMapPin from '~icons/ph/map-pin';
	import IconShareNetwork from '~icons/ph/share-network';
	import IconTicket from '~icons/ph/ticket';
	import { everyWeekday } from '#lib/events.ts';
	import Img from '#lib/components/Img.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { clock } from '#lib/clock.svelte.ts';
	import { formatDateLongWithYear, formatTimeOfDay, localDate } from '#lib/dates.ts';
	import { imageUrl } from '#lib/images.ts';
	import { breadcrumbSchema, eventSchema } from '#lib/schema.ts';
	import { EVENT_GRACE_HOURS } from '#lib/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const event = $derived(data.event);
	const ogImage = $derived(imageUrl(event.image));
	const isPast = $derived(
		clock.now !== null &&
			new Date(event.date).getTime() + EVENT_GRACE_HOURS * 3_600_000 < clock.now.getTime()
	);

	let shareMessage = $state('');

	async function share() {
		const shareData = { title: event.title, url: location.href };
		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch {
				// The user closed the share sheet
			}
			return;
		}
		await navigator.clipboard.writeText(location.href);
		shareMessage = 'Odkaz skopírovaný';
		setTimeout(() => (shareMessage = ''), 2500);
	}
</script>

<Seo
	title={event.title}
	description={event.description ||
		`${event.title} v Archa Pube, ${formatDateLongWithYear(event.date)} o ${formatTimeOfDay(event.date)}.`}
	image={ogImage}
	type="article"
	jsonLd={[
		eventSchema(event, data.settings, ogImage),
		breadcrumbSchema([
			{ name: 'Program', path: '/events' },
			{ name: event.title, path: `/events/${event.slug}` }
		])
	]}
/>

<div class="wrapper">
	<a
		href="/events"
		class="mb-6 inline-flex items-center gap-2 text-sm font-bold tracking-widest text-white/70 uppercase hover:text-archa-gold"
	>
		<IconArrowLeft aria-hidden="true" /> Program
	</a>

	<article class="grid gap-8 lg:grid-cols-12">
		<div class="order-2 lg:order-1 lg:col-span-5">
			<div
				class="overflow-hidden rounded-3xl border border-white/10 bg-archa-dark lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]"
			>
				{#if event.image}
					<Img
						src={event.image}
						alt="Plagát: {event.title}"
						priority
						sizes="(min-width: 1024px) 480px, 100vw"
						class="h-auto w-full"
					/>
				{:else}
					<div
						class="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-archa-green/60 to-archa-dark"
					>
						<img src="/logo.svg" alt="" class="w-1/2 opacity-30" />
					</div>
				{/if}
			</div>
		</div>

		<div class="order-1 lg:order-2 lg:col-span-7">
			{#if isPast}
				<p
					class="mb-6 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80"
				>
					Táto akcia už prebehla. <a
						href="/events"
						class="font-semibold text-archa-gold underline underline-offset-4"
						>Pozrite si aktuálny program.</a
					>
				</p>
			{/if}

			{#if event.category}
				<p class="tag mb-4 border border-archa-gold/30 bg-archa-gold/15 text-archa-gold">
					{event.category}
				</p>
			{/if}
			<h1 class="heading-xl text-balance">{event.title}</h1>

			<dl class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div class="card gap-1 bg-archa-dark p-4">
					<dt class="eyebrow text-[10px]">
						<IconCalendarBlank aria-hidden="true" />
						{event.weekly ? 'Najbližšie' : 'Dátum'}
					</dt>
					<dd class="font-semibold first-letter:uppercase">
						<time datetime={event.date}>{formatDateLongWithYear(event.date)}</time>
						{#if event.weekly}
							<span class="block text-sm font-normal text-archa-gold"
								>{everyWeekday(event.date)}</span
							>
						{/if}
					</dd>
				</div>
				<div class="card gap-1 bg-archa-dark p-4">
					<dt class="eyebrow text-[10px]"><IconClock aria-hidden="true" /> Čas</dt>
					<dd class="font-semibold">
						{formatTimeOfDay(event.date)}{#if event.end}&nbsp;– {formatTimeOfDay(event.end)}{/if}
					</dd>
				</div>
				{#if event.price}
					<div class="card gap-1 bg-archa-dark p-4">
						<dt class="eyebrow text-[10px]"><IconTicket aria-hidden="true" /> Vstupné</dt>
						<dd class="font-semibold">{event.price}</dd>
					</div>
				{/if}
				<div class="card gap-1 bg-archa-dark p-4">
					<dt class="eyebrow text-[10px]"><IconMapPin aria-hidden="true" /> Miesto</dt>
					<dd class="font-semibold">{data.settings.name}, {data.settings.street}</dd>
				</div>
			</dl>

			{#if !isPast}
				<div class="mt-6 flex flex-wrap gap-3">
					<a href="/rezervacia?datum={localDate(event.date)}" class="btn btn-gold"
						>Rezervovať stôl na tento večer</a
					>
					<a href="/events/{event.slug}/kalendar.ics" class="btn btn-dark" download>
						<IconCalendarPlus aria-hidden="true" /> Do kalendára
					</a>
					<button type="button" class="btn btn-dark" onclick={share}>
						<IconShareNetwork aria-hidden="true" /> Zdieľať
					</button>
					<span class="self-center text-sm text-archa-gold" aria-live="polite">{shareMessage}</span>
				</div>
			{/if}

			{#if event.description}
				<p class="mt-8 text-xl leading-relaxed text-white/85">{event.description}</p>
			{/if}
			{#if event.html.trim()}
				<div class="prose-archa mt-6">
					{@html event.html}
				</div>
			{/if}
		</div>
	</article>
</div>
