/* global CMS, h, createClass */
// Decap CMS preview panes: how an entry looks on the site, in Google and when shared.

const SITE = 'archapub.sk';
const SITE_NAME = 'Archa Pub';
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

const dateFormat = new Intl.DateTimeFormat('sk-SK', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'Europe/Bratislava'
});
const timeFormat = new Intl.DateTimeFormat('sk-SK', {
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Europe/Bratislava'
});

function parseDate(value) {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function truncate(text, limit) {
	return text.length > limit ? text.slice(0, limit - 1).trimEnd() + '…' : text;
}

function counter(label, text, ideal, max) {
	const length = text.length;
	const state = length === 0 ? 'bad' : length > max ? 'bad' : length < ideal ? 'warn' : 'ok';
	const hint =
		length === 0
			? 'chýba'
			: length > max
				? 'príliš dlhé, Google to oreže'
				: length < ideal
					? 'mohlo by byť dlhšie'
					: 'v poriadku';
	return h('li', { className: 'counter counter-' + state }, `${label}: ${length} znakov – ${hint}`);
}

/** The same branded card scripts/og.ts renders at build time, drawn in HTML. */
function ogCard({ eyebrow, title, date, image, poster }) {
	return h(
		'div',
		{ className: 'og' + (poster ? ' og-poster' : '') },
		image && !poster ? h('img', { className: 'og-bg', src: image, alt: '' }) : null,
		h('div', { className: 'og-shade' }),
		h('div', { className: 'og-rule' }),
		h(
			'div',
			{ className: 'og-body' },
			h('div', { className: 'og-top' }, h('img', { src: '/logo.svg', alt: '' }), h('span', {}, eyebrow)),
			h(
				'div',
				{ className: 'og-main' },
				date ? h('div', { className: 'og-date' }, date) : null,
				h('div', { className: 'og-title' }, title || SITE_NAME)
			),
			h('div', { className: 'og-footer' }, h('span', { className: 'og-pill' }, SITE), 'Hlavná 23 · Prešov')
		),
		poster ? h('img', { className: 'og-poster-img', src: poster, alt: '' }) : null
	);
}

function seoPreview({ title, description, path, image, card }) {
	const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
	const crumbs = [SITE].concat(path.split('/').filter(Boolean)).join(' › ');
	return h(
		'section',
		{ className: 'seo' },
		h('h2', { className: 'seo-heading' }, 'Ako to uvidia v Google a pri zdieľaní'),
		h(
			'div',
			{ className: 'serp' },
			h(
				'div',
				{ className: 'serp-site' },
				h('img', { src: '/favicon-32x32.png', alt: '' }),
				h('div', {}, h('div', { className: 'serp-name' }, SITE_NAME), h('div', { className: 'serp-url' }, crumbs))
			),
			h('div', { className: 'serp-title' }, truncate(fullTitle, TITLE_LIMIT)),
			h(
				'div',
				{ className: 'serp-description' },
				description ? truncate(description, DESCRIPTION_LIMIT) : 'Bez popisu si Google vyberie náhodný text zo stránky.'
			)
		),
		h(
			'div',
			{ className: 'social' },
			card ? ogCard(card) : h('img', { className: 'social-image', src: image || '/og.jpg', alt: '' }),
			h(
				'div',
				{ className: 'social-body' },
				h('div', { className: 'social-domain' }, SITE.toUpperCase()),
				h('div', { className: 'social-title' }, title || SITE_NAME),
				h('div', { className: 'social-description' }, truncate(description || '', 110))
			)
		),
		h(
			'ul',
			{ className: 'counters' },
			counter('Nadpis v Google', fullTitle, 30, TITLE_LIMIT),
			counter('Popis', description || '', 70, DESCRIPTION_LIMIT)
		)
	);
}

const fieldText = (entry, name) => String(entry.getIn(['data', name]) || '').trim();
const assetUrl = (props, name) => {
	const value = props.entry.getIn(['data', name]);
	return value ? props.getAsset(value).toString() : '';
};

const EventPreview = createClass({
	render() {
		const { entry } = this.props;
		const title = fieldText(entry, 'title');
		const description = fieldText(entry, 'description');
		const date = parseDate(entry.getIn(['data', 'date']));
		const image = assetUrl(this.props, 'image');
		const slug = entry.get('slug') || 'nova-akcia';
		return h(
			'div',
			{ className: 'page' },
			h(
				'article',
				{ className: 'event' },
				image ? h('img', { className: 'event-poster', src: image, alt: '' }) : h('div', { className: 'event-poster event-poster-empty' }, 'Bez plagátu'),
				h(
					'div',
					{ className: 'event-body' },
					entry.getIn(['data', 'category']) ? h('span', { className: 'tag' }, entry.getIn(['data', 'category'])) : null,
					h('h1', {}, title || 'Názov akcie'),
					h('p', { className: 'when' }, date ? `${dateFormat.format(date)} · ${timeFormat.format(date)}` : 'Doplňte dátum a čas'),
					description ? h('p', { className: 'lead' }, description) : null,
					h('div', { className: 'prose' }, this.props.widgetFor('body'))
				)
			),
			seoPreview({
				title,
				description,
				path: `/events/${slug}`,
				image,
				card: {
					eyebrow: entry.getIn(['data', 'category']) ? `Program · ${entry.getIn(['data', 'category'])}` : 'Program',
					title,
					date: date
						? entry.getIn(['data', 'repeat']) === 'weekly'
							? `Každý týždeň · ${timeFormat.format(date)}`
							: `${dateFormat.format(date).replace(/ \d{4}$/, '')} · ${timeFormat.format(date)}`
						: '',
					poster: image
				}
			})
		);
	}
});

const BlogPreview = createClass({
	render() {
		const { entry } = this.props;
		const title = fieldText(entry, 'title');
		const description = fieldText(entry, 'description');
		const date = parseDate(entry.getIn(['data', 'date']));
		const image = assetUrl(this.props, 'image');
		const slug = entry.get('slug') || 'novy-clanok';
		return h(
			'div',
			{ className: 'page' },
			h(
				'article',
				{ className: 'post' },
				h('h1', {}, title || 'Názov článku'),
				date ? h('p', { className: 'when' }, dateFormat.format(date)) : null,
				description ? h('p', { className: 'lead' }, description) : null,
				image ? h('img', { className: 'post-image', src: image, alt: '' }) : null,
				h('div', { className: 'prose' }, this.props.widgetFor('body'))
			),
			seoPreview({
				title,
				description,
				path: `/blog/${slug}`,
				image,
				card: { eyebrow: 'Blog', title, image }
			})
		);
	}
});

const SettingsPreview = createClass({
	render() {
		const description = fieldText(this.props.entry, 'description');
		return h(
			'div',
			{ className: 'page' },
			h('p', { className: 'note' }, 'Takto sa zobrazí úvodná stránka webu:'),
			seoPreview({ title: '', description, path: '/', image: '' })
		);
	}
});

const HomepagePreview = createClass({
	render() {
		const { entry, getAsset } = this.props;
		const hero = entry.getIn(['data', 'hero']);
		const image = hero && hero.get('background_image') ? getAsset(hero.get('background_image')).toString() : '';
		const highlights = (entry.getIn(['data', 'highlights']) || []).toJS ? entry.getIn(['data', 'highlights']).toJS() : [];
		return h(
			'div',
			{ className: 'page' },
			h(
				'section',
				{ className: 'hero', style: image ? { backgroundImage: `linear-gradient(to top, #000, rgba(0,0,0,.3)), url(${image})` } : {} },
				hero && hero.get('tag') ? h('span', { className: 'tag tag-gold' }, hero.get('tag')) : null,
				h('h1', {}, hero ? hero.get('title') : ''),
				h('p', {}, hero ? hero.get('subtitle') : '')
			),
			highlights.length ? h('p', { className: 'marquee' }, highlights.join('  ✦  ')) : null
		);
	}
});

CMS.registerPreviewStyle('/admin/preview.css');
CMS.registerPreviewTemplate('events', EventPreview);
CMS.registerPreviewTemplate('blog', BlogPreview);
CMS.registerPreviewTemplate('settings', SettingsPreview);
CMS.registerPreviewTemplate('homepage', HomepagePreview);
