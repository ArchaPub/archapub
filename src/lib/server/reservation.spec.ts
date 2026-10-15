import { describe, expect, it, vi } from 'vitest';
import { dayOfDate, type ZonedTime } from '#lib/hours.ts';
import type { HoursEntry } from '#lib/types.ts';
import {
	guestEmail,
	parseReservation,
	readReservationValues,
	reservationEmail,
	sendReservationEmail,
	verifyTurnstile,
	type ReservationValues
} from './reservation.ts';

const hours: HoursEntry[] = [
	{
		label: 'Po - Št',
		days: ['mon', 'tue', 'wed', 'thu'],
		opens: '20:00',
		closes: '03:00',
		highlight: false
	},
	{ label: 'Pia - So', days: ['fri', 'sat'], opens: '18:00', closes: '04:00', highlight: true }
];

// Thursday afternoon
const now: ZonedTime = { date: '2026-10-15', day: dayOfDate('2026-10-15'), minutes: 15 * 60 };

const valid: ReservationValues = {
	meno: 'Ján Novák',
	email: 'jan@example.com',
	telefon: '+421 944 123 456',
	pocet: '4',
	datum: '2026-10-16',
	cas: '01:30',
	poznamka: 'Narodeniny'
};

describe('parseReservation', () => {
	it('accepts a valid after-midnight reservation', () => {
		const result = parseReservation(valid, hours, now);
		expect(result).toEqual({
			ok: true,
			reservation: {
				name: 'Ján Novák',
				email: 'jan@example.com',
				phone: '+421 944 123 456',
				people: 4,
				date: '2026-10-16',
				slot: { value: '01:30', afterMidnight: true },
				note: 'Narodeniny',
				locale: 'sk'
			}
		});
	});

	it('reports every invalid field', () => {
		const result = parseReservation(
			{
				meno: ' ',
				email: 'x@',
				telefon: 'abc',
				pocet: '0',
				datum: '2026-10-16',
				cas: '12:00',
				poznamka: ''
			},
			hours,
			now
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(Object.keys(result.errors).sort()).toEqual(['cas', 'email', 'meno', 'pocet', 'telefon']);
	});

	it('rejects past dates, far-future dates and slots that already started', () => {
		const errorsFor = (overrides: Partial<ReservationValues>, at = now) => {
			const result = parseReservation({ ...valid, ...overrides }, hours, at);
			return result.ok ? {} : result.errors;
		};
		expect(errorsFor({ datum: '2026-10-14' }).datum).toBeDefined();
		expect(errorsFor({ datum: '2027-01-01' }).datum).toBeDefined();
		expect(
			errorsFor({ datum: '2026-10-15', cas: '20:00' }, { ...now, minutes: 21 * 60 }).cas
		).toBeDefined();
		expect(
			errorsFor({ datum: '2026-10-15', cas: '22:00' }, { ...now, minutes: 21 * 60 }).cas
		).toBeUndefined();
	});

	it('rejects groups above the online limit', () => {
		const result = parseReservation({ ...valid, pocet: '31' }, hours, now);
		expect(result.ok ? undefined : result.errors.pocet).toMatch(/zavolajte/);
	});

	it('strips control characters and collapses whitespace', () => {
		const result = parseReservation({ ...valid, meno: 'Ján\r\nBcc: x@y.z\u0007' }, hours, now);
		expect(result.ok && result.reservation.name).toBe('Ján Bcc: x@y.z');
	});

	it('reads missing form fields as empty strings', () => {
		const form = new FormData();
		form.set('meno', 'Ján');
		expect(readReservationValues(form)).toMatchObject({ meno: 'Ján', email: '', cas: '' });
	});
});

describe('reservationEmail', () => {
	it('escapes user input', () => {
		const result = parseReservation(
			{ ...valid, poznamka: '<script>alert(1)</script>' },
			hours,
			now
		);
		if (!result.ok) throw new Error('expected valid reservation');
		const { html, subject } = reservationEmail(result.reservation);
		expect(html).not.toContain('<script>');
		expect(html).toContain('&lt;script&gt;');
		expect(subject).toContain('01:30 (po polnoci)');
	});
});

describe('external calls', () => {
	it('does not call siteverify for empty tokens', async () => {
		const fetcher = vi.fn<typeof fetch>();
		expect((await verifyTurnstile('', 'secret', '1.1.1.1', fetcher)).success).toBe(false);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('throws with the provider response when sending fails', async () => {
		const result = parseReservation(valid, hours, now);
		if (!result.ok) throw new Error('expected valid reservation');
		const fetcher = vi
			.fn<typeof fetch>()
			.mockResolvedValue(new Response('bad key', { status: 403 }));
		await expect(
			sendReservationEmail(result.reservation, { apiKey: 'k', from: 'a@b.c', to: 'd@e.f' }, fetcher)
		).rejects.toThrow('Resend responded 403: bad key');
	});
});

describe('English bookings', () => {
	it('returns English errors', () => {
		const result = parseReservation({ ...valid, email: 'x' }, hours, now, 'en');
		expect(result.ok ? undefined : result.errors.email).toBe('Please enter a valid email address.');
	});

	it('sends the guest a receipt in their language and flags it for staff', () => {
		const result = parseReservation(valid, hours, now, 'en');
		if (!result.ok) throw new Error('expected valid reservation');
		expect(guestEmail(result.reservation, '0944 416 519').subject).toMatch(
			/^We received your booking – Friday, 16 October 2026, 01:30 \(after midnight\)$/
		);
		expect(reservationEmail(result.reservation).html).toContain('angličtina');
	});
});
