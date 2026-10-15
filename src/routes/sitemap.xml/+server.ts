import { getAllEvents, getPosts } from '#lib/server/content.ts';
import { absoluteUrl } from '#lib/site.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

const STATIC_PAGES = [
	'/',
	'/menu',
	'/events',
	'/archive',
	'/blog',
	'/rezervacia',
	'/ochrana-sukromia',
	'/en',
	'/en/menu',
	'/en/reservation'
];

export const GET: RequestHandler = () => {
	const urls = [
		...STATIC_PAGES.map((path) => ({ path, lastmod: undefined })),
		...getAllEvents().map((event) => ({ path: `/events/${event.slug}`, lastmod: event.date })),
		...getPosts().map((post) => ({ path: `/blog/${post.slug}`, lastmod: post.date }))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		({ path, lastmod }) =>
			`<url><loc>${absoluteUrl(path)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
