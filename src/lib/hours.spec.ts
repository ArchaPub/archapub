import { describe, expect, it } from 'vitest';
import {
	addDays,
	businessDay,
	dayOfDate,
	isValidDate,
	openStatus,
	reservationSlots,
	slotDateTime,
	zonedTime,
	type ZonedTime
} from './hours.ts';
import type { HoursEntry } from './types.ts';

const hours: HoursEntry[] = [
	{
		label: 'Po - Št',
		days: ['mon', 'tue', 'wed', 'thu'],
		opens: '20:00',
		closes: '03:00',
		highlight: false
	},
	{ label: 'Pia - So', days: ['fri', 'sat'], opens: '18:00', closes: '04:00', highlight: true },
	{ label: 'Nedeľa', days: ['sun'], opens: '20:00', closes: '02:00', highlight: false }
];

// 2026-10-16 is a Friday
const at = (date: string, time: string): ZonedTime => {
	const [h, m] = time.split(':').map(Number);
	return { date, day: dayOfDate(date), minutes: h * 60 + m };
};

describe('dates', () => {
	it('resolves weekdays and adds days across month ends', () => {
		expect(dayOfDate('2026-10-16')).toBe('fri');
		expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
	});

	it('rejects impossible dates', () => {
		expect(isValidDate('2026-02-30')).toBe(false);
		expect(isValidDate('2026-2-3')).toBe(false);
		expect(isValidDate('2026-02-28')).toBe(true);
	});

	it('converts instants to Bratislava wall-clock time, including DST', () => {
		expect(zonedTime(new Date('2026-07-01T22:30:00Z'))).toEqual({
			date: '2026-07-02',
			day: 'thu',
			minutes: 30
		});
		expect(zonedTime(new Date('2026-12-01T22:30:00Z')).minutes).toBe(23 * 60 + 30);
	});
});

describe('openStatus', () => {
	it('is open during the evening', () => {
		expect(openStatus(hours, at('2026-10-16', '21:00'))).toEqual({ open: true, closesAt: '04:00' });
	});

	it('stays open after midnight on the previous day’s session', () => {
		// Saturday 02:00 belongs to Friday night
		expect(openStatus(hours, at('2026-10-17', '02:00'))).toEqual({ open: true, closesAt: '04:00' });
		// Monday 01:59 belongs to Sunday night, which closes at 02:00
		expect(openStatus(hours, at('2026-10-19', '01:59')).open).toBe(true);
		expect(openStatus(hours, at('2026-10-19', '02:00')).open).toBe(false);
	});

	it('reports the next opening when closed', () => {
		expect(openStatus(hours, at('2026-10-16', '10:00'))).toEqual({
			open: false,
			opensAt: { day: 'fri', time: '18:00', daysAhead: 0 }
		});
		expect(openStatus(hours, at('2026-10-19', '05:00'))).toEqual({
			open: false,
			opensAt: { day: 'mon', time: '20:00', daysAhead: 0 }
		});
	});

	it('looks ahead to later days', () => {
		const sundayOnly: HoursEntry[] = [{ ...hours[2] }];
		expect(openStatus(sundayOnly, at('2026-10-16', '12:00'))).toEqual({
			open: false,
			opensAt: { day: 'sun', time: '20:00', daysAhead: 2 }
		});
	});

	it('handles empty schedules', () => {
		expect(openStatus([], at('2026-10-16', '12:00'))).toEqual({ open: false });
	});
});

describe('businessDay', () => {
	it('keeps the previous day until the night session ends', () => {
		expect(businessDay(hours, at('2026-10-17', '03:30'))).toBe('fri');
		expect(businessDay(hours, at('2026-10-17', '12:00'))).toBe('sat');
	});
});

describe('reservationSlots', () => {
	it('lists half-hour slots until an hour before closing', () => {
		const slots = reservationSlots(hours, '2026-10-16');
		expect(slots[0]).toEqual({ value: '18:00', afterMidnight: false });
		expect(slots.at(-1)).toEqual({ value: '03:00', afterMidnight: true });
		expect(slots).toHaveLength(19);
	});

	it('returns nothing for invalid dates or closed days', () => {
		expect(reservationSlots(hours, 'nope')).toEqual([]);
		expect(reservationSlots([hours[2]], '2026-10-16')).toEqual([]);
	});

	it('places after-midnight slots on the next calendar day', () => {
		expect(slotDateTime('2026-10-31', { value: '01:00', afterMidnight: true })).toBe(
			'2026-11-01T01:00'
		);
	});
});
