import { getGallery, getInfoLinks } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	links: getInfoLinks(),
	background: getGallery()[0]?.image
});
