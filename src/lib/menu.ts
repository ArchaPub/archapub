import type { DrinkItem, FoodItem } from './types.ts';

/** `2,90€` → `2,90 €` (non-breaking space) */
export const formatPrice = (price: string) => price.replace(/\s*€\s*$/, ' €');

/** `0,5l` → `0,5 l` */
export const formatVolume = (volume: string) => volume.replace(/(\d)\s*(l|ml|cl)\b/i, '$1 $2');

export function groupByCategory<T extends { category: string }>(items: T[]): [string, T[]][] {
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const group = groups.get(item.category);
		if (group) group.push(item);
		else groups.set(item.category, [item]);
	}
	return [...groups];
}

export interface DrinkGroup {
	name: string;
	tap: boolean;
	badge: string;
	variants: { volume: string; price: string }[];
}

/** Merges rows like "Šariš 12° 0,5 l" and "Šariš 12° 0,3 l" into one line with two prices. */
export function groupDrinkVariants(drinks: DrinkItem[]): DrinkGroup[] {
	const groups = new Map<string, DrinkGroup>();
	for (const drink of drinks) {
		const variant = { volume: drink.volume, price: drink.price };
		const group = groups.get(drink.name);
		if (group) {
			group.variants.push(variant);
			group.tap ||= drink.tap;
			group.badge ||= drink.badge;
		} else {
			groups.set(drink.name, {
				name: drink.name,
				tap: drink.tap,
				badge: drink.badge,
				variants: [variant]
			});
		}
	}
	for (const group of groups.values()) {
		group.variants.sort((a, b) => litres(a.volume) - litres(b.volume));
	}
	return [...groups.values()];
}

function litres(volume: string): number {
	const value = Number.parseFloat(volume.replace(',', '.'));
	return Number.isFinite(value) ? value : 0;
}

/** Case- and diacritics-insensitive form for search ("saris" finds "Šariš"). */
export const searchable = (value: string) =>
	value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();

export function matchesFood(item: FoodItem, query: string) {
	return searchable(`${item.name} ${item.desc} ${item.category}`).includes(query);
}

export function matchesDrink(group: DrinkGroup, category: string, query: string) {
	return searchable(`${group.name} ${category}`).includes(query);
}
