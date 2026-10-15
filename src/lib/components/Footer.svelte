<script lang="ts">
	import IconEnvelope from '~icons/ph/envelope';
	import IconMapPin from '~icons/ph/map-pin';
	import IconPhone from '~icons/ph/phone';
	import { page } from '$app/state';
	import { localeOf, ui } from '#lib/i18n.ts';
	import { internationalPhone } from '#lib/schema.ts';
	import type { HoursEntry, Settings, Social } from '#lib/types.ts';
	import HoursList from './HoursList.svelte';
	import SocialLinks from './SocialLinks.svelte';

	let { settings, hours, socials }: { settings: Settings; hours: HoursEntry[]; socials: Social[] } =
		$props();

	const locale = $derived(localeOf(page.url.pathname));
	const t = $derived(ui[locale]);
	const description = $derived(
		locale === 'en' ? settings.descriptionEn || settings.description : settings.description
	);
	const links = $derived(
		locale === 'en'
			? [
					{ href: '/en', label: t.home },
					{ href: '/en/menu', label: t.menu },
					{ href: '/en/reservation', label: t.reservation },
					{ href: '/', label: 'Slovensky' }
				]
			: [
					{ href: '/menu', label: t.menu },
					{ href: '/events', label: t.events },
					{ href: '/archive', label: t.archive },
					{ href: '/blog', label: t.blog },
					{ href: '/rezervacia', label: t.reservation },
					{ href: '/en', label: 'English' }
				]
	);
</script>

<footer class="mt-16 border-t border-white/10 bg-archa-dark/80">
	<div class="wrapper grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
		<div class="flex flex-col gap-4">
			<p class="font-head text-3xl text-archa-beige uppercase">{settings.name}</p>
			<p class="text-sm leading-relaxed text-white/70">{description}</p>
			<SocialLinks {socials} />
		</div>

		<nav aria-labelledby="footer-nav">
			<h2 id="footer-nav" class="eyebrow mb-4">{t.navigation}</h2>
			<ul class="flex flex-col gap-2 text-white/80">
				{#each links as link (link.href)}
					<li><a href={link.href} class="hover:text-archa-gold">{link.label}</a></li>
				{/each}
			</ul>
		</nav>

		<section aria-labelledby="footer-hours">
			<h2 id="footer-hours" class="eyebrow mb-2">{t.openingHours}</h2>
			<div class="text-sm"><HoursList {hours} /></div>
		</section>

		<section aria-labelledby="footer-contact">
			<h2 id="footer-contact" class="eyebrow mb-4">{t.contact}</h2>
			<address class="flex flex-col gap-3 text-sm text-white/80 not-italic">
				<a
					href={settings.mapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="flex gap-2 hover:text-archa-gold"
				>
					<IconMapPin class="mt-0.5 shrink-0 text-archa-gold" aria-hidden="true" />
					<span>{settings.street}<br />{settings.postalCode} {settings.city}</span>
				</a>
				<a
					href="tel:{internationalPhone(settings.phone)}"
					class="flex items-center gap-2 hover:text-archa-gold"
				>
					<IconPhone class="shrink-0 text-archa-gold" aria-hidden="true" />
					{settings.phone}
				</a>
				<a href="mailto:{settings.email}" class="flex items-center gap-2 hover:text-archa-gold">
					<IconEnvelope class="shrink-0 text-archa-gold" aria-hidden="true" />
					{settings.email}
				</a>
			</address>
		</section>
	</div>

	<div class="border-t border-white/5">
		<div
			class="wrapper flex flex-col gap-3 py-6 text-xs text-white/55 md:flex-row md:items-end md:justify-between"
		>
			<div class="flex flex-col gap-0.5">
				<p class="font-semibold text-white/70">{settings.company.name}</p>
				<p>
					{settings.company.address} · IČO: {settings.company.ico} · DIČ: {settings.company.dic}
				</p>
				<p>{settings.company.register}</p>
			</div>
			<p class="flex gap-4">
				<a href="/ochrana-sukromia" class="hover:text-white">{t.privacy}</a>
				<span>© {new Date().getFullYear()} {settings.name}</span>
			</p>
		</div>
	</div>
</footer>
