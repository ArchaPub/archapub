import { defineConfig } from 'vitest/config';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';

const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com';

export default defineConfig({
	plugins: [
		enhancedImages(),
		tailwindcss(),
		Icons({ compiler: 'svelte' }),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self', TURNSTILE_ORIGIN],
					'style-src': ['self'],
					// Svelte transitions and Turnstile set inline style attributes
					'style-src-attr': ['unsafe-inline'],
					// CMS editors may paste external image URLs (e.g. the menu banner)
					'img-src': ['self', 'data:', 'https:'],
					'font-src': ['self'],
					'connect-src': ['self', TURNSTILE_ORIGIN],
					'frame-src': [TURNSTILE_ORIGIN],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self']
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
