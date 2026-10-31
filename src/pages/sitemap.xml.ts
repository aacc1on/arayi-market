import type { APIRoute } from 'astro';
import { LANGS, path } from '../i18n/ui';
import { categories, getProducts } from '../lib/catalog';

const SITE = 'https://market.arayimport.am';

export const GET: APIRoute = async () => {
  const products = await getProducts();
  const groups: ((l: (typeof LANGS)[number]) => string)[] = [
    (l) => path.home(l),
    (l) => path.catalog(l),
    (l) => path.rfq(l),
    ...categories.map((c) => (l: (typeof LANGS)[number]) => path.category(l, c.slug)),
    ...products.map((p) => (l: (typeof LANGS)[number]) => path.product(l, p.slug)),
  ];
  const urls = groups.flatMap((g) =>
    LANGS.map((l) => {
      const alts = LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${a}" href="${SITE}${g(a)}"/>`).join('');
      return `<url><loc>${SITE}${g(l)}</loc>${alts}</url>`;
    }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
