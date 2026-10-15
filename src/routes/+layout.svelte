<script lang="ts">
	import './layout.css';
	import clash400 from '#lib/assets/fonts/clash-display-400.woff2?url';
	import clash600 from '#lib/assets/fonts/clash-display-600.woff2?url';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="preload" href={clash400} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={clash600} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

{@render children()}
