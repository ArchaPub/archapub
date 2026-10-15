import { getPosts, getSettings } from '#lib/server/content.ts';
import { absoluteUrl } from '#lib/site.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

const xml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: RequestHandler = () => {
	const settings = getSettings();
	const posts = getPosts();
	const items = posts
		.map((post) => {
			const url = absoluteUrl(`/blog/${post.slug}`);
			return `<item><title>${xml(post.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(post.date).toUTCString()}</pubDate><description>${xml(post.description)}</description></item>`;
		})
		.join('');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(settings.name)} · Blog</title><link>${absoluteUrl('/blog')}</link><atom:link href="${absoluteUrl('/blog/rss.xml')}" rel="self" type="application/rss+xml"/><description>${xml(settings.description)}</description><language>sk</language>${items}</channel></rss>`;

	return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
