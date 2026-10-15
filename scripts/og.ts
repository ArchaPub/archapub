/**
 * Renders the Open Graph images (link previews on Facebook, WhatsApp, Messenger…)
 * for every page, event and post into static/og/. Runs before `vite build`, so a
 * new event added in the CMS gets its own preview on the next deploy.
 *
 * Usage: node scripts/og.ts
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';
import { formatDateLong, formatTimeOfDay, parseContentDate } from '../src/lib/dates.ts';
import { everyWeekday } from '../src/lib/events.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'static/og');
const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
	bg: '#0c0e08',
	green: '#2a5231',
	gold: '#cfa34b',
	beige: '#e3cbb3',
	white: '#f2f2f2'
};

type Node = { type: string; props: Record<string, unknown> };
type Child = Node | string | null | false;

function h(type: string, style: Record<string, unknown>, ...children: Child[]): Node {
	const kids = children.filter((child): child is Node | string => Boolean(child));
	return { type, props: { style: { display: 'flex', ...style }, children: kids } };
}

const img = (src: string, style: Record<string, unknown>): Node => ({
	type: 'img',
	props: { src, style }
});

const readText = (path: string) => readFile(join(ROOT, path), 'utf8');
const readYaml = async (path: string) =>
	(parseYaml(await readText(path)) ?? {}) as Record<string, any>;

const photoCache = new Map<string, Promise<string | undefined>>();

/** CMS image path (/img/x.jpg or an external URL) → resized JPEG data URI. */
function photo(src: string | undefined, width = WIDTH): Promise<string | undefined> {
	if (!src || !src.startsWith('/img/')) return Promise.resolve(undefined);
	const key = `${src}@${width}`;
	if (!photoCache.has(key)) {
		photoCache.set(
			key,
			sharp(join(ROOT, 'src/lib/media', src.slice('/img/'.length)))
				.rotate()
				.resize({ width, height: HEIGHT, fit: 'cover' })
				.jpeg({ quality: 80 })
				.toBuffer()
				.then((buffer) => `data:image/jpeg;base64,${buffer.toString('base64')}`)
				.catch((error) => {
					console.warn(`og: could not read ${src}: ${error.message}`);
					return undefined;
				})
		);
	}
	return photoCache.get(key)!;
}

interface CardOptions {
	eyebrow: string;
	title: string;
	subtitle?: string;
	background?: string;
	/** Poster shown as a framed card on the right (events) */
	poster?: string;
	/** Big gold date line for events */
	date?: string;
	logo: string;
	footer: string;
}

function card({ eyebrow, title, subtitle, background, poster, date, logo, footer }: CardOptions) {
	const titleSize = title.length > 48 ? 64 : title.length > 28 ? 80 : 96;
	return h(
		'div',
		{
			width: WIDTH,
			height: HEIGHT,
			position: 'relative',
			backgroundColor: COLORS.bg,
			fontFamily: 'Clash Display',
			color: COLORS.white
		},
		background &&
			img(background, {
				position: 'absolute',
				top: 0,
				left: 0,
				width: WIDTH,
				height: HEIGHT,
				objectFit: 'cover'
			}),
		h('div', {
			position: 'absolute',
			top: 0,
			left: 0,
			width: WIDTH,
			height: HEIGHT,
			backgroundImage: poster
				? 'linear-gradient(90deg, rgba(12,14,8,0.97) 0%, rgba(12,14,8,0.9) 55%, rgba(12,14,8,0.75) 100%)'
				: 'linear-gradient(90deg, rgba(12,14,8,0.96) 0%, rgba(12,14,8,0.8) 50%, rgba(12,14,8,0.25) 100%)'
		}),
		// Gold rule along the left edge, like the site's section accents
		h('div', {
			position: 'absolute',
			top: 0,
			left: 0,
			width: 12,
			height: HEIGHT,
			backgroundColor: COLORS.gold
		}),
		h(
			'div',
			{
				position: 'absolute',
				top: 0,
				left: 0,
				width: poster ? 760 : 820,
				height: HEIGHT,
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '56px 0 52px 76px'
			},
			h(
				'div',
				{ alignItems: 'center', gap: 22 },
				img(logo, { width: 92, height: 92 }),
				h(
					'div',
					{
						fontSize: 22,
						fontWeight: 600,
						letterSpacing: 5,
						textTransform: 'uppercase',
						color: COLORS.gold
					},
					eyebrow
				)
			),
			h(
				'div',
				{ flexDirection: 'column', gap: 18 },
				date &&
					h(
						'div',
						{
							fontFamily: 'Fjalla One',
							fontSize: 44,
							color: COLORS.gold,
							textTransform: 'uppercase'
						},
						date
					),
				h(
					'div',
					{
						fontFamily: 'Fjalla One',
						fontSize: titleSize,
						lineHeight: 1,
						textTransform: 'uppercase',
						color: COLORS.white
					},
					title
				),
				subtitle &&
					h('div', { fontSize: 28, lineHeight: 1.35, color: COLORS.beige, maxWidth: 640 }, subtitle)
			),
			h(
				'div',
				{ alignItems: 'center', gap: 18, fontSize: 24, color: 'rgba(242,242,242,0.75)' },
				h(
					'div',
					{
						backgroundColor: COLORS.gold,
						color: '#000',
						fontWeight: 600,
						padding: '8px 18px',
						borderRadius: 999,
						fontSize: 22
					},
					'archapub.sk'
				),
				footer
			)
		),
		poster &&
			img(poster, {
				position: 'absolute',
				top: 60,
				right: 60,
				width: 380,
				height: 510,
				objectFit: 'cover',
				borderRadius: 28,
				border: `4px solid ${COLORS.gold}`
			})
	);
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

async function readCollection(folder: string) {
	const dir = join(ROOT, 'content', folder);
	const files = (await readdir(dir)).filter((file) => file.endsWith('.md') && file !== '_index.md');
	return Promise.all(
		files.map(async (file) => {
			const match = FRONT_MATTER.exec(await readFile(join(dir, file), 'utf8'));
			const attrs = (match ? parseYaml(match[1]) : {}) as Record<string, any>;
			return { slug: file.slice(0, -3), attrs };
		})
	);
}

const shorten = (text: string, max: number) =>
	text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

async function main() {
	const [settings, homepage, menuInfo, gallery, drinks, fonts, logoSvg] = await Promise.all([
		readYaml('data/settings.yaml'),
		readYaml('data/homepage.yaml'),
		readYaml('data/menu_info.yaml'),
		readYaml('data/gallery.yaml'),
		readYaml('data/drinks.yaml'),
		Promise.all(
			[
				['Fjalla One', 'FjallaOne-Regular.ttf', 400],
				['Clash Display', 'clash-display-400.woff', 400],
				['Clash Display', 'clash-display-600.woff', 600]
			].map(async ([name, file, weight]) => ({
				name: name as string,
				data: await readFile(join(ROOT, 'scripts/og-fonts', file as string)),
				weight: weight as 400 | 600,
				style: 'normal' as const
			}))
		),
		readText('static/logo.svg')
	]);

	const logo = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;
	const footer = `${settings.street} · ${settings.city}`;
	const galleryImage = (index: number) => gallery.items?.[index]?.image as string | undefined;
	const hero = await photo(homepage.hero?.background_image);
	const bar = await photo(menuInfo.hero_image ?? galleryImage(1));
	const games = await photo(homepage.games?.image);
	const entrance = await photo(homepage.location_image);
	const fireplace = await photo(homepage.story?.image);
	const en = homepage.en ?? {};
	const taps = [
		...new Set(
			((drinks.items ?? []) as Record<string, any>[])
				.filter((item) => item.tap && item.category === 'Pivo')
				.map((item) => String(item.name).replace(/\s*\d+°$/, ''))
		)
	].join(', ');

	const pages: [string, CardOptions][] = [
		[
			'home',
			{
				eyebrow: 'Pub · Prešov centrum',
				title: homepage.hero?.title ?? 'Archa Pub',
				subtitle: 'Čapované pivo, šípky a stolný futbal. Otvorené každý deň do rána.',
				background: hero,
				logo,
				footer
			}
		],
		[
			'en',
			{
				eyebrow: 'Pub · Prešov city centre',
				title: en.title ?? 'Archa Pub',
				subtitle: 'Beer on tap, darts and table football. Open every night until late.',
				background: hero,
				logo,
				footer
			}
		],
		[
			'menu',
			{
				eyebrow: 'Nápojový lístok',
				title: 'Na čape aj vo fľaši',
				subtitle: `${taps ? `${taps}, ` : ''}víno, destiláty a niečo k pivu.`,
				background: bar,
				logo,
				footer
			}
		],
		[
			'en/menu',
			{
				eyebrow: 'Drinks & food',
				title: 'On tap and by the bottle',
				subtitle: `${taps ? `${taps}, ` : ''}wine, spirits and bar snacks.`,
				background: bar,
				logo,
				footer
			}
		],
		[
			'events',
			{
				eyebrow: 'Program',
				title: 'Čo sa u nás chystá',
				subtitle: 'Párty, koncerty, kvízy a šport pod klenbou na Hlavnej.',
				background: hero,
				logo,
				footer
			}
		],
		[
			'archive',
			{
				eyebrow: 'Archív akcií',
				title: 'Čo sme už zažili',
				background: hero,
				logo,
				footer
			}
		],
		[
			'blog',
			{
				eyebrow: 'Blog',
				title: 'Z nášho blogu',
				subtitle: 'Novinky a zaujímavosti o pive z Archa Pubu.',
				background: fireplace,
				logo,
				footer
			}
		],
		[
			'rezervacia',
			{
				eyebrow: 'Rezervácia',
				title: 'Rezervujte si stôl',
				subtitle: 'Online za minútu – na oslavu, partiu šípok alebo len na pivo s priateľmi.',
				background: fireplace,
				logo,
				footer
			}
		],
		[
			'en/reservation',
			{
				eyebrow: 'Book a table',
				title: 'Book your table',
				subtitle: 'Book online in a minute – birthdays, darts nights or just a pint.',
				background: fireplace,
				logo,
				footer
			}
		],
		[
			'info',
			{
				eyebrow: 'Archa Pub',
				title: 'Všetko na jednom mieste',
				subtitle: 'Menu, program, rezervácia a cesta k nám.',
				background: entrance,
				logo,
				footer
			}
		],
		[
			'ochrana-sukromia',
			{
				eyebrow: 'Archa Pub',
				title: 'Ochrana osobných údajov',
				background: games,
				logo,
				footer
			}
		]
	];

	for (const { slug, attrs } of await readCollection('events')) {
		if (attrs.draft === true) continue;
		const start = parseContentDate(attrs.date);
		if (!start) continue;
		const iso = start.toISOString();
		const date =
			attrs.repeat === 'weekly'
				? `${everyWeekday(iso)} · ${formatTimeOfDay(iso)}`
				: `${formatDateLong(iso)} · ${formatTimeOfDay(iso)}`;
		const poster = await photo(attrs.image, 760);
		pages.push([
			`events/${slug}`,
			{
				eyebrow: attrs.category ? `Program · ${attrs.category}` : 'Program',
				title: shorten(String(attrs.title ?? ''), 70),
				date,
				subtitle: attrs.price ? String(attrs.price) : undefined,
				background: poster ? undefined : hero,
				poster,
				logo,
				footer
			}
		]);
	}

	for (const { slug, attrs } of await readCollection('blog')) {
		if (attrs.draft === true) continue;
		pages.push([
			`blog/${slug}`,
			{
				eyebrow: 'Blog',
				title: shorten(String(attrs.title ?? ''), 80),
				background: (await photo(attrs.image)) ?? fireplace,
				logo,
				footer
			}
		]);
	}

	await rm(OUT, { recursive: true, force: true });
	for (const [path, options] of pages) {
		const svg = await satori(card(options) as any, { width: WIDTH, height: HEIGHT, fonts });
		const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
		const jpeg = await sharp(png).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
		const file = join(OUT, `${path}.jpg`);
		await mkdir(dirname(file), { recursive: true });
		await writeFile(file, jpeg);
	}
	console.log(`og: rendered ${pages.length} images into static/og/`);
}

await main();
