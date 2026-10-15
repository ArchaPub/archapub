import { fail, type RequestEvent } from '@sveltejs/kit';
import { env, waitUntil } from 'cloudflare:workers';
import { addDays, isValidDate, zonedTime } from '#lib/hours.ts';
import type { Locale } from '#lib/i18n.ts';
import { getHours, getSettings } from './content.ts';
import {
	formatReservationDate,
	parseReservation,
	readReservationValues,
	RESERVATION_LIMITS,
	RESERVATION_MESSAGES,
	sendGuestEmail,
	sendReservationEmail,
	verifyTurnstile
} from './reservation.ts';

const TURNSTILE_ACTION = 'rezervacia';

export function reservationPageData(url: URL) {
	const today = zonedTime(new Date()).date;
	const requested = url.searchParams.get('datum') ?? url.searchParams.get('date') ?? '';
	return {
		today,
		maxDate: addDays(today, RESERVATION_LIMITS.maxDaysAhead),
		prefillDate: isValidDate(requested) && requested >= today ? requested : '',
		turnstileSiteKey: env.TURNSTILE_SITE_KEY,
		turnstileAction: TURNSTILE_ACTION,
		maxPeople: RESERVATION_LIMITS.maxPeople
	};
}

export async function submitReservation(
	{ request, getClientAddress }: RequestEvent,
	locale: Locale
) {
	const messages = RESERVATION_MESSAGES[locale];
	const form = await request.formData();
	const values = readReservationValues(form);
	const ip = getClientAddress();

	const { success: withinLimit } = await env.RESERVATION_RATE_LIMITER.limit({
		key: `reservation:${ip}`
	});
	if (!withinLimit) return fail(429, { values, message: messages.rateLimited });

	const result = parseReservation(values, getHours(), zonedTime(new Date()), locale);
	if (!result.ok) return fail(422, { values: result.values, errors: result.errors });

	const token = form.get('cf-turnstile-response');
	const verification = await verifyTurnstile(
		typeof token === 'string' ? token : '',
		env.TURNSTILE_SECRET_KEY,
		ip
	);
	if (!verification.success || (verification.action && verification.action !== TURNSTILE_ACTION)) {
		console.warn('Turnstile rejected reservation', verification['error-codes']);
		return fail(400, { values, message: messages.captcha });
	}

	const mail = {
		apiKey: env.RESEND_API_KEY,
		from: env.RESERVATION_FROM_EMAIL,
		to: env.RESERVATION_TO_EMAIL
	};
	try {
		await sendReservationEmail(result.reservation, mail);
	} catch (error) {
		console.error('Failed to send reservation email', error);
		return fail(502, { values, message: messages.sendFailed });
	}

	// The receipt is a courtesy; the booking already reached the pub, so don't fail on it
	const receipt = sendGuestEmail(result.reservation, mail, getSettings().phone).catch((error) =>
		console.error('Failed to send guest receipt', error)
	);
	waitUntil(receipt);

	return {
		success: true,
		summary: {
			name: result.reservation.name,
			when: formatReservationDate(result.reservation, locale),
			people: result.reservation.people
		}
	};
}
