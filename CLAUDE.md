# CLAUDE.md — Archa Pub Website

## Projekt

Webová stránka pre **Archa Pub** (Prešov) — Hugo static site s Tailwind CSS v4 a Decap CMS.

- **URL:** https://archapub.sk
- **Jazyk:** slovenčina (`sk`)

## Tech Stack

- **Hugo** — static site generator
- **Tailwind CSS v4** (`@tailwindcss/cli` + `@tailwindcss/typography`)
- **Decap CMS** — content management cez YAML data súbory

## Štruktúra projektu

```
config/_default/hugo.toml   # Hugo konfigurácia
app.css                     # Tailwind vstupný súbor (theme, komponenty)
assets/style.css            # Generovaný CSS (v .gitignore)
data/                       # YAML dátové súbory (menu, settings, homepage...)
content/                    # Markdown obsah (blog, events, archive, menu)
layouts/                    # Hugo šablóny
  _default/                 # baseof, index, list, menu, render-image
  blog/                     # list, single
  events/                   # list, single
  archive/                  # list
  partials/                 # navbar, schema
static/                     # Statické assets (obrázky, fonty)
```

## Dôležité súbory

| Súbor | Účel |
|---|---|
| `data/settings.yaml` | Kontaktné údaje, SEO popis, kľúčové slová |
| `data/homepage.yaml` | Hero sekcia, príbeh pubu |
| `data/drinks.yaml` | Nápojový lístok |
| `data/food.yaml` | Jedálny lístok |
| `data/hours.yaml` | Otváracie hodiny |
| `data/socials.yaml` | Sociálne siete |
| `data/notices.yaml` | Oznámenia |
| `app.css` | Design systém — farby, fonty, card/btn/tag komponenty |

## Design systém

### Farby (definované v `app.css` @theme)

- `--color-archa-bg: #0c0e08` — pozadie
- `--color-archa-green: #2a5231` — hlavná zelená
- `--color-archa-beige: #e3cbb3` — béžová
- `--color-archa-gold: #cfa34b` — zlatá (akcenty)
- `--color-archa-dark: #161812` — tmavá

### Fonty

- **Headings:** `Fjalla One`
- **Body:** `Clash Display`

### CSS komponenty

`.card`, `.btn`, `.btn-light`, `.btn-dark`, `.tag`, `.list-row`, `.notice-card`, `.date-badge`, `.wrapper`

## Príkazy

```bash
# Build CSS
npx @tailwindcss/cli -i app.css -o assets/style.css

# Dev server
hugo server

# Build CSS + Hugo
npm run build

```

## Konvencie

- **Obsah sa edituje cez YAML** v `data/` — nie priamo v šablónach
- **Tailwind v4** — používa `@theme`, `@layer components`, `@source`
- **Šablóny** používajú Hugo template syntax (`{{ }}`)
- **Bento-grid layout** na homepage
- Komunikácia iba cez email — žiadne telefonáty v CTA
- Slovenčina vo všetkom obsahu
