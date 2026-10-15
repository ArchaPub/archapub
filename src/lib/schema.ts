import { DAY_KEYS } from './hours.ts';
import { absoluteUrl, SITE_URL } from './site.ts';
import type {
	DayKey,
	DrinkItem,
	EventDetail,
	FoodItem,
	HoursEntry,
	PostDetail,
	Settings,
	Social
} from './types.ts';

type JsonLd = Record<string, unknown>;

const SCHEMA_DAYS: Record<DayKey, string> = {
	mon: 'Monday',
	tue: 'Tuesday',
	wed: 'Wednesday',
	thu: 'Thursday',
	fri: 'Friday',
	sat: 'Saturday',
	sun: 'Sunday'
};

const BUSINESS_ID = `${SITE_URL}/#pub`;

/** Serialises JSON-LD so it can't break out of its `<script>` element. */
export function jsonLdScript(data: JsonLd | JsonLd[]): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}

function postalAddress(settings: Settings) {
	return {
		'@type': 'PostalAddress',
		streetAddress: settings.street,
		addressLocality: settings.city,
		postalCode: settings.postalCode,
		addressCountry: 'SK'
	};
}

/** `0944 416 519` → `+421944416519` */
export function internationalPhone(phone: string): string {
	const digits = phone.replace(/[^\d+]/g, '');
	if (digits.startsWith('+')) return digits;
	if (digits.startsWith('00')) return `+${digits.slice(2)}`;
	if (digits.startsWith('0')) return `+421${digits.slice(1)}`;
	return digits;
}

export function pubSchema(
	settings: Settings,
	hours: HoursEntry[],
	socials: Social[],
	image: string
): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BarOrPub',
		'@id': BUSINESS_ID,
		name: settings.name,
		url: SITE_URL,
		description: settings.description,
		image: absoluteUrl(image),
		logo: absoluteUrl('/logo.svg'),
		telephone: internationalPhone(settings.phone),
		email: settings.email,
		address: postalAddress(settings),
		...(settings.latitude !== undefined && settings.longitude !== undefined
			? {
					geo: {
						'@type': 'GeoCoordinates',
						latitude: settings.latitude,
						longitude: settings.longitude
					}
				}
			: {}),
		hasMap: settings.mapsUrl || undefined,
		priceRange: '€',
		currenciesAccepted: 'EUR',
		acceptsReservations: true,
		servesCuisine: 'Pub',
		hasMenu: absoluteUrl('/menu'),
		openingHoursSpecification: hours.map((entry) => ({
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: DAY_KEYS.filter((day) => entry.days.includes(day)).map((day) => SCHEMA_DAYS[day]),
			opens: entry.opens,
			closes: entry.closes
		})),
		sameAs: socials.map((social) => social.url)
	};
}

export function websiteSchema(settings: Settings): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: settings.name,
		url: SITE_URL,
		inLanguage: 'sk',
		publisher: { '@id': BUSINESS_ID }
	};
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [{ name: 'Domov', path: '/' }, ...items].map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path)
		}))
	};
}

export function eventSchema(event: EventDetail, settings: Settings, image?: string): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: event.title,
		description: event.description || undefined,
		startDate: event.date,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		url: absoluteUrl(`/events/${event.slug}`),
		image: image ? [absoluteUrl(image)] : undefined,
		location: {
			'@type': 'Place',
			name: settings.name,
			address: postalAddress(settings)
		},
		organizer: { '@type': 'Organization', name: settings.name, url: SITE_URL }
	};
}

export function articleSchema(post: PostDetail, settings: Settings, image?: string): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description || undefined,
		datePublished: post.date,
		url: absoluteUrl(`/blog/${post.slug}`),
		mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
		image: image ? [absoluteUrl(image)] : undefined,
		inLanguage: 'sk',
		author: { '@type': 'Organization', name: settings.name, url: SITE_URL },
		publisher: { '@id': BUSINESS_ID }
	};
}

/** `2,90€` → `2.90` */
const schemaPrice = (price: string) => price.replace(/[^\d,.]/g, '').replace(',', '.');

export function menuSchema(food: [string, FoodItem[]][], drinks: [string, DrinkItem[]][]): JsonLd {
	const section = (name: string, items: (FoodItem | DrinkItem)[]) => ({
		'@type': 'MenuSection',
		name,
		hasMenuItem: items.map((item) => ({
			'@type': 'MenuItem',
			name: 'volume' in item && item.volume ? `${item.name} ${item.volume}` : item.name,
			description: 'desc' in item && item.desc ? item.desc : undefined,
			offers: { '@type': 'Offer', price: schemaPrice(item.price), priceCurrency: 'EUR' }
		}))
	});
	return {
		'@context': 'https://schema.org',
		'@type': 'Menu',
		name: 'Menu a nápojový lístok',
		url: absoluteUrl('/menu'),
		inLanguage: 'sk',
		hasMenuSection: [...food, ...drinks].map(([name, items]) => section(name, items))
	};
}
