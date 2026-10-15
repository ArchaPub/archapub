import { describe, expect, it } from 'vitest';
import {
	formatPrice,
	formatVolume,
	groupByCategory,
	groupDrinkVariants,
	searchable
} from './menu.ts';

describe('menu helpers', () => {
	it('formats prices and volumes with non-breaking spaces', () => {
		expect(formatPrice('2,90€')).toBe('2,90 €');
		expect(formatVolume('0,5l')).toBe('0,5 l');
		expect(formatVolume('')).toBe('');
	});

	it('groups by category in first-seen order', () => {
		const groups = groupByCategory([
			{ category: 'Pivo', name: 'a' },
			{ category: 'Víno', name: 'b' },
			{ category: 'Pivo', name: 'c' }
		]);
		expect(groups.map(([name, items]) => [name, items.length])).toEqual([
			['Pivo', 2],
			['Víno', 1]
		]);
	});

	it('merges drink sizes, smallest first', () => {
		const groups = groupDrinkVariants([
			{ name: 'Šariš 12°', volume: '0,5l', price: '2,60€', category: 'Pivo', tap: true, badge: '' },
			{
				name: 'Šariš 12°',
				volume: '0,3l',
				price: '1,80€',
				category: 'Pivo',
				tap: true,
				badge: 'Tip'
			},
			{ name: 'Káva', volume: '', price: '1,80€', category: 'Teplé nápoje', tap: false, badge: '' }
		]);
		expect(groups).toEqual([
			{
				name: 'Šariš 12°',
				tap: true,
				badge: 'Tip',
				variants: [
					{ volume: '0,3l', price: '1,80€' },
					{ volume: '0,5l', price: '2,60€' }
				]
			},
			{ name: 'Káva', tap: false, badge: '', variants: [{ volume: '', price: '1,80€' }] }
		]);
	});

	it('ignores case and diacritics when searching', () => {
		expect(searchable('Šariš Čaj')).toBe('saris caj');
	});
});
