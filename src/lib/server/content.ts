import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import { localDate, parseContentDate } from '#lib/dates.ts';
import { hasStarted, nextWeeklyOccurrence } from '#lib/events.ts';
import { DAY_KEYS, parseTime } from '#lib/hours.ts';
import { pictureHtml } from '#lib/images.ts';
import type {
	Allergen,
	DayKey,
	DrinkItem,
	EventDetail,
	EventSummary,
	FoodItem,
	GalleryItem,
	Homepage,
	HoursEntry,
	InfoLink,
	MenuInfo,
	Notice,
	PostDetail,
	PostSummary,
	Settings,
	Social
} from '#lib/types.ts';

// Content is edited through Decap CMS and committed to the repo, so it is bundled at build time.
const dataFiles = import.meta.glob<string>('/data/*.yaml', {
	query: '?raw',
	import: 'default',
	eager: true
});
const eventFiles = import.meta.glob<string>('/content/events/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});
const postFiles = import.meta.glob<string>('/content/blog/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const record = (value: unknown): Raw => (isRecord(value) ? value : {});
const text = (value: unknown): string =>
	typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
const optionalText = (value: unknown): string | undefined => text(value) || undefined;
const bool = (value: unknown): boolean => value === true;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const optionalNumber = (value: unknown): number | undefined =>
	typeof value === 'number' && Number.isFinite(value) ? value : undefined;

function readData(name: string): Raw {
	const raw = dataFiles[`/data/${name}.yaml`];
	if (raw === undefined) throw new Error(`Missing data file data/${name}.yaml`);
	return record(parseYaml(raw));
}

const items = (name: string) => list(readData(name).items).map(record);

export function getSettings(): Settings {
	const data = readData('settings');
	const company = record(data.company);
	return {
		name: text(data.name) || 'Archa Pub',
		street: text(data.street),
		postalCode: text(data.postal_code),
		city: text(data.city),
		mapsUrl: text(data.maps_url),
		latitude: optionalNumber(data.latitude),
		longitude: optionalNumber(data.longitude),
		phone: text(data.phone),
		email: text(data.email),
		description: text(data.description),
		descriptionEn: text(data.description_en),
		company: {
			name: text(company.name),
			address: text(company.address),
			ico: text(company.ico),
			dic: text(company.dic),
			register: text(company.register)
		}
	};
}

const isDayKey = (value: unknown): value is DayKey => DAY_KEYS.includes(value as DayKey);

export function getHours(): HoursEntry[] {
	const entries = items('hours').map((item) => ({
		label: text(item.label),
		days: list(item.days).filter(isDayKey),
		opens: text(item.opens),
		closes: text(item.closes),
		highlight: bool(item.highlight)
	}));
	// Fail the build rather than silently showing wrong hours or rejecting reservations
	for (const entry of entries) {
		const valid =
			entry.days.length > 0 &&
			parseTime(entry.opens) !== undefined &&
			parseTime(entry.closes) !== undefined;
		if (!valid) throw new Error(`data/hours.yaml: invalid entry ${JSON.stringify(entry)}`);
	}
	return entries;
}

export const getSocials = (): Social[] =>
	items('socials')
		.map((item) => ({ name: text(item.name), icon: text(item.icon), url: text(item.url) }))
		.filter((social) => social.url);

export const getNotices = (): Notice[] =>
	items('notices')
		.map((item) => ({ text: text(item.text), urgent: bool(item.urgent) }))
		.filter((notice) => notice.text);

export function getHomepage(): Homepage {
	const data = readData('homepage');
	const hero = record(data.hero);
	const story = record(data.story);
	const en = record(data.en);
	const games = record(data.games);
	return {
		hero: {
			image: optionalText(hero.background_image),
			tag: text(hero.tag),
			title: text(hero.title),
			subtitle: text(hero.subtitle)
		},
		highlights: list(data.highlights).map(text).filter(Boolean),
		story: { title: text(story.title), text: text(story.text), image: optionalText(story.image) },
		locationImage: optionalText(data.location_image),
		games: { title: text(games.title), text: text(games.text), image: optionalText(games.image) },
		en: {
			title: text(en.title),
			subtitle: text(en.subtitle),
			highlights: list(en.highlights).map(text).filter(Boolean),
			storyTitle: text(en.story_title),
			storyText: text(en.story_text),
			gamesTitle: text(en.games_title),
			gamesText: text(en.games_text)
		}
	};
}

export const getGallery = (): GalleryItem[] =>
	items('gallery')
		.map((item) => ({
			image: text(item.image),
			caption: text(item.caption),
			captionEn: text(item.caption_en)
		}))
		.filter((item) => item.image);

const parseAllergens = (value: unknown): number[] =>
	text(value)
		.split(/[\s,;]+/)
		.map(Number)
		.filter((id) => Number.isInteger(id) && id > 0);

function toFood(item: Raw): FoodItem {
	return {
		name: text(item.name),
		desc: text(item.desc),
		weight: text(item.weight),
		price: text(item.price),
		category: text(item.category) || 'Ostatné',
		allergens: parseAllergens(item.allergens),
		badge: text(item.badge)
	};
}

function toDrink(item: Raw): DrinkItem {
	return {
		name: text(item.name),
		volume: text(item.volume),
		price: text(item.price),
		category: text(item.category) || 'Ostatné',
		tap: bool(item.tap),
		badge: text(item.badge)
	};
}

export const getFood = (): FoodItem[] =>
	items('food')
		.map(toFood)
		.filter((item) => item.name);
export const getDrinks = (): DrinkItem[] =>
	items('drinks')
		.map(toDrink)
		.filter((item) => item.name);

export function getBestsellers() {
	const food = readData('bestsellers_food');
	return {
		foodImage: optionalText(food.image),
		food: list(food.items)
			.map(record)
			.map(toFood)
			.filter((item) => item.name),
		drinks: items('bestsellers_drinks')
			.map(toDrink)
			.filter((item) => item.name)
	};
}

export const getAllergens = (): Allergen[] =>
	items('allergens')
		.map((item) => ({ id: Number(item.id), name: text(item.name) }))
		.filter((allergen) => Number.isInteger(allergen.id) && allergen.name);

export function getMenuInfo(): MenuInfo {
	const data = readData('menu_info');
	const banner = record(data.banner);
	const status = record(data.status);
	return {
		heroImage: optionalText(data.hero_image),
		tapImage: optionalText(data.tap_image),
		enabled: bool(data.enabled),
		banner: {
			image: optionalText(banner.image),
			title: text(banner.title),
			text: text(banner.text)
		},
		status: { title: text(status.title), time: text(status.time) }
	};
}

export const getInfoLinks = (): InfoLink[] =>
	items('info')
		.map((item) => ({
			title: text(item.title),
			subtitle: text(item.subtitle),
			url: text(item.url),
			icon: text(item.icon),
			highlight: bool(item.highlight)
		}))
		.filter((link) => link.title && link.url);

// --- Markdown collections ---

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const markdown = new Marked({
	renderer: {
		image({ href, text: alt }) {
			return pictureHtml(href, alt);
		}
	}
});

interface Entry {
	slug: string;
	attrs: Raw;
	body: string;
	date: Date;
}

function readCollection(files: Record<string, string>, collection: string): Entry[] {
	return Object.entries(files)
		.filter(([path]) => !path.endsWith('/_index.md'))
		.map(([path, raw]) => {
			const slug = path.slice(path.lastIndexOf('/') + 1, -'.md'.length);
			const match = FRONT_MATTER.exec(raw);
			const attrs = match ? record(parseYaml(match[1])) : {};
			const body = match ? match[2] : raw;
			const date = parseContentDate(attrs.date);
			if (!date) throw new Error(`content/${collection}/${slug}.md: missing or invalid "date"`);
			if (!text(attrs.title)) throw new Error(`content/${collection}/${slug}.md: missing "title"`);
			return { slug, attrs, body, date };
		})
		.filter((entry) => entry.attrs.draft !== true);
}

const renderMarkdown = (body: string) => markdown.parse(body, { async: false });

const isWeekly = (entry: Entry) => entry.attrs.repeat === 'weekly';
const repeatUntil = (entry: Entry) => {
	const until = parseContentDate(entry.attrs.repeat_until);
	return until && localDate(until.toISOString());
};

/** The date to show: the next occurrence for weekly events, otherwise the start. */
const occurrence = (entry: Entry, now: Date): Date | undefined =>
	isWeekly(entry)
		? nextWeeklyOccurrence(entry.date, now, repeatUntil(entry))
		: hasStarted(entry.date, now)
			? undefined
			: entry.date;

function toEventSummary(entry: Entry, date = entry.date): EventSummary {
	const { slug, attrs } = entry;
	const end = parseContentDate(attrs.end);
	return {
		slug,
		title: text(attrs.title),
		date: date.toISOString(),
		category: text(attrs.category),
		image: optionalText(attrs.image),
		description: text(attrs.description),
		// For weekly events the end is shifted along with the occurrence
		end: end && new Date(end.getTime() + (date.getTime() - entry.date.getTime())).toISOString(),
		price: text(attrs.price),
		weekly: isWeekly(entry)
	};
}

const events = () =>
	readCollection(eventFiles, 'events').sort((a, b) => a.date.getTime() - b.date.getTime());

export function getUpcomingEvents(now = new Date()): EventSummary[] {
	return events()
		.flatMap((entry) => {
			const next = occurrence(entry, now);
			return next ? [toEventSummary(entry, next)] : [];
		})
		.sort((a, b) => a.date.localeCompare(b.date));
}

export const getPastEvents = (now = new Date()): EventSummary[] =>
	events()
		.filter((entry) => !occurrence(entry, now))
		.reverse()
		.map((entry) => toEventSummary(entry));

export const getAllEvents = (): EventSummary[] => events().map((entry) => toEventSummary(entry));

export function getEvent(slug: string, now = new Date()): EventDetail | undefined {
	const entry = events().find((candidate) => candidate.slug === slug);
	if (!entry) return undefined;
	const date = (isWeekly(entry) && occurrence(entry, now)) || entry.date;
	return { ...toEventSummary(entry, date), html: renderMarkdown(entry.body) };
}

const WORDS_PER_MINUTE = 200;

function toPostSummary({ slug, attrs, body, date }: Entry): PostSummary {
	const words = body.split(/\s+/).filter(Boolean).length;
	return {
		slug,
		title: text(attrs.title),
		date: date.toISOString(),
		image: optionalText(attrs.image),
		description: text(attrs.description),
		readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE))
	};
}

const posts = () =>
	readCollection(postFiles, 'blog').sort((a, b) => b.date.getTime() - a.date.getTime());

export const getPosts = (): PostSummary[] => posts().map(toPostSummary);

export function getPost(slug: string): PostDetail | undefined {
	const entry = posts().find((candidate) => candidate.slug === slug);
	return entry && { ...toPostSummary(entry), html: renderMarkdown(entry.body) };
}
