// POST /api/rfq — request for quotation.
// Saves the request to D1 (binding "DB") and/or sends it to Telegram
// (secrets TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID). Without either, it answers 503 and the
// site falls back to opening WhatsApp with the same text.

const FIELDS = ['name', 'company', 'phone', 'email', 'product', 'quantity', 'location', 'budget', 'message', 'lang', 'page'];
const MAX = { name: 120, company: 160, phone: 40, email: 160, product: 200, quantity: 80, location: 120, budget: 120, message: 3000, lang: 5, page: 300 };
const LABELS = { name: 'Անուն', company: 'Ընկերություն', phone: 'Հեռախոս', email: 'Էլ. փոստ', product: 'Ապրանք', quantity: 'Քանակ', location: 'Քաղաք/երկիր', budget: 'Բյուջե', message: 'Մանրամասներ', page: 'Էջ' };

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

export async function handleRfq(request, env) {
  // same-origin only
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: 'origin' }, 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400);
  }
  if (body.website) return json({ ok: true }); // honeypot: pretend success for bots

  const d = Object.fromEntries(FIELDS.map((f) => [f, clean(body[f], MAX[f])]));
  if (!d.name || !d.phone || d.phone.replace(/\D/g, '').length < 6) return json({ ok: false, error: 'required' }, 422);

  const country = request.cf?.country ?? '';
  let stored = false;
  let notified = false;

  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO rfq (lang, name, company, phone, email, location, product, quantity, budget, message, page, ip_country)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`,
      )
        .bind(d.lang, d.name, d.company, d.phone, d.email, d.location, d.product, d.quantity, d.budget, d.message, d.page, country)
        .run();
      stored = true;
    } catch (e) {
      console.error('D1 insert failed', e);
    }
  }

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    const lines = Object.keys(LABELS)
      .filter((k) => d[k])
      .map((k) => `<b>${LABELS[k]}:</b> ${esc(d[k])}`);
    const text = `🆕 <b>Նոր հարցում — ARAYI Market</b> (${d.lang || 'hy'}${country ? ', ' + country : ''})\n\n${lines.join('\n')}`;
    try {
      const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      });
      notified = r.ok;
      if (!r.ok) console.error('Telegram error', r.status, await r.text());
    } catch (e) {
      console.error('Telegram request failed', e);
    }
  }

  if (!stored && !notified) return json({ ok: false, error: 'not_configured' }, 503);
  return json({ ok: true, stored, notified });
}
