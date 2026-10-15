import { getAllergens, getDrinks, getFood, getMenuInfo } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	food: getFood(),
	drinks: getDrinks(),
	allergens: getAllergens(),
	menuInfo: getMenuInfo()
});
