import type { Handle } from '@sveltejs/kit/hooks';
import { localeOf } from '#lib/i18n.ts';

// Prerendered pages and static files get the same headers from `_headers`
const SECURITY_HEADERS = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

export const handle: Handle = async ({ event, resolve }) => {
	const lang = localeOf(event.url.pathname);
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('<html lang="sk">', `<html lang="${lang}">`)
	});
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		if (!response.headers.has(name)) response.headers.set(name, value);
	}
	return response;
};
