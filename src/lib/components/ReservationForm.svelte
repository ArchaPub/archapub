<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import IconCaretDown from '~icons/ph/caret-down';
	import IconCheckCircle from '~icons/ph/check-circle';
	import IconClock from '~icons/ph/clock';
	import IconMapPin from '~icons/ph/map-pin';
	import IconMinus from '~icons/ph/minus';
	import IconPaperPlaneTilt from '~icons/ph/paper-plane-tilt';
	import IconPhone from '~icons/ph/phone';
	import IconPlus from '~icons/ph/plus';
	import IconWarningCircle from '~icons/ph/warning-circle';
	import { clock } from '#lib/clock.svelte.ts';
	import { reservationSlots, slotDateTime, zonedDateTime, zonedTime } from '#lib/hours.ts';
	import type { Locale } from '#lib/i18n.ts';
	import { internationalPhone } from '#lib/schema.ts';
	import type { HoursEntry, Settings } from '#lib/types.ts';
	import HoursList from './HoursList.svelte';
	import PageHeader from './PageHeader.svelte';
	import Turnstile from './Turnstile.svelte';

	interface PageData {
		hours: HoursEntry[];
		settings: Settings;
		today: string;
		maxDate: string;
		prefillDate: string;
		turnstileSiteKey: string;
		turnstileAction: string;
		maxPeople: number;
	}

	/** The action result; every branch is optional so both routes' ActionData fit. */
	interface FormResult {
		values?: Record<string, string>;
		errors?: Record<string, string | undefined>;
		message?: string;
		summary?: { name: string; when: string; people: number };
	}

	let {
		data,
		form,
		locale
	}: { data: PageData; form: FormResult | null | undefined; locale: Locale } = $props();

	const STRINGS = {
		sk: {
			title: 'Rezervácia',
			lead: 'Vyberte si termín, potvrdenie vám pošleme emailom.',
			sentTitle: 'Žiadosť odoslaná',
			thanks: (name: string) => `Ďakujeme, ${name}. Rezerváciu na`,
			forPeople: 'pre',
			peopleWord: (count: number) => (count === 1 ? 'osobu' : count < 5 ? 'osoby' : 'osôb'),
			willConfirm: 'čoskoro potvrdíme. Potvrdenie o prijatí sme vám poslali emailom.',
			notFinal: 'Kým nepríde potvrdenie, stôl nie je záväzne rezervovaný.',
			homeHref: '/',
			menuHref: '/menu',
			backHome: 'Späť domov',
			seeMenu: 'Pozrieť menu',
			waitForCheck: 'Počkajte prosím, kým sa dokončí overenie nižšie.',
			when: 'Termín',
			date: 'Dátum',
			time: 'Čas',
			chooseTime: 'Vyberte čas',
			closedDay: 'V tento deň je zatvorené',
			chooseDateFirst: 'Najprv vyberte dátum',
			evening: 'Večer',
			afterMidnight: 'Po polnoci (v noci na ďalší deň)',
			people: 'Počet osôb',
			fewer: 'Menej osôb',
			more: 'Viac osôb',
			bigGroup: (max: number) => `Viac ako ${max} osôb alebo oslava?`,
			callUs: 'Zavolajte nám.',
			contact: 'Kontakt',
			name: 'Meno a priezvisko',
			phone: 'Telefón',
			note: 'Poznámka',
			optional: 'nepovinné',
			notePlaceholder: 'Príležitosť, miesto pri okne, alergény…',
			noScript:
				'Online rezervácia potrebuje JavaScript. Rezervovať si môžete aj telefonicky na čísle',
			sending: 'Odosielam…',
			submit: 'Odoslať rezerváciu',
			privacyNote: 'Údaje použijeme len na vybavenie rezervácie. Viac v',
			privacyLink: 'ochrane osobných údajov',
			hours: 'Otváracie hodiny',
			tonight: 'Na dnešný večer?',
			tonightNote: 'Pri rezervácii na ten istý deň je najistejšie zavolať.',
			findUs: 'Kde nás nájdete',
			navigate: 'Navigovať'
		},
		en: {
			title: 'Book a table',
			lead: 'Pick a date and time, we will confirm your table by email.',
			sentTitle: 'Request sent',
			thanks: (name: string) => `Thank you, ${name}. We will confirm your table on`,
			forPeople: 'for',
			peopleWord: (count: number) => (count === 1 ? 'guest' : 'guests'),
			willConfirm: 'shortly. We have emailed you a receipt.',
			notFinal: 'The booking is not final until we confirm it.',
			homeHref: '/en',
			menuHref: '/en/menu',
			backHome: 'Back home',
			seeMenu: 'See the menu',
			waitForCheck: 'Please wait until the check below finishes.',
			when: 'When',
			date: 'Date',
			time: 'Time',
			chooseTime: 'Choose a time',
			closedDay: 'Closed on this day',
			chooseDateFirst: 'Choose a date first',
			evening: 'Evening',
			afterMidnight: 'After midnight (into the next day)',
			people: 'Guests',
			fewer: 'Fewer guests',
			more: 'More guests',
			bigGroup: (max: number) => `More than ${max} guests or a party?`,
			callUs: 'Give us a call.',
			contact: 'Contact',
			name: 'Full name',
			phone: 'Phone',
			note: 'Note',
			optional: 'optional',
			notePlaceholder: 'Occasion, seating wishes, allergies…',
			noScript: 'Online booking needs JavaScript. You can also book by phone at',
			sending: 'Sending…',
			submit: 'Send booking',
			privacyNote: 'We only use your details to handle the booking. See our',
			privacyLink: 'privacy policy (in Slovak)',
			hours: 'Opening hours',
			tonight: 'For tonight?',
			tonightNote: 'For same-day bookings, calling us is the surest way.',
			findUs: 'Find us',
			navigate: 'Directions'
		}
	} as const;
	const t = $derived(STRINGS[locale]);

	const submitted = $derived(form?.values);
	const errors = $derived<Record<string, string | undefined>>(form?.errors ?? {});
	const message = $derived(form?.message);
	const summary = $derived(form?.summary);

	let selectedDate = $state<string>();
	let selectedTime = $state<string>();
	let selectedPeople = $state<number>();

	const date = $derived(selectedDate ?? submitted?.datum ?? data.prefillDate);
	const time = $derived(selectedTime ?? submitted?.cas ?? '');
	const people = $derived(selectedPeople ?? (Number(submitted?.pocet) || 2));

	const slots = $derived.by(() => {
		const all = reservationSlots(data.hours, date);
		if (!clock.now) return all;
		const now = zonedDateTime(zonedTime(clock.now));
		return all.filter((slot) => slotDateTime(date, slot) > now);
	});
	const eveningSlots = $derived(slots.filter((slot) => !slot.afterMidnight));
	const nightSlots = $derived(slots.filter((slot) => slot.afterMidnight));

	let turnstile: Turnstile | undefined = $state();
	let verified = $state(false);
	let submitting = $state(false);
	let clientMessage = $state('');
	let successHeading: HTMLHeadingElement | undefined = $state();

	const phoneHref = $derived(`tel:${internationalPhone(data.settings.phone)}`);

	const fieldProps = (name: string) => ({
		name,
		id: name,
		'aria-invalid': errors[name] ? ('true' as const) : undefined,
		'aria-describedby': errors[name] ? `${name}-error` : undefined
	});
</script>

{#snippet fieldError(name: string)}
	{#if errors[name]}
		<p id="{name}-error" class="flex items-center gap-1.5 text-sm text-red-300">
			<IconWarningCircle class="shrink-0" aria-hidden="true" />
			{errors[name]}
		</p>
	{/if}
{/snippet}

<div class="wrapper">
	<PageHeader eyebrow="Archa Pub" title={t.title} lead={t.lead} />

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="card bg-archa-dark p-6 sm:p-8 lg:col-span-2">
			{#if summary}
				<div class="flex flex-col items-center py-10 text-center" role="status">
					<IconCheckCircle class="mb-4 text-7xl text-archa-gold" aria-hidden="true" />
					<h2
						bind:this={successHeading}
						tabindex="-1"
						class="font-head text-3xl uppercase focus:outline-none"
					>
						{t.sentTitle}
					</h2>
					<p class="mt-3 max-w-md text-white/80">
						{t.thanks(summary.name)}
						<strong class="text-white">{summary.when}</strong>
						{t.forPeople}
						<strong class="text-white">{summary.people}</strong>
						{t.peopleWord(summary.people)}
						{t.willConfirm}
					</p>
					<p class="mt-2 text-sm text-white/60">
						{t.notFinal}
					</p>
					<div class="mt-8 flex flex-wrap justify-center gap-3">
						<a href={t.homeHref} class="btn btn-dark">{t.backHome}</a>
						<a href={t.menuHref} class="btn btn-gold">{t.seeMenu}</a>
					</div>
				</div>
			{:else}
				<form
					method="POST"
					novalidate
					use:enhance={({ cancel }) => {
						clientMessage = '';
						if (!verified) {
							clientMessage = t.waitForCheck;
							cancel();
							return;
						}
						submitting = true;
						return async ({ result, update }) => {
							submitting = false;
							await update({ reset: false });
							if (result.type === 'failure') {
								turnstile?.reset();
								await tick();
								document
									.querySelector<HTMLElement>('[aria-invalid="true"], [data-form-message]')
									?.focus();
							} else if (result.type === 'success') {
								await tick();
								successHeading?.focus();
							}
						};
					}}
					class="flex flex-col gap-6"
				>
					{#if message || clientMessage}
						<p
							data-form-message
							tabindex="-1"
							class="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-200"
							role="alert"
						>
							<IconWarningCircle class="shrink-0 text-xl" aria-hidden="true" />
							{message ?? clientMessage}
						</p>
					{/if}

					<fieldset class="grid gap-5 sm:grid-cols-2">
						<legend class="eyebrow mb-4">{t.when}</legend>

						<div class="flex flex-col gap-2">
							<label for="datum" class="label">{t.date}</label>
							<input
								{...fieldProps('datum')}
								type="date"
								required
								min={data.today}
								max={data.maxDate}
								value={date}
								oninput={(event) => {
									selectedDate = event.currentTarget.value;
									selectedTime = '';
								}}
								class="field [color-scheme:dark]"
							/>
							{@render fieldError('datum')}
						</div>

						<div class="flex flex-col gap-2">
							<label for="cas" class="label">{t.time}</label>
							<div class="relative">
								<select
									{...fieldProps('cas')}
									required
									disabled={!date || slots.length === 0}
									onchange={(event) => (selectedTime = event.currentTarget.value)}
									class="field appearance-none pr-10 disabled:opacity-50"
								>
									<option value="" disabled selected={!time}>
										{date ? (slots.length ? t.chooseTime : t.closedDay) : t.chooseDateFirst}
									</option>
									{#if eveningSlots.length}
										<optgroup label={t.evening}>
											{#each eveningSlots as slot (slot.value)}
												<option value={slot.value} selected={slot.value === time}
													>{slot.value}</option
												>
											{/each}
										</optgroup>
									{/if}
									{#if nightSlots.length}
										<optgroup label={t.afterMidnight}>
											{#each nightSlots as slot (slot.value)}
												<option value={slot.value} selected={slot.value === time}
													>{slot.value}</option
												>
											{/each}
										</optgroup>
									{/if}
								</select>
								<IconCaretDown
									class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-archa-gold"
									aria-hidden="true"
								/>
							</div>
							{@render fieldError('cas')}
						</div>

						<div class="flex flex-col gap-2 sm:col-span-2">
							<label for="pocet" class="label">{t.people}</label>
							<div class="flex items-center gap-3">
								<button
									type="button"
									class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/15 text-xl hover:border-archa-gold disabled:opacity-40"
									disabled={people <= 1}
									onclick={() => (selectedPeople = Math.max(1, people - 1))}
								>
									<IconMinus aria-hidden="true" /><span class="sr-only">{t.fewer}</span>
								</button>
								<input
									{...fieldProps('pocet')}
									type="number"
									inputmode="numeric"
									required
									min="1"
									max={data.maxPeople}
									value={people}
									oninput={(event) => (selectedPeople = Number(event.currentTarget.value))}
									class="field w-24 text-center text-lg font-bold tabular-nums"
								/>
								<button
									type="button"
									class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/15 text-xl hover:border-archa-gold disabled:opacity-40"
									disabled={people >= data.maxPeople}
									onclick={() => (selectedPeople = Math.min(data.maxPeople, people + 1))}
								>
									<IconPlus aria-hidden="true" /><span class="sr-only">{t.more}</span>
								</button>
							</div>
							<p class="text-sm text-white/60">
								{t.bigGroup(data.maxPeople)}
								<a href={phoneHref} class="text-archa-gold underline underline-offset-4"
									>{t.callUs}</a
								>
							</p>
							{@render fieldError('pocet')}
						</div>
					</fieldset>

					<fieldset class="grid gap-5 sm:grid-cols-2">
						<legend class="eyebrow mb-4">{t.contact}</legend>

						<div class="flex flex-col gap-2 sm:col-span-2">
							<label for="meno" class="label">{t.name}</label>
							<input
								{...fieldProps('meno')}
								type="text"
								required
								autocomplete="name"
								maxlength="100"
								value={submitted?.meno ?? ''}
								class="field"
							/>
							{@render fieldError('meno')}
						</div>

						<div class="flex flex-col gap-2">
							<label for="email" class="label">Email</label>
							<input
								{...fieldProps('email')}
								type="email"
								required
								autocomplete="email"
								maxlength="254"
								value={submitted?.email ?? ''}
								class="field"
							/>
							{@render fieldError('email')}
						</div>

						<div class="flex flex-col gap-2">
							<label for="telefon" class="label"
								>{t.phone}
								<span class="font-normal tracking-normal text-white/50 normal-case"
									>({t.optional})</span
								></label
							>
							<input
								{...fieldProps('telefon')}
								type="tel"
								autocomplete="tel"
								inputmode="tel"
								maxlength="30"
								placeholder="+421 9xx xxx xxx"
								value={submitted?.telefon ?? ''}
								class="field"
							/>
							{@render fieldError('telefon')}
						</div>

						<div class="flex flex-col gap-2 sm:col-span-2">
							<label for="poznamka" class="label"
								>{t.note}
								<span class="font-normal tracking-normal text-white/50 normal-case"
									>({t.optional})</span
								></label
							>
							<textarea
								{...fieldProps('poznamka')}
								rows="3"
								maxlength="1000"
								placeholder={t.notePlaceholder}
								class="field resize-y">{submitted?.poznamka ?? ''}</textarea
							>
							{@render fieldError('poznamka')}
						</div>
					</fieldset>

					<Turnstile
						bind:this={turnstile}
						bind:verified
						siteKey={data.turnstileSiteKey}
						action={data.turnstileAction}
					/>

					<noscript>
						<p class="rounded-xl border border-white/15 p-4 text-sm text-white/80">
							{t.noScript}
							<a href={phoneHref} class="text-archa-gold">{data.settings.phone}</a>.
						</p>
					</noscript>

					<div class="flex flex-col gap-3">
						<button
							type="submit"
							class="btn btn-gold w-full text-base sm:w-auto sm:self-start"
							disabled={submitting}
						>
							<IconPaperPlaneTilt aria-hidden="true" />
							{submitting ? t.sending : t.submit}
						</button>
						<p class="text-xs text-white/60">
							{t.privacyNote}
							<a href="/ochrana-sukromia" class="underline underline-offset-4 hover:text-white"
								>{t.privacyLink}</a
							>.
						</p>
					</div>
				</form>
			{/if}
		</div>

		<aside class="flex flex-col gap-4">
			<section class="card bg-archa-green" aria-labelledby="aside-hours">
				<h2 id="aside-hours" class="eyebrow mb-2 text-archa-beige/80">
					<IconClock aria-hidden="true" />
					{t.hours}
				</h2>
				<HoursList hours={data.hours} tone="green" />
			</section>

			<section class="card bg-archa-dark" aria-labelledby="aside-phone">
				<h2 id="aside-phone" class="eyebrow mb-3">
					<IconPhone aria-hidden="true" />
					{t.tonight}
				</h2>
				<p class="text-sm text-white/75">{t.tonightNote}</p>
				<a href={phoneHref} class="btn btn-dark mt-4 w-full">{data.settings.phone}</a>
			</section>

			<section class="card bg-archa-dark" aria-labelledby="aside-place">
				<h2 id="aside-place" class="eyebrow mb-3">
					<IconMapPin aria-hidden="true" />
					{t.findUs}
				</h2>
				<p class="text-white/85">
					{data.settings.street}, {data.settings.postalCode}
					{data.settings.city}
				</p>
				<a
					href={data.settings.mapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-dark mt-4 w-full">{t.navigate}</a
				>
			</section>
		</aside>
	</div>
</div>
