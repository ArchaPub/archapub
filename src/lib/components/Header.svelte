<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import IconList from '~icons/ph/list';
	import IconPhone from '~icons/ph/phone';
	import IconTranslate from '~icons/ph/translate';
	import IconX from '~icons/ph/x';
	import { alternatePath, localeOf, ui } from '#lib/i18n.ts';
	import { internationalPhone } from '#lib/schema.ts';
	import type { HoursEntry, Settings, Social } from '#lib/types.ts';
	import OpenStatus from './OpenStatus.svelte';
	import SocialLinks from './SocialLinks.svelte';

	interface Props {
		settings: Settings;
		hours: HoursEntry[];
		socials: Social[];
	}

	let { settings, hours, socials }: Props = $props();

	const locale = $derived(localeOf(page.url.pathname));
	const t = $derived(ui[locale]);
	const homeHref = $derived(locale === 'en' ? '/en' : '/');
	const reservationHref = $derived(locale === 'en' ? '/en/reservation' : '/rezervacia');
	const otherLocale = $derived(locale === 'en' ? 'sk' : 'en');
	const switchHref = $derived(
		alternatePath(page.url.pathname, otherLocale) ?? (otherLocale === 'en' ? '/en' : '/')
	);

	const links = $derived(
		locale === 'en'
			? [{ href: '/en/menu', label: t.menu }]
			: [
					{ href: '/menu', label: t.menu },
					{ href: '/events', label: t.events },
					{ href: '/blog', label: t.blog }
				]
	);
	const mobileLinks = $derived(
		locale === 'en'
			? [{ href: '/en', label: t.home }, ...links]
			: [{ href: '/', label: t.home }, ...links, { href: '/archive', label: t.archive }]
	);

	let dialog: HTMLDialogElement | undefined = $state();
	let menuOpen = $state(false);

	const isCurrent = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

	function openMenu() {
		dialog?.showModal();
		menuOpen = true;
	}

	afterNavigate(() => dialog?.close());
</script>

{#snippet languageSwitch(className: string)}
	<a
		href={switchHref}
		hreflang={otherLocale}
		lang={otherLocale}
		aria-label={t.languageSwitchLabel}
		class="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors hover:border-archa-gold hover:text-archa-gold {className}"
	>
		<IconTranslate aria-hidden="true" />
		{otherLocale}
	</a>
{/snippet}

<header
	class="sticky top-0 z-40 border-b border-white/5 bg-archa-bg/85 backdrop-blur-xl supports-[backdrop-filter]:bg-archa-bg/70"
>
	<div class="wrapper flex h-(--header-height) items-center justify-between gap-4">
		<a href={homeHref} class="flex shrink-0 items-center gap-3 rounded-lg">
			<img src="/logo.svg" alt="" width="56" height="56" class="size-14" />
			<span class="sr-only">{settings.name} – {t.homeLink}</span>
		</a>

		<nav aria-label={t.mainNav} class="hidden md:block">
			<ul class="flex items-center gap-1">
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							aria-current={isCurrent(link.href) ? 'page' : undefined}
							class="rounded-full px-4 py-2 font-head text-lg tracking-wide uppercase transition-colors hover:text-archa-gold aria-[current=page]:text-archa-gold"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="flex items-center gap-3">
			<OpenStatus {hours} class="hidden lg:flex" />
			{@render languageSwitch('hidden md:flex')}
			<a href={reservationHref} class="btn btn-gold hidden md:inline-flex">{t.bookTable}</a>
			<button
				type="button"
				class="flex size-11 items-center justify-center rounded-full border border-white/10 text-2xl md:hidden"
				aria-haspopup="dialog"
				aria-expanded={menuOpen}
				aria-controls="mobile-menu"
				onclick={openMenu}
			>
				<IconList aria-hidden="true" />
				<span class="sr-only">{t.openMenu}</span>
			</button>
		</div>
	</div>
</header>

<dialog
	bind:this={dialog}
	id="mobile-menu"
	aria-label={t.navigation}
	class="m-0 h-dvh max-h-none w-full max-w-none bg-archa-bg p-0 text-white backdrop:bg-black/70 open:flex"
	onclose={() => (menuOpen = false)}
>
	<div class="wrapper flex flex-1 flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]">
		<div class="flex h-(--header-height) items-center justify-between">
			<img src="/logo.svg" alt="" width="56" height="56" class="size-14" />
			<div class="flex items-center gap-3">
				{@render languageSwitch('')}
				<button
					type="button"
					class="flex size-11 items-center justify-center rounded-full border border-white/10 text-2xl"
					onclick={() => dialog?.close()}
				>
					<IconX aria-hidden="true" />
					<span class="sr-only">{t.closeMenu}</span>
				</button>
			</div>
		</div>

		<nav aria-label={t.mobileNav} class="mt-8">
			<ul class="flex flex-col gap-2">
				{#each mobileLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							aria-current={page.url.pathname === link.href ? 'page' : undefined}
							class="block py-2 font-head text-4xl uppercase aria-[current=page]:text-archa-gold"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="mt-auto flex flex-col gap-4 pt-8">
			<OpenStatus {hours} />
			<a href={reservationHref} class="btn btn-gold w-full text-base">{t.bookTable}</a>
			<a href="tel:{internationalPhone(settings.phone)}" class="btn btn-dark w-full text-base">
				<IconPhone aria-hidden="true" />
				{settings.phone}
			</a>
			<SocialLinks {socials} class="justify-center pt-2" />
		</div>
	</div>
</dialog>
