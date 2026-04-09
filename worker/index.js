const ALLOWED_ORIGIN = 'https://archapub.sk';

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : '',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Metóda nie je povolená.' }, 405, origin);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: 'Neplatný formát dát.' }, 400, origin);
    }

    const { meno, email, telefon, datum, cas, pocet_osob, poznamka } = data;

    // Validácia povinných polí
    if (!meno?.trim() || !email?.trim() || !datum || !cas || !pocet_osob) {
      return json({ error: 'Vyplňte prosím všetky povinné polia.' }, 422, origin);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Neplatná emailová adresa.' }, 422, origin);
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #161812; color: #f2f2f2; border-radius: 16px; overflow: hidden;">
        <div style="background: #2a5231; padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 24px; color: #cfa34b; letter-spacing: 0.05em;">ARCHA PUB</h1>
          <p style="margin: 4px 0 0; color: #e3cbb3; font-size: 13px; opacity: 0.8;">Nová rezervácia stola</p>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; width: 140px;">Meno</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px;">${esc(meno)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px;">${esc(email)}</td>
            </tr>
            ${telefon ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Telefón</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px;">${esc(telefon)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Dátum</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px; color: #cfa34b; font-weight: bold;">${esc(datum)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Čas</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px; color: #cfa34b; font-weight: bold;">${esc(cas)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Počet osôb</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px;">${esc(String(pocet_osob))}</td>
            </tr>
            ${poznamka ? `
            <tr>
              <td style="padding: 10px 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Poznámka</td>
              <td style="padding: 10px 0; font-size: 15px; color: #e3cbb3;">${esc(poznamka)}</td>
            </tr>` : ''}
          </table>
        </div>
        <div style="padding: 16px 32px; background: rgba(0,0,0,0.3); font-size: 11px; color: rgba(255,255,255,0.3); text-align: center;">
          Archa Pub · Prešov · archapub.sk
        </div>
      </div>
    `;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Archa Pub Rezervácie <${env.FROM_EMAIL}>`,
          to: [env.TO_EMAIL],
          reply_to: email,
          subject: `Rezervácia — ${meno}, ${datum} ${cas}`,
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error:', err);
        return json({ error: 'Nepodarilo sa odoslať rezerváciu. Skúste neskôr.' }, 500, origin);
      }

      return json({ success: true }, 200, origin);
    } catch (err) {
      console.error('Worker error:', err);
      return json({ error: 'Nepodarilo sa odoslať rezerváciu. Skúste neskôr.' }, 500, origin);
    }
  },
};

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
