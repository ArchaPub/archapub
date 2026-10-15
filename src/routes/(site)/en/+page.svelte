<script lang="ts">
	import IconCamera from '~icons/ph/camera';
	import IconClock from '~icons/ph/clock';
	import IconMapPin from '~icons/ph/map-pin';
	import IconNavigationArrow from '~icons/ph/navigation-arrow';
	import IconPhone from '~icons/ph/phone';
	import IconQuotes from '~icons/ph/quotes';
	import IconTarget from '~icons/ph/target';
	import FeatureBlock from '#lib/components/FeatureBlock.svelte';
	import Gallery from '#lib/components/Gallery.svelte';
	import HoursList from '#lib/components/HoursList.svelte';
	import Img from '#lib/components/Img.svelte';
	import Marquee from '#lib/components/Marquee.svelte';
	import OpenStatus from '#lib/components/OpenStatus.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { internationalPhone, pubSchema } from '#lib/schema.ts';
	import { DEFAULT_IMAGE } from '#lib/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { hero, story, locationImage, en } = $derived(data.homepage);
	const phoneHref = $derived(`tel:${internationalPhone(data.settings.phone)}`);
</script>

<Seo
	title="Pub in the centre of Prešov"
	description={data.settings.descriptionEn || data.settings.description}
	jsonLd={[pubSchema(data.settings, data.hours, data.socials, DEFAULT_IMAGE)]}
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
					<p class="tag bg-archa-gold text-black">
						<IconMapPin aria-hidden="true" /> Prešov city centre
					</p>
					<OpenStatus hours={data.hours} class="lg:hidden" />
				</div>
				<h1 id="hero-heading" class="heading-xl max-w-2xl text-balance drop-shadow-lg md:text-7xl">
					{en.title}
				</h1>
				<p class="max-w-xl text-lg leading-relaxed text-white/85">{en.subtitle}</p>
				<div class="flex flex-wrap gap-3 pt-2">
					<a href="/en/reservation" class="btn btn-gold text-base">Book a table</a>
					<a href="/en/menu" class="btn btn-dark text-base">See the menu</a>
				</div>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
			<section class="card bg-archa-dark" aria-labelledby="hours-heading">
				<h2 id="hours-heading" class="eyebrow mb-2">
					<IconClock aria-hidden="true" /> Opening hours
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
					<IconMapPin aria-hidden="true" /> Find us
				</h2>
				<p class="font-head text-3xl uppercase">{data.settings.street}</p>
				<p class="text-white/85">{data.settings.postalCode} {data.settings.city}, Slovakia</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<a
						href={data.settings.mapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-light"
					>
						<IconNavigationArrow aria-hidden="true" /> Directions
					</a>
					<a href={phoneHref} class="btn btn-dark"><IconPhone aria-hidden="true" /> Call</a>
				</div>
			</section>
		</div>
	</section>
</div>

<div class="my-16"><Marquee items={en.highlights} /></div>

<div class="wrapper flex flex-col gap-24">
	<section
		class="reveal grid items-center gap-8 md:grid-cols-2 lg:gap-16"
		aria-labelledby="story-heading"
	>
		{#if story.image}
			<Img
				src={story.image}
				alt="The bar and armchairs by the fireplace under the stone vault"
				sizes="(min-width: 768px) 560px, 100vw"
				class="aspect-[4/5] w-full rounded-3xl border border-white/10 object-cover"
			/>
		{/if}
		<div class="flex flex-col gap-6">
			<IconQuotes class="text-5xl text-archa-gold" aria-hidden="true" />
			<h2 id="story-heading" class="heading-xl text-balance">{en.storyTitle}</h2>
			<p class="text-xl leading-relaxed text-white/80">{en.storyText}</p>
			<div class="flex flex-wrap gap-3">
				<a href="/en/reservation" class="btn btn-gold">Book a table</a>
				<a href="#spaces" class="btn btn-dark">See inside</a>
			</div>
		</div>
	</section>

	{#if data.gallery.length > 0}
		<section id="spaces" class="reveal" aria-labelledby="gallery-heading">
			<div class="mb-6">
				<p class="eyebrow mb-2"><IconCamera aria-hidden="true" /> Inside</p>
				<h2 id="gallery-heading" class="heading-lg">Under the vault on Hlavná</h2>
			</div>
			<Gallery items={data.gallery} />
		</section>
	{/if}

	{#if data.homepage.en.gamesTitle}
		<FeatureBlock
			title={data.homepage.en.gamesTitle}
			text={data.homepage.en.gamesText}
			image={data.homepage.games.image}
			imageAlt="Games room with table football and darts"
		>
			{#snippet eyebrow()}<IconTarget aria-hidden="true" /> Games room{/snippet}
		</FeatureBlock>
	{/if}

	<section
		class="reveal card items-center gap-4 bg-archa-green py-12 text-center"
		aria-labelledby="sk-heading"
	>
		<h2 id="sk-heading" class="font-head text-3xl uppercase">Events & blog</h2>
		<p class="max-w-lg text-white/85">
			Our events programme and blog are in Slovak, but everyone is welcome: quizzes, parties and
			sports nights happen most weeks.
		</p>
		<a href="/events" class="btn btn-light" hreflang="sk">See events (in Slovak)</a>
	</section>
</div>
