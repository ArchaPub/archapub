import { getGallery, getHomepage } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	homepage: getHomepage(),
	gallery: getGallery()
});
