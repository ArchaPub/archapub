export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface HoursEntry {
	label: string;
	days: DayKey[];
	/** HH:MM */
	opens: string;
	/** HH:MM; earlier than `opens` means after midnight */
	closes: string;
	highlight: boolean;
}

export interface Company {
	name: string;
	address: string;
	ico: string;
	dic: string;
	register: string;
}

export interface Settings {
	name: string;
	street: string;
	postalCode: string;
	city: string;
	mapsUrl: string;
	latitude?: number;
	longitude?: number;
	phone: string;
	email: string;
	description: string;
	descriptionEn: string;
	company: Company;
}

export interface Social {
	name: string;
	icon: string;
	url: string;
}

export interface Notice {
	text: string;
	urgent: boolean;
}

export interface Homepage {
	hero: { image?: string; tag: string; title: string; subtitle: string };
	highlights: string[];
	story: { title: string; text: string; image?: string };
	locationImage?: string;
	games: { title: string; text: string; image?: string };
	en: {
		title: string;
		subtitle: string;
		highlights: string[];
		storyTitle: string;
		storyText: string;
		gamesTitle: string;
		gamesText: string;
	};
}

export interface GalleryItem {
	image: string;
	caption: string;
	captionEn: string;
}

export interface FoodItem {
	name: string;
	desc: string;
	weight: string;
	price: string;
	category: string;
	allergens: number[];
	badge: string;
}

export interface DrinkItem {
	name: string;
	volume: string;
	price: string;
	category: string;
	/** Served on draught */
	tap: boolean;
	badge: string;
}

export interface Allergen {
	id: number;
	name: string;
}

export interface MenuInfo {
	heroImage?: string;
	tapImage?: string;
	enabled: boolean;
	banner: { image?: string; title: string; text: string };
	status: { title: string; time: string };
}

export interface InfoLink {
	title: string;
	subtitle: string;
	url: string;
	icon: string;
	highlight: boolean;
}

export interface EventSummary {
	slug: string;
	title: string;
	/** ISO 8601 instant */
	date: string;
	category: string;
	image?: string;
	description: string;
	/** ISO 8601 instant */
	end?: string;
	/** Entry fee as written by the editor, e.g. "Vstup zdarma" */
	price: string;
	/** Repeats every week on the same day and time; `date` is then the next occurrence */
	weekly: boolean;
}

export interface EventDetail extends EventSummary {
	html: string;
}

export interface PostSummary {
	slug: string;
	title: string;
	/** ISO 8601 instant */
	date: string;
	image?: string;
	description: string;
	readingMinutes: number;
}

export interface PostDetail extends PostSummary {
	html: string;
}
