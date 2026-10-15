import type { DayKey } from './types.ts';

export type Locale = 'sk' | 'en';

export const localeOf = (pathname: string): Locale =>
	pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'sk';

/** Pages that exist in both languages, as [Slovak path, English path]. */
const PAGE_PAIRS: [string, string][] = [
	['/', '/en'],
	['/menu', '/en/menu'],
	['/rezervacia', '/en/reservation']
];

export function alternatePath(pathname: string, target: Locale): string | undefined {
	const pair = PAGE_PAIRS.find(([sk, en]) => sk === pathname || en === pathname);
	return pair && (target === 'sk' ? pair[0] : pair[1]);
}

const WEEK: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const EN_SHORT: Record<DayKey, string> = {
	mon: 'Mon',
	tue: 'Tue',
	wed: 'Wed',
	thu: 'Thu',
	fri: 'Fri',
	sat: 'Sat',
	sun: 'Sun'
};
const EN_ON_DAY: Record<DayKey, string> = {
	mon: 'on Monday',
	tue: 'on Tuesday',
	wed: 'on Wednesday',
	thu: 'on Thursday',
	fri: 'on Friday',
	sat: 'on Saturday',
	sun: 'on Sunday'
};

/** ["mon","tue","wed","thu"] → "Mon – Thu"; non-consecutive days are listed. */
export function englishDayRange(days: DayKey[]): string {
	const sorted = WEEK.filter((day) => days.includes(day));
	const consecutive = sorted.every(
		(day, index) => index === 0 || WEEK.indexOf(day) === WEEK.indexOf(sorted[index - 1]) + 1
	);
	if (sorted.length > 2 && consecutive) {
		return `${EN_SHORT[sorted[0]]} – ${EN_SHORT[sorted[sorted.length - 1]]}`;
	}
	return sorted.map((day) => EN_SHORT[day]).join(', ');
}

const CATEGORY_EN: Record<string, string> = {
	Pivo: 'Beer',
	Vína: 'Wine',
	Víno: 'Wine',
	Alkohol: 'Spirits',
	Nealko: 'Soft drinks',
	'Teplé nápoje': 'Hot drinks',
	Kokteily: 'Cocktails',
	Pochutiny: 'Snacks',
	'K pivu': 'Bar snacks',
	Burgre: 'Burgers',
	Špeciality: 'Specials',
	Ostatné: 'Other'
};

export const categoryName = (category: string, locale: Locale) =>
	locale === 'en' ? (CATEGORY_EN[category] ?? category) : category;

const BADGE_EN: Record<string, string> = { Novinka: 'New', Tip: 'Our pick', Akcia: 'Offer' };
export const badgeName = (badge: string, locale: Locale) =>
	locale === 'en' ? (BADGE_EN[badge] ?? badge) : badge;

/** The 14 EU allergens, numbered as in Annex II of Regulation 1169/2011. */
export const ALLERGENS_EN: Record<number, string> = {
	1: 'Cereals containing gluten',
	2: 'Crustaceans',
	3: 'Eggs',
	4: 'Fish',
	5: 'Peanuts',
	6: 'Soybeans',
	7: 'Milk',
	8: 'Nuts',
	9: 'Celery',
	10: 'Mustard',
	11: 'Sesame seeds',
	12: 'Sulphur dioxide and sulphites',
	13: 'Lupin',
	14: 'Molluscs'
};

export const ui = {
	sk: {
		home: 'Domov',
		menu: 'Menu',
		events: 'Program',
		blog: 'Blog',
		archive: 'Archív akcií',
		reservation: 'Rezervácia',
		bookTable: 'Rezervovať stôl',
		openMenu: 'Otvoriť menu',
		closeMenu: 'Zavrieť menu',
		mainNav: 'Hlavná navigácia',
		mobileNav: 'Mobilná navigácia',
		skipToContent: 'Preskočiť na obsah',
		homeLink: 'domov',
		languageSwitch: 'English',
		languageSwitchLabel: 'Switch to English',
		openUntil: (time: string) => `Otvorené do ${time}`,
		closed: 'Zatvorené',
		opens: (when: string, time: string) => `Otvárame ${when} o ${time}`,
		today: 'dnes',
		tomorrow: 'zajtra',
		todayTag: 'Dnes',
		navigation: 'Navigácia',
		openingHours: 'Otváracie hodiny',
		contact: 'Kontakt',
		privacy: 'Ochrana osobných údajov',
		opensInNewWindow: 'otvorí sa v novom okne'
	},
	en: {
		home: 'Home',
		menu: 'Menu',
		events: 'Events',
		blog: 'Blog',
		archive: 'Past events',
		reservation: 'Book a table',
		bookTable: 'Book a table',
		openMenu: 'Open menu',
		closeMenu: 'Close menu',
		mainNav: 'Main navigation',
		mobileNav: 'Mobile navigation',
		skipToContent: 'Skip to content',
		homeLink: 'home',
		languageSwitch: 'Slovensky',
		languageSwitchLabel: 'Prepnúť do slovenčiny',
		openUntil: (time: string) => `Open until ${time}`,
		closed: 'Closed',
		opens: (when: string, time: string) => `Opens ${when} at ${time}`,
		today: 'today',
		tomorrow: 'tomorrow',
		todayTag: 'Today',
		navigation: 'Navigation',
		openingHours: 'Opening hours',
		contact: 'Contact',
		privacy: 'Privacy policy',
		opensInNewWindow: 'opens in a new window'
	}
} satisfies Record<Locale, Record<string, unknown>>;

export const onDay = (day: DayKey, locale: Locale, slovak: Record<DayKey, string>) =>
	locale === 'en' ? EN_ON_DAY[day] : slovak[day];
