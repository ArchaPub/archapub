<script lang="ts">
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const company = $derived(data.settings.company);
</script>

<Seo
	title="Ochrana osobných údajov"
	description="Ako Archa Pub spracúva osobné údaje z rezervačného formulára."
/>

<div class="wrapper">
	<div class="mx-auto max-w-3xl">
		<PageHeader title="Ochrana osobných údajov" />

		<div class="prose-archa">
			<h2>Prevádzkovateľ</h2>
			<p>
				{company.name}, {company.address}, IČO: {company.ico}, zapísaná v registri: {company.register}.
				Kontakt: <a href="mailto:{data.settings.email}">{data.settings.email}</a>, {data.settings
					.phone}.
			</p>

			<h2>Aké údaje spracúvame a prečo</h2>
			<p>
				Pri rezervácii stola cez formulár spracúvame meno, email, telefónne číslo (ak ho uvediete),
				termín, počet osôb a poznámku. Údaje použijeme výlučne na vybavenie a potvrdenie rezervácie.
				Právnym základom je vykonanie opatrení pred uzavretím zmluvy na vašu žiadosť (čl. 6 ods. 1
				písm. b) nariadenia GDPR).
			</p>
			<p>
				Údaje z formulára sa odosielajú emailom prostredníctvom služby Resend a formulár je chránený
				pred automatizovanými robotmi službou Cloudflare Turnstile. Tieto služby údaje spracúvajú
				ako sprostredkovatelia.
			</p>

			<h2>Ako dlho ich uchovávame</h2>
			<p>
				Údaje uchovávame len po dobu potrebnú na vybavenie rezervácie, pokiaľ nám zákon neukladá
				inak.
			</p>

			<h2>Vaše práva</h2>
			<p>
				Máte právo na prístup k svojim údajom, ich opravu, vymazanie, obmedzenie spracúvania a právo
				namietať. Stačí nám napísať na <a href="mailto:{data.settings.email}"
					>{data.settings.email}</a
				>. Sťažnosť môžete podať aj na Úrad na ochranu osobných údajov Slovenskej republiky.
			</p>

			<h2>Cookies a analytika</h2>
			<p>Táto stránka nepoužíva reklamné ani analytické cookies.</p>
		</div>
	</div>
</div>
