import { describe, expect, it } from 'vitest';
import { alternatePath, categoryName, englishDayRange, localeOf } from './i18n.ts';

describe('i18n', () => {
	it('detects the locale from the path', () => {
		expect(localeOf('/en')).toBe('en');
		expect(localeOf('/en/menu')).toBe('en');
		expect(localeOf('/events')).toBe('sk');
		expect(localeOf('/english')).toBe('sk');
	});

	it('maps pages to their translation', () => {
		expect(alternatePath('/menu', 'en')).toBe('/en/menu');
		expect(alternatePath('/en/reservation', 'sk')).toBe('/rezervacia');
		expect(alternatePath('/blog', 'en')).toBeUndefined();
	});

	it('formats English day ranges', () => {
		expect(englishDayRange(['mon', 'tue', 'wed', 'thu'])).toBe('Mon – Thu');
		expect(englishDayRange(['fri', 'sat'])).toBe('Fri, Sat');
		expect(englishDayRange(['sun'])).toBe('Sun');
		expect(englishDayRange(['mon', 'wed', 'fri'])).toBe('Mon, Wed, Fri');
	});

	it('translates known categories and keeps unknown ones', () => {
		expect(categoryName('Pivo', 'en')).toBe('Beer');
		expect(categoryName('Pivo', 'sk')).toBe('Pivo');
		expect(categoryName('Sezónne', 'en')).toBe('Sezónne');
	});
});
