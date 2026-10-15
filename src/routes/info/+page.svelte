<script lang="ts">
	import IconArrowUpRight from '~icons/ph/arrow-up-right';
	import Img from '#lib/components/Img.svelte';
	import OpenStatus from '#lib/components/OpenStatus.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import SocialLinks from '#lib/components/SocialLinks.svelte';
	import { iconFor } from '#lib/icons.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const isExternal = (url: string) => /^https?:\/\//.test(url);
</script>

<Seo title="Odkazy" description={data.settings.description} noindex />

{#if data.background}
	<div class="fixed inset-0 -z-10" aria-hidden="true">
		<Img
			src={data.background}
			alt=""
			priority
			sizes="100vw"
			class="size-full scale-110 object-cover blur-sm"
		/>
		<div
			class="absolute inset-0 bg-gradient-to-b from-archa-bg/70 via-archa-bg/85 to-archa-bg"
		></div>
	</div>
{/if}

<main class="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-6 px-4 py-12">
	<a
		href="/"
		class="flex size-32 items-center justify-center rounded-full border-2 border-archa-gold/40 bg-archa-dark/80 p-3 shadow-[0_0_40px_rgba(207,163,75,0.25)] backdrop-blur-md"
	>
		<img src="/logo.svg" alt="" width="104" height="104" />
		<span class="sr-only">{data.settings.name} – domov</span>
	</a>

	<div class="text-center">
		<h1 class="font-head text-5xl tracking-wide uppercase drop-shadow-lg">{data.settings.name}</h1>
		<p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/70">
			{data.settings.description}
		</p>
		<OpenStatus hours={data.hours} class="mt-3 justify-center" />
	</div>

	<ul class="flex w-full flex-col gap-3">
		{#each data.links as link (link.url)}
			{@const Icon = iconFor(link.icon)}
			<li>
				<a
					href={link.url}
					target={isExternal(link.url) ? '_blank' : undefined}
					rel={isExternal(link.url) ? 'noopener noreferrer' : undefined}
					class="flex min-h-16 items-center gap-4 rounded-2xl border px-5 py-3 transition duration-200 hover:-translate-y-0.5 {link.highlight
						? 'border-archa-gold bg-archa-gold text-black shadow-lg shadow-archa-gold/20'
						: 'border-white/15 bg-archa-dark/70 backdrop-blur-md hover:border-archa-gold/60 hover:bg-archa-dark/90'}"
				>
					<Icon class="shrink-0 text-2xl" aria-hidden="true" />
					<span class="flex flex-1 flex-col">
						<span class="font-bold">{link.title}</span>
						{#if link.subtitle}<span class="text-xs opacity-70">{link.subtitle}</span>{/if}
					</span>
					{#if isExternal(link.url)}<IconArrowUpRight
							class="shrink-0 opacity-60"
							aria-hidden="true"
						/>{/if}
				</a>
			</li>
		{/each}
	</ul>

	<SocialLinks socials={data.socials} class="mt-4" />
</main>
