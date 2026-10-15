<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import IconBeerBottle from '~icons/ph/beer-bottle';
	import IconBeerStein from '~icons/ph/beer-stein';
	import IconBowlFood from '~icons/ph/bowl-food';
	import IconBrandy from '~icons/ph/brandy';
	import IconCoffee from '~icons/ph/coffee';
	import IconFire from '~icons/ph/fire';
	import IconForkKnife from '~icons/ph/fork-knife';
	import IconHamburger from '~icons/ph/hamburger';
	import IconMagnifyingGlass from '~icons/ph/magnifying-glass';
	import IconMartini from '~icons/ph/martini';
	import IconPintGlass from '~icons/ph/pint-glass';
	import IconPopcorn from '~icons/ph/popcorn';
	import IconWarningCircle from '~icons/ph/warning-circle';
	import IconWine from '~icons/ph/wine';
	import IconX from '~icons/ph/x';
	import { ALLERGENS_EN, badgeName, categoryName, type Locale } from '#lib/i18n.ts';
	import {
		formatPrice,
		formatVolume,
		groupByCategory,
		groupDrinkVariants,
		matchesDrink,
		matchesFood,
		searchable,
		type DrinkGroup
	} from '#lib/menu.ts';
	import type { Allergen, DrinkItem, FoodItem, MenuInfo } from '#lib/types.ts';
	import Img from './Img.svelte';

	interface Props {
		food: FoodItem[];
		drinks: DrinkItem[];
		allergens: Allergen[];
		menuInfo: MenuInfo;
		locale: Locale;
	}

	let { food, drinks, allergens, menuInfo, locale }: Props = $props();

	const STRINGS = {
		sk: {
			eyebrow: 'Jedlo & nápoje',
			lead: 'Ceny sú uvedené vrátane DPH.',
			searchLabel: 'Hľadať v menu',
			searchPlaceholder: 'Hľadať, napr. Šariš',
			clearSearch: 'Vymazať hľadanie',
			results: (query: string, count: number) => `Výsledky pre „${query}“: ${count}`,
			viewLabel: 'Zobraziť',
			drinks: 'Nápoje',
			food: 'Jedlo',
			categories: 'Kategórie menu',
			onTap: 'Na čape',
			onTapLead: 'Čerstvo načapované priamo z výčapu.',
			drinkList: 'Nápojový lístok',
			allergensLabel: 'Alergény:',
			allergensTitle: 'Zoznam alergénov',
			allergensNote: 'Informácie o alergénoch vám radi poskytneme aj pri bare.',
			nothingFound: 'Nič sme nenašli',
			tryAgain: 'Skúste iný výraz alebo si pozrite celé menu.',
			showAll: 'Zobraziť celé menu',
			kitchen: 'Kuchyňa'
		},
		en: {
			eyebrow: 'Food & drinks',
			lead: 'Prices include VAT. Item names are in Slovak.',
			searchLabel: 'Search the menu',
			searchPlaceholder: 'Search, e.g. Pilsner',
			clearSearch: 'Clear search',
			results: (query: string, count: number) => `Results for “${query}”: ${count}`,
			viewLabel: 'Show',
			drinks: 'Drinks',
			food: 'Food',
			categories: 'Menu categories',
			onTap: 'On tap',
			onTapLead: 'Freshly poured straight from the tap.',
			drinkList: 'Drinks',
			allergensLabel: 'Allergens:',
			allergensTitle: 'Allergens',
			allergensNote: 'Ask at the bar for allergen details.',
			nothingFound: 'Nothing found',
			tryAgain: 'Try another word or see the full menu.',
			showAll: 'Show the full menu',
			kitchen: 'Kitchen'
		}
	} as const;
	const t = $derived(STRINGS[locale]);

	const CATEGORY_ICONS: Record<string, Component> = {
		Pivo: IconBeerStein,
		Vína: IconWine,
		Víno: IconWine,
		Alkohol: IconBrandy,
		Nealko: IconPintGlass,
		'Teplé nápoje': IconCoffee,
		Kokteily: IconMartini,
		Pochutiny: IconPopcorn,
		'K pivu': IconPopcorn,
		Burgre: IconHamburger
	};
	const iconFor = (category: string) => CATEGORY_ICONS[category] ?? IconForkKnife;

	const allergenName = $derived((id: number) =>
		locale === 'en' ? ALLERGENS_EN[id] : allergens.find((a) => a.id === id)?.name
	);

	const foodCategories = $derived(groupByCategory(food));
	const drinkCategories = $derived(
		groupByCategory(drinks).map(([name, items]) => [name, groupDrinkVariants(items)] as const)
	);
	const tapGroups = $derived(drinkCategories.flatMap(([, groups]) => groups.filter((g) => g.tap)));

	let query = $state('');
	const normalizedQuery = $derived(searchable(query.trim()));
	const searching = $derived(normalizedQuery !== '');

	const matchesQuery = (text: string) => searchable(text).includes(normalizedQuery);
	const visibleFood = $derived(
		foodCategories
			.map(
				([name, items]) =>
					[
						name,
						items.filter(
							(item) =>
								matchesFood(item, normalizedQuery) || matchesQuery(categoryName(name, locale))
						)
					] as const
			)
			.filter(([, items]) => items.length > 0)
	);
	const visibleDrinks = $derived(
		drinkCategories
			.map(
				([name, groups]) =>
					[
						name,
						groups.filter(
							(group) =>
								matchesDrink(group, name, normalizedQuery) ||
								matchesQuery(categoryName(name, locale))
						)
					] as const
			)
			.filter(([, groups]) => groups.length > 0)
	);
	const resultCount = $derived(
		visibleFood.reduce((sum, [, items]) => sum + items.length, 0) +
			visibleDrinks.reduce((sum, [, groups]) => sum + groups.length, 0)
	);

	type View = 'drinks' | 'food';
	let view = $state<View>('drinks');
	const shownFood = $derived(searching || view === 'food' ? visibleFood : []);
	const shownDrinks = $derived(searching || view === 'drinks' ? visibleDrinks : []);
	const VIEWS = [
		{ id: 'drinks', Icon: IconBeerBottle },
		{ id: 'food', Icon: IconBowlFood }
	] as const;

	const FOOD_HASH = '#jedlo';
	// Links like /menu#jedlo open the food tab (the page is prerendered, so this runs client-side)
	onMount(() => {
		if (location.hash === FOOD_HASH) view = 'food';
	});

	function showView(next: View) {
		view = next;
		activeSection = '';
		history.replaceState(history.state, '', next === 'food' ? FOOD_HASH : location.pathname);
	}

	const slug = (name: string) => `kategoria-${searchable(name).replace(/[^a-z0-9]+/g, '-')}`;

	let activeSection = $state('');

	// Scroll-spy for the category chips
	$effect(() => {
		void shownFood;
		void shownDrinks;
		const sections = document.querySelectorAll<HTMLElement>('[data-menu-section]');
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting);
				if (visible.length > 0) activeSection = visible[0].target.id;
				else if (sections[0] && sections[0].getBoundingClientRect().top > innerHeight * 0.35)
					activeSection = '';
			},
			{ rootMargin: '-35% 0px -60% 0px' }
		);
		sections.forEach((section) => observer.observe(section));
		return () => observer.disconnect();
	});

	// Keep the active chip in view on narrow screens
	$effect(() => {
		if (!activeSection) return;
		document
			.querySelector(`[data-chip="${activeSection}"]`)
			?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
	});
</script>

{#snippet badge(text: string, dark = false)}
	{#if text}
		<span
			class="tag shrink-0 px-2 py-0.5 text-[10px] {dark
				? 'bg-archa-green text-white'
				: 'bg-archa-gold text-black'}">{badgeName(text, locale)}</span
		>
	{/if}
{/snippet}

{#snippet prices(group: DrinkGroup)}
	<span class="flex shrink-0 flex-col items-end tabular-nums">
		{#each group.variants as variant (variant.volume + variant.price)}
			<span class="grid grid-cols-[3.5rem_4.5rem] items-baseline text-right">
				<span class="text-sm text-white/65">{formatVolume(variant.volume)}</span>
				<span class="font-bold text-archa-gold">{formatPrice(variant.price)}</span>
			</span>
		{/each}
	</span>
{/snippet}

<div class="wrapper">
	<header class="card isolate mb-6 min-h-72 justify-end gap-6 p-6 sm:min-h-80 sm:p-10">
		{#if menuInfo.heroImage}
			<Img
				src={menuInfo.heroImage}
				alt=""
				priority
				sizes="(min-width: 1200px) 1200px, 100vw"
				class="absolute inset-0 -z-10 size-full object-cover object-[50%_55%]"
			/>
		{/if}
		<div
			class="absolute inset-0 -z-10 bg-gradient-to-t from-archa-bg via-archa-bg/70 to-archa-bg/20"
			aria-hidden="true"
		></div>
		<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
			<div>
				<p class="eyebrow mb-3">{t.eyebrow}</p>
				<h1 class="font-head text-7xl leading-none uppercase drop-shadow-lg sm:text-8xl">Menu</h1>
				<p class="mt-3 text-white/75">{t.lead}</p>
			</div>
			<search class="w-full md:w-96">
				<label for="menu-search" class="sr-only">{t.searchLabel}</label>
				<div class="relative">
					<IconMagnifyingGlass
						class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg text-white/50"
						aria-hidden="true"
					/>
					<input
						id="menu-search"
						type="search"
						bind:value={query}
						placeholder={t.searchPlaceholder}
						autocomplete="off"
						class="field border-white/25 bg-black/50 pr-12 pl-11 backdrop-blur-md [&::-webkit-search-cancel-button]:hidden"
					/>
					{#if query}
						<button
							type="button"
							class="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
							onclick={() => (query = '')}
						>
							<IconX aria-hidden="true" />
							<span class="sr-only">{t.clearSearch}</span>
						</button>
					{/if}
				</div>
			</search>
		</div>
	</header>

	<nav
		aria-label={t.categories}
		class="sticky top-(--header-height) z-30 -mx-4 mb-10 flex items-center gap-3 border-b border-white/5 bg-archa-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-5 sm:px-5"
	>
		{#if searching}
			<p class="shrink-0 text-sm text-white/70" aria-live="polite">
				{t.results(query.trim(), resultCount)}
			</p>
		{:else if food.length > 0}
			<div
				role="group"
				aria-label={t.viewLabel}
				class="flex shrink-0 rounded-full border border-white/15 p-1"
			>
				{#each VIEWS as option (option.id)}
					<button
						type="button"
						aria-pressed={view === option.id}
						class="flex min-h-10 items-center gap-2 rounded-full px-3 font-head text-lg tracking-wide uppercase transition-colors aria-pressed:bg-archa-gold aria-pressed:text-black sm:px-5"
						onclick={() => showView(option.id)}
					>
						<option.Icon aria-hidden="true" />
						{t[option.id]}
					</button>
				{/each}
			</div>
		{/if}
		{#if shownFood.length + shownDrinks.length > 1}
			<span class="h-8 w-px shrink-0 bg-white/15 max-sm:hidden" aria-hidden="true"></span>
			<ul
				class="flex min-w-0 snap-x [scrollbar-width:none] gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,black_85%,transparent)] max-sm:hidden [&::-webkit-scrollbar]:hidden"
			>
				{#each [...shownDrinks, ...shownFood] as [name] (name)}
					<li class="shrink-0 snap-start">
						<a
							href="#{slug(name)}"
							data-chip={slug(name)}
							aria-current={activeSection === slug(name) ? 'true' : undefined}
							class="flex min-h-9 items-center rounded-full border border-white/15 bg-archa-dark px-4 text-sm font-semibold whitespace-nowrap transition-colors hover:border-archa-gold aria-[current=true]:border-archa-gold aria-[current=true]:bg-archa-gold/15 aria-[current=true]:text-archa-gold"
						>
							{categoryName(name, locale)}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</nav>

	{#if resultCount === 0}
		<div class="card items-center bg-archa-dark py-16 text-center">
			<IconMagnifyingGlass class="mb-4 text-5xl text-white/25" aria-hidden="true" />
			<p class="font-head text-2xl uppercase">{t.nothingFound}</p>
			<p class="mt-2 text-white/70">{t.tryAgain}</p>
			<button type="button" class="btn btn-gold mt-6" onclick={() => (query = '')}>
				{t.showAll}
			</button>
		</div>
	{/if}

	{#if !searching && view === 'drinks' && tapGroups.length > 0}
		<section
			class="relative isolate mb-16 overflow-hidden rounded-3xl border border-archa-gold/25 p-6 shadow-2xl shadow-black/40 sm:p-10"
			aria-labelledby="na-cape"
		>
			{#if menuInfo.tapImage}
				<Img
					src={menuInfo.tapImage}
					alt=""
					sizes="(min-width: 1200px) 1200px, 100vw"
					class="absolute inset-0 -z-10 size-full object-cover object-[70%_60%]"
				/>
			{/if}
			<div
				class="absolute inset-0 -z-10 bg-gradient-to-r from-archa-bg via-archa-bg/90 to-archa-bg/60"
				aria-hidden="true"
			></div>
			<div class="relative mb-8 flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow mb-2"><IconBeerStein aria-hidden="true" /> {t.onTap}</p>
					<h2 id="na-cape" class="heading-lg">{t.onTapLead}</h2>
				</div>
			</div>
			<ul class="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each tapGroups as group (group.name)}
					<li
						class="flex flex-col gap-4 rounded-2xl border border-white/15 bg-black/45 p-5 backdrop-blur-md transition-colors hover:border-archa-gold/50"
					>
						<div class="flex items-start justify-between gap-2">
							<p class="font-head text-2xl leading-tight uppercase">{group.name}</p>
							{@render badge(group.badge)}
						</div>
						<dl class="mt-auto flex flex-col gap-1">
							{#each group.variants as variant (variant.volume + variant.price)}
								<div class="flex items-baseline justify-between gap-3 tabular-nums">
									<dt class="text-sm text-white/60">{formatVolume(variant.volume)}</dt>
									<dd class="font-head text-3xl text-archa-gold">{formatPrice(variant.price)}</dd>
								</div>
							{/each}
						</dl>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if shownDrinks.length > 0}
		<section aria-labelledby="napoje" class="mb-16">
			<h2 id="napoje" class="sr-only">{t.drinkList}</h2>
			<div class="gap-6 lg:columns-2">
				{#each shownDrinks as [name, groups] (name)}
					{@const Icon = iconFor(name)}
					<section
						id={slug(name)}
						data-menu-section
						class="card mb-6 scroll-mt-48 break-inside-avoid bg-archa-green p-6 shadow-xl shadow-black/30 sm:p-8"
						aria-labelledby="{slug(name)}-heading"
					>
						<h3 id="{slug(name)}-heading" class="mb-4 flex items-center gap-3">
							<span
								class="flex size-11 items-center justify-center rounded-full bg-black/25 text-xl text-archa-gold"
								aria-hidden="true"><Icon /></span
							>
							<span class="font-head text-3xl text-archa-beige uppercase"
								>{categoryName(name, locale)}</span
							>
							<span class="h-px flex-1 bg-gradient-to-r from-archa-gold/40 to-transparent"></span>
						</h3>
						<ul>
							{#each groups as group (group.name)}
								<li class="flex items-baseline gap-2 border-b border-white/15 py-3 last:border-0">
									<span class="flex items-center gap-2 font-medium">
										{group.name}
										{@render badge(group.badge)}
									</span>
									<span
										class="mx-1 h-px min-w-6 flex-1 translate-y-[-0.25em] border-b border-dotted border-white/30"
										aria-hidden="true"
									></span>
									{@render prices(group)}
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>
		</section>
	{/if}

	{#if menuInfo.enabled && !searching && view === 'food'}
		<section class="mb-14 grid gap-4 lg:grid-cols-12" aria-label={t.kitchen}>
			<div class="card bg-archa-dark p-0 lg:col-span-8">
				{#if menuInfo.banner.image}
					<div class="h-56 overflow-hidden">
						<Img
							src={menuInfo.banner.image}
							alt=""
							sizes="(min-width: 1024px) 800px, 100vw"
							class="size-full object-cover"
						/>
					</div>
				{/if}
				<div class="p-6 text-center">
					<h2 class="font-head text-3xl uppercase">{menuInfo.banner.title}</h2>
					<p class="mx-auto mt-2 max-w-md text-white/75">{menuInfo.banner.text}</p>
				</div>
			</div>
			<div
				class="card items-center justify-center bg-archa-gold text-center text-archa-dark lg:col-span-4"
			>
				<IconFire class="mb-2 text-4xl" aria-hidden="true" />
				<p class="font-head text-3xl uppercase">{menuInfo.status.title}</p>
				<p class="mt-1 font-bold">{menuInfo.status.time}</p>
			</div>
		</section>
	{/if}

	{#if shownFood.length > 0}
		<section aria-labelledby="jedlo" class="mb-16">
			<h2 id="jedlo" class="sr-only">{t.food}</h2>
			<div class="gap-6 lg:columns-2">
				{#each shownFood as [name, items] (name)}
					{@const Icon = iconFor(name)}
					<section
						id={slug(name)}
						data-menu-section
						class="card mb-6 scroll-mt-48 break-inside-avoid bg-archa-dark p-6 sm:p-8"
						aria-labelledby="{slug(name)}-heading"
					>
						<h3 id="{slug(name)}-heading" class="mb-4 flex items-center gap-3">
							<span
								class="flex size-11 items-center justify-center rounded-full bg-archa-green text-xl text-archa-gold"
								aria-hidden="true"><Icon /></span
							>
							<span class="font-head text-3xl uppercase">{categoryName(name, locale)}</span>
							<span class="h-px flex-1 bg-gradient-to-r from-archa-gold/40 to-transparent"></span>
						</h3>
						<ul>
							{#each items as item (item.name)}
								<li class="border-b border-white/10 py-3 last:border-0">
									<div class="flex items-baseline gap-2">
										<span class="flex items-center gap-2 font-medium">
											{item.name}
											{@render badge(item.badge)}
										</span>
										<span
											class="mx-1 h-px min-w-6 flex-1 translate-y-[-0.25em] border-b border-dotted border-white/20"
											aria-hidden="true"
										></span>
										<span class="font-bold whitespace-nowrap text-archa-gold tabular-nums"
											>{formatPrice(item.price)}</span
										>
									</div>
									{#if item.desc}<p class="mt-1 text-sm text-white/70">{item.desc}</p>{/if}
									{#if item.weight || item.allergens.length > 0}
										<p class="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/60">
											{#if item.weight}<span>{item.weight}</span>{/if}
											{#if item.allergens.length > 0}
												<span class="sr-only">{t.allergensLabel}</span>
												{#each item.allergens as id (id)}
													<abbr
														title={allergenName(id)}
														class="flex size-5 items-center justify-center rounded-full border border-white/25 text-[10px] font-bold no-underline"
													>
														{id}
													</abbr>
												{/each}
											{/if}
										</p>
									{/if}
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>
		</section>

		{#if allergens.length > 0}
			<section class="card bg-archa-beige text-archa-dark" aria-labelledby="alergeny">
				<h2 id="alergeny" class="mb-4 flex items-center gap-2 text-xl font-bold">
					<IconWarningCircle class="text-archa-green" aria-hidden="true" />
					{t.allergensTitle}
				</h2>
				<dl class="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
					{#each allergens as allergen (allergen.id)}
						<div class="flex gap-2">
							<dt class="w-5 shrink-0 font-bold text-archa-green">{allergen.id}</dt>
							<dd>{allergenName(allergen.id) ?? allergen.name}</dd>
						</div>
					{/each}
				</dl>
				<p class="mt-4 text-sm text-black/70">{t.allergensNote}</p>
			</section>
		{/if}
	{/if}
</div>
