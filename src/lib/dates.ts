import { LOCALE, TIME_ZONE } from './site.ts';

function formatter(options: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options });
}

const numericDate = formatter({ day: 'numeric', month: 'numeric', year: 'numeric' });
const longDate = formatter({ weekday: 'long', day: 'numeric', month: 'long' });
const longDateWithYear = formatter({
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
});
const time = formatter({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dayOfMonth = formatter({ day: 'numeric' });
const shortMonth = formatter({ month: 'short' });
const monthYear = formatter({ month: 'long', year: 'numeric' });
const isoParts = formatter({ year: 'numeric', month: '2-digit', day: '2-digit' });

/** 12. 2. 2026 */
export const formatDate = (iso: string) => numericDate.format(new Date(iso));
/** piatok 17. októbra */
export const formatDateLong = (iso: string) => longDate.format(new Date(iso));
/** piatok 17. októbra 2026 */
export const formatDateLongWithYear = (iso: string) => longDateWithYear.format(new Date(iso));
/** 20:00 */
export const formatTimeOfDay = (iso: string) => time.format(new Date(iso));
export const formatDay = (iso: string) => dayOfMonth.format(new Date(iso)).replace('.', '');
export const formatMonthShort = (iso: string) => shortMonth.format(new Date(iso)).replace('.', '');
/** október 2026 */
export const formatMonthYear = (iso: string) => monthYear.format(new Date(iso));

/** YYYY-MM-DD of an instant in the venue's time zone. */
export function localDate(iso: string): string {
	const parts = Object.fromEntries(
		isoParts.formatToParts(new Date(iso)).map((part) => [part.type, part.value])
	);
	return `${parts.year}-${parts.month}-${parts.day}`;
}

const HAS_OFFSET = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;
const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/;

/**
 * Parses a front matter date. Values without an explicit offset are wall-clock
 * time in the venue's time zone, not in whatever zone the build runs in.
 */
export function parseContentDate(value: unknown): Date | undefined {
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
	if (typeof value !== 'string') return undefined;
	const text = value.trim();
	if (HAS_OFFSET.test(text)) {
		const date = new Date(text);
		return Number.isNaN(date.getTime()) ? undefined : date;
	}
	const match = LOCAL_DATE_TIME.exec(text);
	if (!match) return undefined;
	const [, y, mo, d, h = '0', mi = '0', s = '0'] = match;
	const wallClockAsUtc = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
	// The zone's offset can differ between the guess and the result around DST changes,
	// so resolve it twice.
	let instant = wallClockAsUtc - zoneOffset(new Date(wallClockAsUtc));
	instant = wallClockAsUtc - zoneOffset(new Date(instant));
	return new Date(instant);
}

function zoneOffset(instant: Date): number {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-US', {
			timeZone: TIME_ZONE,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hourCycle: 'h23'
		})
			.formatToParts(instant)
			.map((part) => [part.type, part.value])
	);
	const asUtc = Date.UTC(
		+parts.year,
		+parts.month - 1,
		+parts.day,
		+parts.hour,
		+parts.minute,
		+parts.second
	);
	return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}
