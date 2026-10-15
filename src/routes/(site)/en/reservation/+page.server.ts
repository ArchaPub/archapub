import { reservationPageData, submitReservation } from '#lib/server/reservation-page.ts';
import type { Actions, PageServerLoad } from './$types';

// Handles form submissions, so it can't be prerendered
export const prerender = false;

export const load: PageServerLoad = ({ url }) => reservationPageData(url);

export const actions: Actions = {
	default: (event) => submitReservation(event, 'en')
};
