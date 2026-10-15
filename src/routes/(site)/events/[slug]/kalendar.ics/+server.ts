import { error } from '@sveltejs/kit';
import { getEvent, getSettings } from '#lib/server/content.ts';
import { absoluteUrl } from '#lib/site.ts';
import type { RequestHandler } from './$types';

export const prerender = false;

/** Events have no end time in the CMS; assume an evening. */
const DEFAULT_DURATION_HOURS = 4;

const icsDate = (date: Date) =>
	date
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');
const icsText = (value: string) =>
	value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

export const GET: RequestHandler = ({ params }) => {
	const event = getEvent(params.slug);
	if (!event) error(404, 'Akcia neexistuje');
	const settings = getSettings();
	const start = new Date(event.date);
	const end = event.end
		? new Date(event.end)
		: new Date(start.getTime() + DEFAULT_DURATION_HOURS * 3_600_000);
	const url = absoluteUrl(`/events/${event.slug}`);

	const body = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Archa Pub//Program//SK',
		'CALSCALE:GREGORIAN',
		'BEGIN:VEVENT',
		`UID:${event.slug}@archapub.sk`,
		`DTSTAMP:${icsDate(start)}`,
		`DTSTART:${icsDate(start)}`,
		`DTEND:${icsDate(end)}`,
		...(event.weekly ? ['RRULE:FREQ=WEEKLY'] : []),
		`SUMMARY:${icsText(event.title)}`,
		`DESCRIPTION:${icsText([event.description, url].filter(Boolean).join('\n\n'))}`,
		`LOCATION:${icsText(`${settings.name}, ${settings.street}, ${settings.postalCode} ${settings.city}`)}`,
		`URL:${url}`,
		'END:VEVENT',
		'END:VCALENDAR',
		''
	].join('\r\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': `attachment; filename="${event.slug}.ics"`
		}
	});
};
