<script lang="ts">
	let { items }: { items: string[] } = $props();
</script>

{#if items.length > 0}
	<div
		class="marquee relative overflow-hidden border-y border-archa-gold/20 bg-archa-green/40 py-4"
	>
		<p class="sr-only">{items.join(' · ')}</p>
		<!-- Two identical tracks so the loop has no visible seam -->
		<div class="marquee-track flex w-max" aria-hidden="true">
			{#each [0, 1] as copy (copy)}
				<ul class="flex shrink-0 items-center">
					{#each items as item, index (index)}
						<li
							class="flex items-center gap-8 px-4 font-head text-2xl whitespace-nowrap text-archa-beige uppercase sm:text-3xl"
						>
							{item}
							<span class="text-archa-gold" aria-hidden="true">✦</span>
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	</div>
{/if}

<style>
	.marquee-track {
		animation: marquee 40s linear infinite;
	}

	.marquee:hover .marquee-track {
		animation-play-state: paused;
	}

	@keyframes marquee {
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
			flex-wrap: wrap;
			width: auto;
		}
	}
</style>
