<script lang="ts">
	import { page } from '$app/state';
	import { localeOf, ui } from '#lib/i18n.ts';
	import { iconFor } from '#lib/icons.ts';
	import type { Social } from '#lib/types.ts';

	let { socials, class: className = '' }: { socials: Social[]; class?: string } = $props();

	const t = $derived(ui[localeOf(page.url.pathname)]);
</script>

<ul class="flex gap-2 {className}">
	{#each socials as social (social.url)}
		{@const Icon = iconFor(social.icon)}
		<li>
			<a
				href={social.url}
				target="_blank"
				rel="noopener noreferrer"
				class="flex size-11 items-center justify-center rounded-full border border-white/10 text-xl text-white/70 transition hover:border-archa-gold/50 hover:text-archa-gold"
			>
				<Icon aria-hidden="true" />
				<span class="sr-only">{social.name || social.icon} ({t.opensInNewWindow})</span>
			</a>
		</li>
	{/each}
</ul>
