import {
	addDays,
	isValidDate,
	reservationSlots,
	slotDateTime,
	zonedDateTime,
	type Slot,
	type ZonedTime
} from '#lib/hours.ts';
import type { Locale } from '#lib/i18n.ts';
import type { HoursEntry } from '#lib/types.ts';

export const RESERVATION_LIMITS = {
	name: 100,
	email: 254,
	phone: 30,
	note: 1000,
	maxPeople: 30,
	maxDaysAhead: 60
} as const;

export const RESERVATION_FIELDS = [
	'meno',
	'email',
	'telefon',
	'pocet',
	'datum',
	'cas',
	'poznamka'
] as const;
export type ReservationField = (typeof RESERVATION_FIELDS)[number];
export type ReservationValues = Record<ReservationField, string>;
export type ReservationErrors = Partial<Record<ReservationField, string>>;

export interface Reservation {
	name: string;
	email: string;
	phone: string;
	people: number;
	date: string;
	slot: Slot;
	note: string;
	locale: Locale;
}

export type ParseResult =
	| { ok: true; reservation: Reservation }
	| { ok: false; errors: ReservationErrors; values: ReservationValues };

const limits = RESERVATION_LIMITS;

export const RESERVATION_MESSAGES = {
	sk: {
		nameMissing: 'Zadajte meno a priezvisko.',
		tooLong: (max: number) => `Najviac ${max} znakov.`,
		email: 'Zadajte platnú emailovú adresu.',
		phone: 'Zadajte platné telefónne číslo.',
		people: 'Zadajte počet osôb.',
		tooManyPeople: `Pre viac ako ${limits.maxPeople} osôb nám prosím zavolajte.`,
		date: 'Vyberte dátum.',
		dateRange: `Rezervovať sa dá na dnes až ${limits.maxDaysAhead} dní dopredu.`,
		closed: 'V tento deň máme zatvorené.',
		time: 'Vyberte čas z ponuky.',
		timePassed: 'Tento čas už prešiel.',
		rateLimited: 'Príliš veľa pokusov. Skúste to prosím o minútu.',
		captcha: 'Overenie, že nie ste robot, zlyhalo. Skúste to prosím znova.',
		sendFailed: 'Rezerváciu sa nepodarilo odoslať. Skúste to neskôr alebo nám zavolajte.'
	},
	en: {
		nameMissing: 'Please enter your name.',
		tooLong: (max: number) => `At most ${max} characters.`,
		email: 'Please enter a valid email address.',
		phone: 'Please enter a valid phone number.',
		people: 'Please enter the number of guests.',
		tooManyPeople: `For more than ${limits.maxPeople} guests, please call us.`,
		date: 'Please choose a date.',
		dateRange: `Bookings are possible from today up to ${limits.maxDaysAhead} days ahead.`,
		closed: 'We are closed on this day.',
		time: 'Please choose a time from the list.',
		timePassed: 'This time has already passed.',
		rateLimited: 'Too many attempts. Please try again in a minute.',
		captcha: 'The bot check failed. Please try again.',
		sendFailed: 'We could not send your booking. Please try again later or call us.'
	}
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s/()-]{6,}$/;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const singleLine = (value: string) => value.replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim();
const multiLine = (value: string) =>
	value.replace(CONTROL_CHARS, '').replace(/\r\n?/g, '\n').trim();

export function readReservationValues(form: FormData): ReservationValues {
	const values = {} as ReservationValues;
	for (const field of RESERVATION_FIELDS) {
		const value = form.get(field);
		values[field] = typeof value === 'string' ? value : '';
	}
	return values;
}

export function parseReservation(
	raw: ReservationValues,
	hours: HoursEntry[],
	now: ZonedTime,
	locale: Locale = 'sk'
): ParseResult {
	const values: ReservationValues = {
		meno: singleLine(raw.meno),
		email: singleLine(raw.email),
		telefon: singleLine(raw.telefon),
		pocet: singleLine(raw.pocet),
		datum: singleLine(raw.datum),
		cas: singleLine(raw.cas),
		poznamka: multiLine(raw.poznamka)
	};
	const errors: ReservationErrors = {};
	const m = RESERVATION_MESSAGES[locale];

	if (values.meno.length < 2) errors.meno = m.nameMissing;
	else if (values.meno.length > limits.name) errors.meno = m.tooLong(limits.name);

	if (!EMAIL.test(values.email) || values.email.length > limits.email) errors.email = m.email;

	if (values.telefon && (!PHONE.test(values.telefon) || values.telefon.length > limits.phone))
		errors.telefon = m.phone;

	const people = Number(values.pocet);
	if (!Number.isInteger(people) || people < 1) errors.pocet = m.people;
	else if (people > limits.maxPeople) errors.pocet = m.tooManyPeople;

	let slot: Slot | undefined;
	if (!isValidDate(values.datum)) {
		errors.datum = m.date;
	} else if (values.datum < now.date || values.datum > addDays(now.date, limits.maxDaysAhead)) {
		errors.datum = m.dateRange;
	} else {
		const slots = reservationSlots(hours, values.datum);
		slot = slots.find((candidate) => candidate.value === values.cas);
		if (slots.length === 0) errors.datum = m.closed;
		else if (!slot) errors.cas = m.time;
		else if (slotDateTime(values.datum, slot) <= zonedDateTime(now)) errors.cas = m.timePassed;
	}

	if (values.poznamka.length > limits.note) errors.poznamka = m.tooLong(limits.note);

	if (Object.keys(errors).length > 0 || !slot) return { ok: false, errors, values };
	return {
		ok: true,
		reservation: {
			name: values.meno,
			email: values.email,
			phone: values.telefon,
			people,
			date: values.datum,
			slot,
			note: values.poznamka,
			locale
		}
	};
}

export interface TurnstileResult {
	success: boolean;
	action?: string;
	'error-codes'?: string[];
}

export async function verifyTurnstile(
	token: string,
	secret: string,
	remoteIp: string,
	fetcher: typeof fetch = fetch
): Promise<TurnstileResult> {
	// Tokens longer than this are never valid
	if (!token || token.length > 2048)
		return { success: false, 'error-codes': ['invalid-input-response'] };
	const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ secret, response: token, remoteip: remoteIp })
	});
	if (!response.ok) return { success: false, 'error-codes': [`http-${response.status}`] };
	return (await response.json()) as TurnstileResult;
}

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

export function formatReservationDate(reservation: Reservation, locale: Locale = 'sk'): string {
	const [y, m, d] = reservation.date.split('-').map(Number);
	const date = new Date(Date.UTC(y, m - 1, d, 12));
	const day = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'sk-SK', {
		timeZone: 'UTC',
		weekday: 'long',
		day: 'numeric',
		month: locale === 'en' ? 'long' : 'numeric',
		year: 'numeric'
	}).format(date);
	const afterMidnight = locale === 'en' ? '(after midnight)' : '(po polnoci)';
	return reservation.slot.afterMidnight
		? `${day}, ${reservation.slot.value} ${afterMidnight}`
		: `${day}, ${reservation.slot.value}`;
}

function emailLayout(subtitle: string, rows: [string, string, boolean?][], footer: string) {
	const cell = 'padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);';
	return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#161812;color:#f2f2f2;border-radius:16px;overflow:hidden;">
	<div style="background:#2a5231;padding:24px 32px;">
		<h1 style="margin:0;font-size:24px;color:#cfa34b;letter-spacing:0.05em;">ARCHA PUB</h1>
		<p style="margin:4px 0 0;color:#e3cbb3;font-size:13px;">${subtitle}</p>
	</div>
	<div style="padding:32px;">
		<table style="width:100%;border-collapse:collapse;">
			${rows
				.map(
					([label, value, strong]) => `<tr>
				<td style="${cell}color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;width:140px;vertical-align:top;">${label}</td>
				<td style="${cell}font-size:15px;${strong ? 'color:#cfa34b;font-weight:bold;' : ''}white-space:pre-wrap;">${escapeHtml(value)}</td>
			</tr>`
				)
				.join('')}
		</table>
		<p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">${footer}</p>
	</div>
</div>`;
}

/** Notification for the staff, always in Slovak. */
export function reservationEmail(reservation: Reservation) {
	const when = formatReservationDate(reservation);
	const rows: [string, string, boolean?][] = [
		['Meno', reservation.name],
		['Email', reservation.email],
		...(reservation.phone ? [['Telefón', reservation.phone] as [string, string]] : []),
		['Termín', when, true],
		['Počet osôb', String(reservation.people), true],
		...(reservation.note ? [['Poznámka', reservation.note] as [string, string]] : []),
		...(reservation.locale === 'en'
			? [['Jazyk', 'angličtina – odpovedzte po anglicky'] as [string, string]]
			: [])
	];
	return {
		subject: `Rezervácia — ${reservation.name}, ${when}, ${reservation.people} os.`,
		html: emailLayout(
			'Nová rezervácia stola',
			rows,
			'Odpovedzte na tento email a potvrďte rezerváciu hosťovi.'
		)
	};
}

/** Receipt for the guest, in the language they booked in. */
export function guestEmail(reservation: Reservation, venuePhone: string) {
	const when = formatReservationDate(reservation, reservation.locale);
	if (reservation.locale === 'en') {
		return {
			subject: `We received your booking – ${when}`,
			html: emailLayout(
				'Booking request received',
				[
					['Name', reservation.name],
					['When', when, true],
					['Guests', String(reservation.people), true],
					...(reservation.note ? [['Note', reservation.note] as [string, string]] : [])
				],
				`Thank you! We will confirm your table by email soon. The booking is not final until we confirm it. Questions? Call ${escapeHtml(venuePhone)} or reply to this email.`
			)
		};
	}
	return {
		subject: `Prijali sme vašu rezerváciu – ${when}`,
		html: emailLayout(
			'Žiadosť o rezerváciu prijatá',
			[
				['Meno', reservation.name],
				['Termín', when, true],
				['Počet osôb', String(reservation.people), true],
				...(reservation.note ? [['Poznámka', reservation.note] as [string, string]] : [])
			],
			`Ďakujeme! Stôl vám čoskoro potvrdíme emailom. Kým nepríde potvrdenie, rezervácia nie je záväzná. Otázky? Volajte ${escapeHtml(venuePhone)} alebo odpovedzte na tento email.`
		)
	};
}

export interface MailConfig {
	apiKey: string;
	from: string;
	to: string;
}

interface OutgoingEmail {
	to: string;
	replyTo: string;
	subject: string;
	html: string;
}

async function sendEmail(
	email: OutgoingEmail,
	config: MailConfig,
	fetcher: typeof fetch
): Promise<void> {
	const response = await fetcher('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			from: `Archa Pub Rezervácie <${config.from}>`,
			to: [email.to],
			reply_to: email.replyTo,
			subject: email.subject,
			html: email.html
		})
	});
	if (!response.ok) {
		throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
	}
}

export async function sendReservationEmail(
	reservation: Reservation,
	config: MailConfig,
	fetcher: typeof fetch = fetch
): Promise<void> {
	await sendEmail(
		{ to: config.to, replyTo: reservation.email, ...reservationEmail(reservation) },
		config,
		fetcher
	);
}

export async function sendGuestEmail(
	reservation: Reservation,
	config: MailConfig,
	venuePhone: string,
	fetcher: typeof fetch = fetch
): Promise<void> {
	await sendEmail(
		{ to: reservation.email, replyTo: config.to, ...guestEmail(reservation, venuePhone) },
		config,
		fetcher
	);
}
