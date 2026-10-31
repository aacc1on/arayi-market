import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Tolerant field types: the CMS may omit empty fields or save them as null / ""
const text = z.string().nullable().optional().transform((v) => v ?? '');
const num = z.union([z.number(), z.string()]).nullable().optional()
  .transform((v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v)));

const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: z.object({
    slug: z.string(),
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
    order: num.transform((v) => v ?? 100),
    category: z.string(),
    origin: text,
    images: z.array(z.string()).nullable().optional().transform((v) => v ?? []),
    title_hy: z.string(),
    title_en: text,
    title_ru: text,
    summary_hy: text,
    summary_en: text,
    summary_ru: text,
    description_hy: text,
    description_en: text,
    description_ru: text,
    moq_hy: text,
    moq_en: text,
    moq_ru: text,
    lead_time_hy: text,
    lead_time_en: text,
    lead_time_ru: text,
    price_mode: z.enum(['request', 'from', 'range']).nullable().optional().transform((v) => v ?? 'request'),
    price_from: num,
    price_to: num,
    currency: z.string().nullable().optional().transform((v) => v || 'USD'),
    price_unit_hy: text,
    price_unit_en: text,
    price_unit_ru: text,
    specs: z
      .array(
        z.object({
          label_hy: z.string(),
          label_en: text,
          label_ru: text,
          value: z.string(),
        }),
      )
      .nullable()
      .optional()
      .transform((v) => v ?? []),
  }),
});

export const collections = { products };
