# Archa Pub

Web [archapub.sk](https://archapub.sk): SvelteKit na Cloudflare Workers, obsah cez Decap CMS (`/admin`).

## Vývoj

```sh
npm install
cp .dev.vars.example .dev.vars   # testovacie kľúče pre Turnstile
npm run dev
```

- `npm run check` – typy, `npm test` – unit testy, `npm run lint` – Prettier
- `npm run gen` – po zmene `wrangler.jsonc` pregeneruje typy pre Cloudflare (bez build výstupu, `rm -rf .svelte-kit/cloudflare`)
- `npm run build && npm run preview` – produkčný build lokálne vo `wrangler dev`

## Obsah

- `data/*.yaml` – nastavenia, otváracie hodiny, menu, oznamy… (upravuje sa v CMS)
- `content/events`, `content/blog` – akcie a články v Markdowne
- `src/lib/media` – obrázky nahraté cez CMS; pri builde sa zmenšia a skonvertujú na AVIF/WebP. V obsahu sa odkazujú ako `/img/<súbor>`.

Domovská stránka, program a archív sa renderujú pri každej požiadavke, aby minulé akcie zmizli bez nového deployu. Ostatné stránky sú predgenerované.

## Náhľady pri zdieľaní

`scripts/og.ts` pri každom builde vyrenderuje značkové obrázky 1200×630 pre všetky stránky, akcie a články do `static/og/` (necommituje sa). Ručne: `npm run og`.

## Rezervácie

Formulár na `/rezervacia` overuje Turnstile, obmedzuje počet pokusov (rate limit binding) a posiela email cez Resend. Povolené časy sa počítajú z otváracích hodín v `data/hours.yaml`.

Konfigurácia je vo `wrangler.jsonc` (`vars`). Tajomstvá:

```sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

`TURNSTILE_SITE_KEY` vo `wrangler.jsonc` treba pred nasadením nahradiť kľúčom skutočného widgetu.

## Nasadenie

`npx wrangler deploy` po `npm run build`, alebo Workers Builds napojené na GitHub repo (build `npm run build`, deploy `npx wrangler deploy`).
