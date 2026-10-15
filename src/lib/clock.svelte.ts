import { createSubscriber } from 'svelte/reactivity';

let current: Date | null = null;

const subscribe = createSubscriber((update) => {
	const tick = () => {
		current = new Date();
		update();
	};
	// Deferred so hydration matches the server render, which has no notion of "now"
	const first = setTimeout(tick, 0);
	const interval = setInterval(tick, 30_000);
	return () => {
		clearTimeout(first);
		clearInterval(interval);
	};
});

/** Current time in the browser, ticking every 30 s; `null` during SSR and hydration. */
export const clock = {
	get now(): Date | null {
		subscribe();
		return current;
	}
};
