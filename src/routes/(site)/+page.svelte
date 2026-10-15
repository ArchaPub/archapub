<script lang="ts">
	import IconArrowRight from '~icons/ph/arrow-right';
	import IconCalendarBlank from '~icons/ph/calendar-blank';
	import IconCamera from '~icons/ph/camera';
	import IconClock from '~icons/ph/clock';
	import IconMapPin from '~icons/ph/map-pin';
	import IconNavigationArrow from '~icons/ph/navigation-arrow';
	import IconNewspaper from '~icons/ph/newspaper';
	import IconPhone from '~icons/ph/phone';
	import IconQuotes from '~icons/ph/quotes';
	import IconStar from '~icons/ph/star';
	import IconTarget from '~icons/ph/target';
	import IconWine from '~icons/ph/wine';
	import EventCard from '#lib/components/EventCard.svelte';
	import FeatureBlock from '#lib/components/FeatureBlock.svelte';
	import Faq from '#lib/components/Faq.svelte';
	import Gallery from '#lib/components/Gallery.svelte';
	import HoursList from '#lib/components/HoursList.svelte';
	import Img from '#lib/components/Img.svelte';
	import Marquee from '#lib/components/Marquee.svelte';
	import OpenStatus from '#lib/components/OpenStatus.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { formatPrice, formatVolume } from '#lib/menu.ts';
	import { internationalPhone, pubSchema, websiteSchema } from '#lib/schema.ts';
	import { DEFAULT_IMAGE } from '#lib/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { hero, story, highlights, locationImage } = $derived(data.homepage);
	const phoneHref = $derived(`tel:${internationalPhone(data.settings.phone)}`);
</script>

<Seo
	documentTitle="Archa Pub – pub v centre Prešova, otvorené do rána"
	description={data.settings.description}
	jsonLd={[
		pubSchema(data.settings, data.hours, data.socials, DEFAULT_IMAGE),
		websiteSchema(data.settings)
	]}
/>

<div class="wrapper">
	<section class="grid gap-4 lg:grid-cols-12" aria-labelledby="hero-heading">
		<div class="card isolate min-h-[560px] justify-end p-6 sm:p-10 lg:col-span-8 lg:min-h-[640px]">
			<Img
				src={hero.image}
				alt=""
				priority
				sizes="(min-width: 1200px) 800px, (min-width: 1024px) 66vw, 100vw"
				class="absolute inset-0 -z-10 size-full object-cover object-[50%_40%]"
			/>
			<div
				class="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/5"
				aria-hidden="true"
			></div>

			<div class="relative flex flex-col gap-5">
				<div class="flex flex-wrap items-center gap-3">
					{#if hero.tag}
						<p class="tag bg-archa-gold text-black">
							<IconMapPin aria-hidden="true" />
							{hero.tag}
						</p>
					{/if}
					<OpenStatus hours={data.hours} class="lg:hidden" />
				</div>
				<h1 id="hero-heading" class="heading-xl max-w-2xl text-balance drop-shadow-lg md:text-7xl">
					{hero.title}
				</h1>
				{#if hero.subtitle}
					<p class="max-w-xl text-lg leading-relaxed text-white/85">{hero.subtitle}</p>
				{/if}
				<div class="flex flex-wrap gap-3 pt-2">
					<a href="/rezervacia" class="btn btn-gold text-base">Rezervovať stôl</a>
					<a href="/menu" class="btn btn-dark text-base">Pozrieť menu</a>
				</div>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
			<section class="card bg-archa-dark" aria-labelledby="hours-heading">
				<h2 id="hours-heading" class="eyebrow mb-2">
					<IconClock aria-hidden="true" /> Otváracie hodiny
				</h2>
				<OpenStatus hours={data.hours} class="mb-2 max-lg:hidden" />
				<HoursList hours={data.hours} />
			</section>

			<section class="card isolate min-h-64 justify-end" aria-labelledby="location-heading">
				{#if locationImage}
					<Img
						src={locationImage}
						alt=""
						sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
						class="absolute inset-0 -z-10 size-full object-cover"
					/>
				{/if}
				<div
					class="absolute inset-0 -z-10 bg-gradient-to-t from-archa-green via-archa-green/85 to-archa-green/40"
					aria-hidden="true"
				></div>
				<h2 id="location-heading" class="eyebrow mb-3 text-archa-beige">
					<IconMapPin aria-hidden="true" /> Kde nás nájdete
				</h2>
				<p class="font-head text-3xl uppercase">{data.settings.street}</p>
				<p class="text-white/85">{data.settings.postalCode} {data.settings.city}</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<a
						href={data.settings.mapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-light"
					>
						<IconNavigationArrow aria-hidden="true" /> Navigovať
					</a>
					<a href={phoneHref} class="btn btn-dark">
						<IconPhone aria-hidden="true" /> Zavolať
					</a>
				</div>
			</section>
		</div>
	</section>
</div>

<div class="my-16">
	<Marquee items={highlights} />
</div>

<div class="wrapper flex flex-col gap-24">
	<section
		class="reveal grid items-center gap-8 md:grid-cols-2 lg:gap-16"
		aria-labelledby="story-heading"
	>
		{#if story.image}
			<div class="relative">
				<Img
					src={story.image}
					alt="Bar a kreslá pri krbe pod kamennou klenbou"
					sizes="(min-width: 768px) 560px, 100vw"
					class="aspect-[4/5] w-full rounded-3xl border border-white/10 object-cover"
				/>
				<div
					class="absolute -right-3 -bottom-3 -z-10 size-full rounded-3xl border-2 border-archa-gold/40"
					aria-hidden="true"
				></div>
			</div>
		{/if}
		<div class="flex flex-col gap-6 {story.image ? '' : 'md:col-span-2'}">
			<IconQuotes class="text-5xl text-archa-gold" aria-hidden="true" />
			<h2 id="story-heading" class="heading-xl text-balance">{story.title}</h2>
			<p class="text-xl leading-relaxed text-white/80">{story.text}</p>
			<div class="flex flex-wrap gap-3">
				<a href="/rezervacia" class="btn btn-gold">Rezervovať stôl</a>
				<a href="#priestory" class="btn btn-dark">Pozrieť priestory</a>
			</div>
		</div>
	</section>

	{#if data.gallery.length > 0}
		<section id="priestory" class="reveal" aria-labelledby="gallery-heading">
			<div class="mb-6">
				<p class="eyebrow mb-2"><IconCamera aria-hidden="true" /> Priestory</p>
				<h2 id="gallery-heading" class="heading-lg">Pod klenbou na Hlavnej</h2>
			</div>
			<Gallery items={data.gallery} />
		</section>
	{/if}

	{#if data.homepage.games.title}
		<FeatureBlock
			title={data.homepage.games.title}
			text={data.homepage.games.text}
			image={data.homepage.games.image}
			imageAlt="Herňa so stolným futbalom a šípkami"
		>
			{#snippet eyebrow()}<IconTarget aria-hidden="true" /> Herňa{/snippet}
		</FeatureBlock>
	{/if}

	<section class="reveal" aria-labelledby="events-heading">
		<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
			<div>
				<p class="eyebrow mb-2"><IconCalendarBlank aria-hidden="true" /> Program</p>
				<h2 id="events-heading" class="heading-lg">Čo sa u nás chystá</h2>
			</div>
			<a
				href="/events"
				class="flex items-center gap-2 text-sm font-bold tracking-widest text-archa-gold uppercase hover:text-white"
			>
				Celý program <IconArrowRight aria-hidden="true" />
			</a>
		</div>

		{#if data.events.length > 0}
			<ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.events as event (event.slug)}
					<li><EventCard {event} /></li>
				{/each}
			</ul>
		{:else}
			<div class="card items-center bg-archa-dark py-12 text-center">
				<IconCalendarBlank class="mb-4 text-5xl text-white/25" aria-hidden="true" />
				<p class="font-head text-2xl uppercase">Zatiaľ nie je nič v pláne</p>
				<p class="mt-2 max-w-md text-sm text-white/70">
					Nové akcie oznamujeme aj na sociálnych sieťach. Medzitým sa zastavte len tak na pivo.
				</p>
			</div>
		{/if}
	</section>

	<section class="reveal grid gap-4 md:grid-cols-2" aria-label="Z menu">
		<div class="card bg-archa-green">
			<h2 class="eyebrow mb-4 text-archa-beige/80">
				<IconWine aria-hidden="true" /> Najobľúbenejšie nápoje
			</h2>
			<ul class="flex-1">
				{#each data.bestsellers.drinks as drink (drink.name + drink.volume)}
					<li class="list-row border-white/20">
						<span>
							{drink.name}
							{#if drink.volume}<span class="ml-1 text-sm text-white/65"
									>{formatVolume(drink.volume)}</span
								>{/if}
						</span>
						<span class="font-bold whitespace-nowrap text-archa-gold tabular-nums"
							>{formatPrice(drink.price)}</span
						>
					</li>
				{/each}
			</ul>
			<a href="/menu" class="btn btn-light mt-6 w-full"
				>Nápojový lístok <IconArrowRight aria-hidden="true" /></a
			>
		</div>

		<div class="card bg-archa-beige text-text-dark">
			{#if data.bestsellers.foodImage}
				<Img
					src={data.bestsellers.foodImage}
					alt=""
					sizes="(min-width: 768px) 560px, 100vw"
					class="mb-5 h-48 w-full rounded-xl object-cover"
				/>
			{/if}
			<h2 class="eyebrow mb-4 text-archa-green"><IconStar aria-hidden="true" /> K pivu</h2>
			<ul class="flex-1">
				{#each data.bestsellers.food as item (item.name)}
					<li class="list-row border-black/10">
						<span>
							<span class="font-head text-lg uppercase">{item.name}</span>
							{#if item.weight}<span class="ml-1 text-sm text-black/60">{item.weight}</span>{/if}
							{#if item.desc}<span class="block text-sm text-black/70">{item.desc}</span>{/if}
						</span>
						<span class="font-bold whitespace-nowrap text-archa-green tabular-nums"
							>{formatPrice(item.price)}</span
						>
					</li>
				{/each}
			</ul>
			<a href="/menu#jedlo" class="btn btn-green mt-6 w-full"
				>Celé menu <IconArrowRight aria-hidden="true" /></a
			>
		</div>
	</section>

	{#if data.latestPost}
		<section class="reveal" aria-labelledby="blog-heading">
			<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow mb-2"><IconNewspaper aria-hidden="true" /> Blog</p>
					<h2 id="blog-heading" class="heading-lg">Z nášho blogu</h2>
				</div>
				<a
					href="/blog"
					class="flex items-center gap-2 text-sm font-bold tracking-widest text-archa-gold uppercase hover:text-white"
				>
					Všetky články <IconArrowRight aria-hidden="true" />
				</a>
			</div>
			<PostCard post={data.latestPost} featured headingLevel={3} />
		</section>
	{/if}

	<Faq settings={data.settings} hours={data.hours} drinks={data.drinks} locale="sk" />

	{#if data.gallery[1]}
		<section
			class="reveal card isolate items-center gap-6 py-16 text-center sm:py-24"
			aria-labelledby="cta-heading"
		>
			<Img
				src={data.gallery[1].image}
				alt=""
				sizes="(min-width: 1200px) 1200px, 100vw"
				class="absolute inset-0 -z-10 size-full object-cover object-[50%_45%]"
			/>
			<div class="absolute inset-0 -z-10 bg-black/70" aria-hidden="true"></div>
			<h2 id="cta-heading" class="heading-xl max-w-2xl text-balance">Stôl na dnešný večer?</h2>
			<p class="max-w-md text-lg text-white/85">
				Rezervujte si online alebo zavolajte, podržíme vám miesto.
			</p>
			<div class="flex flex-wrap justify-center gap-3">
				<a href="/rezervacia" class="btn btn-gold text-base">Rezervovať stôl</a>
				<a href={phoneHref} class="btn btn-dark text-base">
					<IconPhone aria-hidden="true" />
					{data.settings.phone}
				</a>
			</div>
		</section>
	{/if}
</div>
