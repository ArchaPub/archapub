<script lang="ts">
	import IconArrowLeft from '~icons/ph/arrow-left';
	import IconArrowRight from '~icons/ph/arrow-right';
	import IconArrowsOut from '~icons/ph/arrows-out';
	import IconX from '~icons/ph/x';
	import { page } from '$app/state';
	import { localeOf } from '#lib/i18n.ts';
	import type { GalleryItem } from '#lib/types.ts';
	import Img from './Img.svelte';

	let { items }: { items: GalleryItem[] } = $props();

	// Six tiles fill a 4×3 grid exactly on desktop; the pattern repeats for more photos
	const TILE_CLASSES = [
		'col-span-2 row-span-2',
		'',
		'',
		'md:row-span-2',
		'md:row-span-2',
		'col-span-2'
	];

	const en = $derived(localeOf(page.url.pathname) === 'en');
	const t = $derived(
		en
			? {
					enlarge: 'enlarge photo',
					gallery: 'Gallery',
					close: 'Close',
					prev: 'Previous photo',
					next: 'Next photo'
				}
			: {
					enlarge: 'zväčšiť fotku',
					gallery: 'Galéria',
					close: 'Zavrieť',
					prev: 'Predchádzajúca fotka',
					next: 'Ďalšia fotka'
				}
	);
	const captionOf = (item: GalleryItem) => (en && item.captionEn) || item.caption;

	let dialog: HTMLDialogElement | undefined = $state();
	let current = $state(0);
	const active = $derived(items[current]);

	function open(index: number) {
		current = index;
		dialog?.showModal();
	}

	const step = (delta: number) => (current = (current + delta + items.length) % items.length);

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') step(1);
		else if (event.key === 'ArrowLeft') step(-1);
	}
</script>

<ul
	class="grid grid-flow-dense auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4"
>
	{#each items as item, index (item.image)}
		<li class={TILE_CLASSES[index % TILE_CLASSES.length]}>
			<button
				type="button"
				class="group relative block size-full overflow-hidden rounded-2xl border border-white/10"
				onclick={() => open(index)}
			>
				<Img
					src={item.image}
					alt=""
					sizes={index === 0 ? '(min-width: 768px) 600px, 100vw' : '(min-width: 768px) 300px, 50vw'}
					class="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
				/>
				<span
					class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/85 to-transparent p-4 pt-12 text-left text-sm font-semibold"
				>
					{captionOf(item)}
					<IconArrowsOut
						class="shrink-0 text-lg opacity-0 transition-opacity group-hover:opacity-100"
						aria-hidden="true"
					/>
				</span>
				<span class="sr-only">– {t.enlarge}</span>
			</button>
		</li>
	{/each}
</ul>

<dialog
	bind:this={dialog}
	aria-label={t.gallery}
	class="m-0 h-dvh max-h-none w-full max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80 open:flex"
	{onkeydown}
	onclick={(event) => {
		// Clicking the backdrop area (not the photo or controls) closes the viewer
		if (event.target === event.currentTarget) dialog?.close();
	}}
>
	{#if active}
		<figure
			class="pointer-events-none flex flex-1 flex-col items-center justify-center gap-4 p-4 pt-16 pb-24"
		>
			<Img
				src={active.image}
				alt={captionOf(active)}
				sizes="100vw"
				class="pointer-events-auto max-h-full w-auto max-w-full rounded-xl object-contain"
			/>
			<figcaption class="text-center text-white/85">
				{captionOf(active)}
				<span class="ml-2 text-white/50 tabular-nums">{current + 1} / {items.length}</span>
			</figcaption>
		</figure>
	{/if}
	<button
		type="button"
		class="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20"
		onclick={() => dialog?.close()}
	>
		<IconX aria-hidden="true" /><span class="sr-only">{t.close}</span>
	</button>
	<div class="absolute inset-x-0 bottom-6 flex justify-center gap-3">
		<button
			type="button"
			class="flex size-12 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20"
			onclick={() => step(-1)}
		>
			<IconArrowLeft aria-hidden="true" /><span class="sr-only">{t.prev}</span>
		</button>
		<button
			type="button"
			class="flex size-12 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20"
			onclick={() => step(1)}
		>
			<IconArrowRight aria-hidden="true" /><span class="sr-only">{t.next}</span>
		</button>
	</div>
</dialog>
