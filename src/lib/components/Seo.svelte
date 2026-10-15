<script lang="ts">
	import { page } from '$app/state';
	import { jsonLdScript } from '#lib/schema.ts';
	import { alternatePath, localeOf } from '#lib/i18n.ts';
	import { absoluteUrl, DEFAULT_IMAGE } from '#lib/site.ts';

	interface Props {
		/** Page title without the site name; omit on the homepage. */
		title?: string;
		/** Complete <title>, for pages that need a keyword-rich one (the homepages). */
		documentTitle?: string;
		description: string;
		/** Absolute or root-relative image URL. */
		image?: string;
		type?: 'website' | 'article';
		noindex?: boolean;
		publishedTime?: string;
		jsonLd?: Record<string, unknown>[];
	}

	let {
		title,
		documentTitle,
		description,
		image,
		type = 'website',
		noindex = false,
		publishedTime,
		jsonLd = []
	}: Props = $props();

	const siteName = $derived(page.data.settings?.name ?? 'Archa Pub');
	const locale = $derived(localeOf(page.url.pathname));
	const alternates = $derived({
		sk: alternatePath(page.url.pathname, 'sk'),
		en: alternatePath(page.url.pathname, 'en')
	});
	const fullTitle = $derived(
		documentTitle ?? (title ? `${title} | ${siteName}` : `${siteName} · Prešov`)
	);
	const canonical = $derived(absoluteUrl(page.url.pathname));
	const imageUrl = $derived(absoluteUrl(image ?? DEFAULT_IMAGE));
	const trimmedDescription = $derived(
		description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={trimmedDescription} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{/if}

	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content={locale === 'en' ? 'en_GB' : 'sk_SK'} />
	{#if alternates.sk && alternates.en}
		<link rel="alternate" hreflang="sk" href={absoluteUrl(alternates.sk)} />
		<link rel="alternate" hreflang="en" href={absoluteUrl(alternates.en)} />
		<link rel="alternate" hreflang="x-default" href={absoluteUrl(alternates.sk)} />
	{/if}
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={title ?? siteName} />
	<meta property="og:description" content={trimmedDescription} />
	<meta property="og:image" content={imageUrl} />
	{#if !image}
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}
	{#if publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />

	{#if jsonLd.length > 0}
		{@html jsonLdScript(jsonLd)}
	{/if}
</svelte:head>
