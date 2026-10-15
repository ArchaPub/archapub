import { error } from '@sveltejs/kit';
import { getEvent } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

// Rendered per request so weekly events always show their next date
export const prerender = false;

export const load: PageServerLoad = ({ params }) => {
	const event = getEvent(params.slug);
	if (!event) error(404, 'Akcia neexistuje');
	return { event };
};
