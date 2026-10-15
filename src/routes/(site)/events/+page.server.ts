import { getUpcomingEvents } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

// Rendered per request so past events drop off without a redeploy
export const prerender = false;

export const load: PageServerLoad = () => ({ events: getUpcomingEvents() });
