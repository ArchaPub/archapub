import { describe, expect, it } from 'vitest';
import { formatDateLong, formatTimeOfDay, localDate, parseContentDate } from './dates.ts';

describe('parseContentDate', () => {
	it('keeps explicit offsets', () => {
		expect(parseContentDate('2026-02-12T10:00:00+01:00')?.toISOString()).toBe(
			'2026-02-12T09:00:00.000Z'
		);
		expect(parseContentDate('2026-10-17T18:00:00.000Z')?.toISOString()).toBe(
			'2026-10-17T18:00:00.000Z'
		);
	});

	it('reads offset-less values as Bratislava time in summer and winter', () => {
		expect(parseContentDate('2026-07-10T20:00')?.toISOString()).toBe('2026-07-10T18:00:00.000Z');
		expect(parseContentDate('2026-12-10 20:00')?.toISOString()).toBe('2026-12-10T19:00:00.000Z');
		expect(parseContentDate('2026-12-10')?.toISOString()).toBe('2026-12-09T23:00:00.000Z');
	});

	it('rejects garbage', () => {
		expect(parseContentDate('zajtra')).toBeUndefined();
		expect(parseContentDate(42)).toBeUndefined();
	});
});

describe('formatting', () => {
	it('formats in Slovak and in the venue time zone', () => {
		expect(formatTimeOfDay('2026-10-16T18:00:00Z')).toBe('20:00');
		expect(formatDateLong('2026-10-16T18:00:00Z')).toBe('piatok 16. októbra');
		expect(localDate('2026-10-16T22:30:00Z')).toBe('2026-10-17');
	});
});
