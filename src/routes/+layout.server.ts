import { getHours, getNotices, getSettings, getSocials } from '#lib/server/content.ts';
import type { LayoutServerLoad } from './$types';

// Everything is prerendered unless a page opts out (pages that depend on "now" or handle forms)
export const prerender = true;

export const load: LayoutServerLoad = () => ({
	settings: getSettings(),
	hours: getHours(),
	socials: getSocials(),
	notices: getNotices()
});
