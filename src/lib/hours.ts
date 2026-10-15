import { TIME_ZONE } from './site.ts';
import type { DayKey, HoursEntry } from './types.ts';

/** Indexed like `Date.prototype.getDay()`. */
export const DAY_KEYS: readonly DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** "on <day>", e.g. "Otvárame vo štvrtok o 20:00" */
export const ON_DAY: Record<DayKey, string> = {
	mon: 'v pondelok',
	tue: 'v utorok',
	wed: 'v stredu',
	thu: 'vo štvrtok',
	fri: 'v piatok',
	sat: 'v sobotu',
	sun: 'v nedeľu'
};

const MINUTES_PER_DAY = 24 * 60;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseTime(hhmm: string): number | undefined {
	const match = TIME_PATTERN.exec(hhmm);
	return match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
}

export function formatTime(minutes: number): string {
	const wrapped = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
	const h = Math.floor(wrapped / 60);
	const m = wrapped % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Wall-clock time in the venue's time zone. */
export interface ZonedTime {
	/** YYYY-MM-DD */
	date: string;
	day: DayKey;
	minutes: number;
}

export function zonedTime(instant: Date, timeZone = TIME_ZONE): ZonedTime {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-CA', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23'
		})
			.formatToParts(instant)
			.map((part) => [part.type, part.value])
	);
	const date = `${parts.year}-${parts.month}-${parts.day}`;
	return {
		date,
		day: dayOfDate(date),
		minutes: Number(parts.hour) * 60 + Number(parts.minute)
	};
}

export function isValidDate(isoDate: string): boolean {
	const match = DATE_PATTERN.exec(isoDate);
	if (!match) return false;
	const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
	const date = new Date(Date.UTC(y, m - 1, d));
	return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function utcDate(isoDate: string): Date {
	const [y, m, d] = isoDate.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d));
}

export function dayOfDate(isoDate: string): DayKey {
	return DAY_KEYS[utcDate(isoDate).getUTCDay()];
}

export function addDays(isoDate: string, days: number): string {
	const date = utcDate(isoDate);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

function shiftDay(day: DayKey, offset: number): DayKey {
	return DAY_KEYS[(((DAY_KEYS.indexOf(day) + offset) % 7) + 7) % 7];
}

interface Session {
	opens: number;
	/** Minutes after the opening day's midnight; above 1440 when closing after midnight. */
	closes: number;
}

function sessionsOn(hours: HoursEntry[], day: DayKey): Session[] {
	const sessions: Session[] = [];
	for (const entry of hours) {
		if (!entry.days.includes(day)) continue;
		const opens = parseTime(entry.opens);
		const closes = parseTime(entry.closes);
		if (opens === undefined || closes === undefined) continue;
		sessions.push({ opens, closes: closes <= opens ? closes + MINUTES_PER_DAY : closes });
	}
	return sessions.sort((a, b) => a.opens - b.opens);
}

export type OpenStatus =
	| { open: true; closesAt: string }
	| { open: false; opensAt?: { day: DayKey; time: string; daysAhead: number } };

export function openStatus(hours: HoursEntry[], now: ZonedTime): OpenStatus {
	for (const session of sessionsOn(hours, now.day)) {
		if (now.minutes >= session.opens && now.minutes < session.closes) {
			return { open: true, closesAt: formatTime(session.closes) };
		}
	}
	for (const session of sessionsOn(hours, shiftDay(now.day, -1))) {
		if (now.minutes < session.closes - MINUTES_PER_DAY) {
			return { open: true, closesAt: formatTime(session.closes) };
		}
	}
	for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
		const day = shiftDay(now.day, daysAhead);
		const next = sessionsOn(hours, day).find(
			(session) => daysAhead > 0 || session.opens > now.minutes
		);
		if (next) return { open: false, opensAt: { day, time: formatTime(next.opens), daysAhead } };
	}
	return { open: false };
}

/**
 * The opening day a moment belongs to: at 01:30 on Saturday the pub is still
 * running its Friday night, so Friday is the day to highlight.
 */
export function businessDay(hours: HoursEntry[], now: ZonedTime): DayKey {
	const yesterday = shiftDay(now.day, -1);
	const stillYesterday = sessionsOn(hours, yesterday).some(
		(session) => now.minutes < session.closes - MINUTES_PER_DAY
	);
	return stillYesterday ? yesterday : now.day;
}

export interface Slot {
	/** HH:MM */
	value: string;
	/** The slot falls after midnight, i.e. on the calendar day after the reservation date. */
	afterMidnight: boolean;
}

export interface SlotOptions {
	step?: number;
	/** Last bookable slot this many minutes before closing. */
	lastBeforeClose?: number;
}

/** Bookable times for the evening that starts on `isoDate`. */
export function reservationSlots(
	hours: HoursEntry[],
	isoDate: string,
	{ step = 30, lastBeforeClose = 60 }: SlotOptions = {}
): Slot[] {
	if (!isValidDate(isoDate)) return [];
	const seen = new Set<number>();
	for (const session of sessionsOn(hours, dayOfDate(isoDate))) {
		for (let t = session.opens; t <= session.closes - lastBeforeClose; t += step) seen.add(t);
	}
	return [...seen]
		.sort((a, b) => a - b)
		.map((t) => ({ value: formatTime(t), afterMidnight: t >= MINUTES_PER_DAY }));
}

/** Local `YYYY-MM-DDTHH:MM` of a slot; comparable as a string with {@link zonedDateTime}. */
export function slotDateTime(isoDate: string, slot: Slot): string {
	return `${slot.afterMidnight ? addDays(isoDate, 1) : isoDate}T${slot.value}`;
}

export function zonedDateTime(now: ZonedTime): string {
	return `${now.date}T${formatTime(now.minutes)}`;
}
