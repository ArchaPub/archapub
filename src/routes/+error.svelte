<script lang="ts">
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Stránka nenájdená' : 'Chyba'} | Archa Pub</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main
	class="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-4 text-center"
>
	<a href="/"><img src="/logo.svg" alt="Archa Pub – domov" width="96" height="96" /></a>
	<p class="font-head text-8xl text-archa-gold">{page.status}</p>
	<h1 class="font-head text-3xl uppercase">
		{notFound ? 'Túto stránku sme nenašli' : 'Niečo sa pokazilo'}
	</h1>
	<p class="text-white/70">
		{notFound
			? 'Možno bola presunutá alebo akcia už prebehla.'
			: 'Skúste to prosím o chvíľu znova.'}
	</p>
	<nav aria-label="Rýchle odkazy" class="flex flex-wrap justify-center gap-3">
		<a href="/" class="btn btn-gold">Domov</a>
		<a href="/menu" class="btn btn-dark">Menu</a>
		<a href="/events" class="btn btn-dark">Program</a>
	</nav>
</main>
