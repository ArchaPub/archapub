import type { Picture } from '@sveltejs/enhanced-img';

/** Decap CMS stores uploads under this public path (see `public_folder` in static/admin/config.yml). */
const PUBLIC_PREFIX = '/img/';

const pictures = import.meta.glob<Picture>(
	'/src/lib/media/*.{avif,AVIF,gif,GIF,heif,HEIF,jpeg,JPEG,jpg,JPG,png,PNG,tiff,TIFF,webp,WEBP}',
	{ eager: true, import: 'default', query: { enhanced: true } }
);

/**
 * Maps a CMS image path to the build-optimised picture. External URLs (and
 * paths that don't match an uploaded file) are returned unchanged.
 */
export function resolveImage(src: string | undefined): Picture | string | undefined {
	if (!src) return undefined;
	if (src.startsWith(PUBLIC_PREFIX)) {
		const picture = pictures[`/src/lib/media/${src.slice(PUBLIC_PREFIX.length)}`];
		if (picture) return picture;
	}
	return src;
}

/** A single-file URL for an image, e.g. for Open Graph tags. */
export function imageUrl(src: string | undefined): string | undefined {
	const resolved = resolveImage(src);
	return typeof resolved === 'object' ? resolved.img.src : resolved;
}

const escapeAttribute = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** `<picture>` markup for images embedded in Markdown bodies. */
export function pictureHtml(src: string, alt: string): string {
	const resolved = resolveImage(src);
	if (typeof resolved !== 'object') {
		return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">`;
	}
	const sources = Object.entries(resolved.sources)
		.map(
			([format, srcset]) => `<source srcset="${escapeAttribute(srcset)}" type="image/${format}">`
		)
		.join('');
	const { img } = resolved;
	return `<picture>${sources}<img src="${escapeAttribute(img.src)}" alt="${escapeAttribute(alt)}" width="${img.w}" height="${img.h}" loading="lazy" decoding="async"></picture>`;
}
