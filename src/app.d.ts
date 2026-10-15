// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}

	interface TurnstileRenderOptions {
		sitekey: string;
		action?: string;
		theme?: 'light' | 'dark' | 'auto';
		language?: string;
		callback?: (token: string) => void;
		'expired-callback'?: () => void;
		'error-callback'?: () => void;
	}

	interface Window {
		turnstile?: {
			render(container: HTMLElement, options: TurnstileRenderOptions): string;
			reset(widgetId: string): void;
			remove(widgetId: string): void;
		};
	}
}

export {};
