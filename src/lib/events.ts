import { formatTimeOfDay, localDate, parseContentDate } from './dates.ts';
import { addDays, dayOfDate } from './hours.ts';
import { EVENT_GRACE_HOURS } from './site.ts';
import type { DayKey } from './types.ts';

const HOUR = 3_600_000;

const EVERY: Record<DayKey, string> = {
	mon: 'Každý pondelok',
	tue: 'Každý utorok',
	wed: 'Každú stredu',
	thu: 'Každý štvrtok',
	fri: 'Každý piatok',
	sat: 'Každú sobotu',
	sun: 'Každú nedeľu'
};

/** "Každý štvrtok" for an event starting on a Thursday */
export const everyWeekday = (iso: string) => EVERY[dayOfDate(localDate(iso))];

const WEEK_DAYS = 7;

export const hasStarted = (start: Date, now: Date) =>
	start.getTime() + EVENT_GRACE_HOURS * HOUR <= now.getTime();

/**
 * The next weekly occurrence that hasn't finished yet, keeping the same local
 * wall-clock time across daylight-saving changes. `until` is the last allowed
 * local date (YYYY-MM-DD).
 */
export function nextWeeklyOccurrence(start: Date, now: Date, until?: string): Date | undefined {
	const startDate = localDate(start.toISOString());
	const time = formatTimeOfDay(start.toISOString());
	const elapsedWeeks = Math.max(
		0,
		Math.floor((now.getTime() - start.getTime()) / (WEEK_DAYS * 24 * HOUR)) - 1
	);
	for (let week = elapsedWeeks; week < elapsedWeeks + 3; week++) {
		const date = addDays(startDate, week * WEEK_DAYS);
		if (until && date > until) return undefined;
		const occurrence = parseContentDate(`${date}T${time}`);
		if (occurrence && !hasStarted(occurrence, now)) return occurrence;
	}
	return undefined;
}
