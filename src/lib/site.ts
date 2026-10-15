export const SITE_URL = 'https://archapub.sk';
export const TIME_ZONE = 'Europe/Bratislava';
export const LOCALE = 'sk-SK';

/** Open Graph image used when a page has none of its own (1200×630). */
export const DEFAULT_IMAGE = '/og.jpg';

/** How long after its start an event still counts as "upcoming". */
export const EVENT_GRACE_HOURS = 6;

export function absoluteUrl(path: string): string {
	return new URL(path, SITE_URL).href;
}
