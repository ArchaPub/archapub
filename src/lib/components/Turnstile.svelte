<script lang="ts" module>
	const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
	let scriptLoading: Promise<void> | undefined;

	function loadScript(): Promise<void> {
		scriptLoading ??= new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = SCRIPT_URL;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => {
				scriptLoading = undefined;
				reject(new Error('Turnstile failed to load'));
			};
			document.head.appendChild(script);
		});
		return scriptLoading;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		siteKey: string;
		action: string;
		/** Whether a valid token is currently present. */
		verified?: boolean;
	}

	let { siteKey, action, verified = $bindable(false) }: Props = $props();

	let container: HTMLDivElement;
	let widgetId: string | undefined;
	let loadFailed = $state(false);

	/** Tokens are single-use; call after every submission the server rejected. */
	export function reset() {
		verified = false;
		if (widgetId !== undefined) window.turnstile?.reset(widgetId);
	}

	onMount(() => {
		let destroyed = false;
		loadScript()
			.then(() => {
				if (destroyed || !window.turnstile) return;
				widgetId = window.turnstile.render(container, {
					sitekey: siteKey,
					action,
					theme: 'dark',
					language: 'sk',
					callback: () => (verified = true),
					'expired-callback': () => (verified = false),
					'error-callback': () => (verified = false)
				});
			})
			.catch(() => (loadFailed = true));

		return () => {
			destroyed = true;
			if (widgetId !== undefined) window.turnstile?.remove(widgetId);
		};
	});
</script>

<div bind:this={container} class="min-h-[65px]"></div>
{#if loadFailed}
	<p class="text-sm text-red-300" role="alert">
		Nepodarilo sa načítať overenie. Skontrolujte pripojenie alebo blokovanie obsahu a obnovte
		stránku.
	</p>
{/if}
