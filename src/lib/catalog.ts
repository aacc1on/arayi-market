import { getCollection, type CollectionEntry } from 'astro:content';
import catData from '../data/categories.json';
import site from '../data/site.json';
import { pick, type Lang } from '../i18n/ui';

export type Product = CollectionEntry<'products'>['data'];
export type Category = (typeof catData.categories)[number];

export const SITE = site;
export const categories: Category[] = catData.categories;

export async function getProducts(): Promise<Product[]> {
  const all = await getCollection('products');
  return all
    .map((e) => e.data)
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order || a.title_hy.localeCompare(b.title_hy));
}

export function categoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function catTitle(slug: string, lang: Lang): string {
  const c = categoryBySlug(slug);
  return c ? pick(c, 'title', lang) : slug;
}

export const digits = (s: string) => s.replace(/[^\d]/g, '');

export function waLink(text: string): string {
  return `https://wa.me/${digits(site.whatsapp)}?text=${encodeURIComponent(text)}`;
}

export const telLink = () => `tel:+${digits(site.phone)}`;

const FLAGS: Record<string, string> = {
  CN: '/img/flag-cn.png', EU: '/img/flag-eu.png', US: '/img/flag-us.png', AE: '/img/flag-ae.png',
  RU: '/img/flag-ru.png', IR: '/img/flag-ir.png', EG: '/img/flag-eg.png', BR: '/img/flag-br.png',
};
export const flag = (code: string) => FLAGS[code] ?? '';

export const PLACEHOLDER = '/img/og-image.jpg';
export const mainImage = (p: Product) => p.images[0] || PLACEHOLDER;

export function priceText(p: Product, lang: Lang, labels: { request: string; from: string }): string {
  const fmt = (n: number) => new Intl.NumberFormat(lang === 'hy' ? 'hy-AM' : lang === 'ru' ? 'ru-RU' : 'en-US').format(n);
  const unit = pick(p, 'price_unit', lang);
  const tail = `${p.currency}${unit ? ' / ' + unit : ''}`;
  if (p.price_mode === 'from' && p.price_from) return `${labels.from} ${fmt(p.price_from)} ${tail}`;
  if (p.price_mode === 'range' && p.price_from && p.price_to) return `${fmt(p.price_from)}–${fmt(p.price_to)} ${tail}`;
  return labels.request;
}
