import { describe, expect, it } from 'vitest';
import { nextWeeklyOccurrence } from './events.ts';

// Thursdays at 19:30 Bratislava time
const start = new Date('2026-10-01T17:30:00Z');

describe('nextWeeklyOccurrence', () => {
	it('returns the first date before the series starts', () => {
		expect(nextWeeklyOccurrence(start, new Date('2026-09-20T12:00:00Z'))).toEqual(start);
	});

	it('moves to the following week once an evening is over', () => {
		expect(nextWeeklyOccurrence(start, new Date('2026-10-02T12:00:00Z'))?.toISOString()).toBe(
			'2026-10-08T17:30:00.000Z'
		);
	});

	it('keeps the local time across the end of summer time', () => {
		// Clocks go back on 25 October 2026, so 19:30 becomes 18:30 UTC
		expect(nextWeeklyOccurrence(start, new Date('2026-10-27T12:00:00Z'))?.toISOString()).toBe(
			'2026-10-29T18:30:00.000Z'
		);
	});

	it('stops after the last date', () => {
		expect(
			nextWeeklyOccurrence(start, new Date('2026-10-20T12:00:00Z'), '2026-10-15')
		).toBeUndefined();
		expect(
			nextWeeklyOccurrence(start, new Date('2026-10-10T12:00:00Z'), '2026-10-15')?.toISOString()
		).toBe('2026-10-15T17:30:00.000Z');
	});
});
