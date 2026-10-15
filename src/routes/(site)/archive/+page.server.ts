import { getPastEvents } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = () => ({ events: getPastEvents() });
