<script lang="ts">
	import IconInfo from '~icons/ph/info';
	import IconWarning from '~icons/ph/warning-octagon';
	import type { Notice } from '#lib/types.ts';

	let { notices }: { notices: Notice[] } = $props();
</script>

{#if notices.length > 0}
	<section aria-label="Oznamy" class="flex flex-col">
		{#each notices as notice, index (index)}
			{@const Icon = notice.urgent ? IconWarning : IconInfo}
			<p
				class="flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium {notice.urgent
					? 'bg-red-900/60 text-red-50'
					: 'bg-archa-green text-archa-beige'}"
			>
				<Icon class="shrink-0 text-lg" aria-hidden="true" />
				<span>
					<span class="sr-only">{notice.urgent ? 'Dôležité upozornenie:' : 'Oznam:'}</span>
					{notice.text}
				</span>
			</p>
		{/each}
	</section>
{/if}
