import {
	getBestsellers,
	getGallery,
	getHomepage,
	getPosts,
	getUpcomingEvents
} from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

// Rendered per request so upcoming events never go stale between deploys
export const prerender = false;

export const load: PageServerLoad = () => ({
	homepage: getHomepage(),
	gallery: getGallery(),
	bestsellers: getBestsellers(),
	events: getUpcomingEvents().slice(0, 3),
	latestPost: getPosts()[0]
});
