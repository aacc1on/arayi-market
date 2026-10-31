// Public JSON feed of the catalog, used by arayimport.am to show featured products.
import type { APIRoute } from 'astro';
import { LANGS, pick, path } from '../../i18n/ui';
import { catTitle, getProducts, mainImage } from '../../lib/catalog';

const SITE = 'https://market.arayimport.am';

export const GET: APIRoute = async () => {
  const products = await getProducts();
  const out = products.map((p) => ({
    slug: p.slug,
    featured: p.featured,
    category: p.category,
    origin: p.origin,
    image: SITE + mainImage(p),
    ...Object.fromEntries(
      LANGS.flatMap((l) => [
        [`title_${l}`, pick(p, 'title', l)],
        [`summary_${l}`, pick(p, 'summary', l)],
        [`category_${l}`, catTitle(p.category, l)],
        [`url_${l}`, SITE + path.product(l, p.slug)],
      ]),
    ),
  }));
  return new Response(JSON.stringify({ updated: new Date().toISOString(), products: out }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
