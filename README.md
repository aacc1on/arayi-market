# ARAYI Market — market.arayimport.am

ARAYI-ի B2B մարկետը՝ արդյունաբերական սարքավորումների, արտադրական գծերի, տեխնիկայի և մեծածախ ապրանքների ներմուծման համար։ Երեք լեզու (հայերեն, անգլերեն, ռուսերեն), որոնում, հարցում գնի համար (RFQ) և կառավարման վահանակ։

**Սերվեր պետք չէ.** կայքը ստատիկ է (Astro) և աշխատում է Cloudflare Workers-ում անվճար (ստատիկ էջերը սահմանափակում չունեն)։ Հայտերը պահվում են Cloudflare D1-ում և գալիս են Telegram-ով։

| Ինչ | Որտեղ |
|---|---|
| Ապրանքներ | `src/content/products/*.json` (կամ `market.arayimport.am/admin`) |
| Կատեգորիաներ | `src/data/categories.json` |
| Կապի տվյալներ, սոցցանցեր | `src/data/site.json` |
| Ինտերֆեյսի տեքստեր (3 լեզու) | `src/i18n/ui.ts` |
| Դիզայն (գույներ, տառատեսակներ) | `src/styles/global.css` |
| Նկարներ | `public/images/products/` |
| Հարցումների սերվերային մաս | `worker/rfq.js` (մուտքը՝ `worker/index.js`) |
| Cloudflare-ի կարգավորումներ | `wrangler.jsonc` |
| D1 աղյուսակ | `schema.sql` |

---

## 1. Տեղադրում Cloudflare-ում (մեկ անգամ)

1. Cloudflare → **Workers & Pages** → **Create application** → **Import a repository** → ընտրեք `aacc1on/arayi-market`։
2. Build settings.
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy` (լռելյայնը)
   - **Root directory:** `/`
   - Մնացածը (անուն, `dist` թղթապանակ, 404 էջ) արդեն `wrangler.jsonc`-ում է, Node-ը՝ `.node-version`-ում (22)։
3. **Deploy**։ Կայքը կբացվի `arayi-market.<ձեր-subdomain>.workers.dev` հասցեով։
4. Worker → **Domains** (կամ Settings → Domains & Routes) → **Add Domain** → `market.arayimport.am`։ DNS-ը արդեն Cloudflare-ում է, գրառումը կավելանա ինքնաբերաբար։

Դրանից հետո ամեն `git push` կամ ադմինում պահպանում կայքը կթարմացնի 1–2 րոպեում։

## 2. Հայտերի պահպանում (D1) և Telegram ծանուցումներ

**Telegram** (ամենապարզ տարբերակը)
1. Telegram-ում [@BotFather](https://t.me/BotFather) → `/newbot` → պատճենեք token-ը։
2. Գրեք ձեր բոտին ցանկացած նամակ, հետո բացեք `https://api.telegram.org/bot<TOKEN>/getUpdates` և գտեք `"chat":{"id": ...}` թիվը։
3. Worker → **Settings** → **Variables and Secrets** → **Add** → Type՝ **Secret**.
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. **Deploy**։ Secret-ները պահպանվում են հաջորդ բոլոր deploy-ների ժամանակ։

**D1 բազա** (հայտերի պատմության համար, կամընտիր)
1. Cloudflare → **Storage & Databases** → **D1** → **Create** → անունը `arayi-market`։
2. Բացեք բազան → **Console** → տեղադրեք `schema.sql`-ի պարունակությունը → **Execute**։
3. Պատճենեք բազայի **Database ID**-ն և `wrangler.jsonc`-ում բացեք `d1_databases` տողը (հանեք `//`), տեղադրեք ID-ն և պահպանեք (commit)։ Worker-ում binding-ը պետք է լինի հենց այս ֆայլում. dashboard-ում ավելացրածը հաջորդ deploy-ը կջնջի։

Եթե ոչ D1 է միացված, ոչ Telegram, ձևը այցելուին կբացի WhatsApp՝ նույն տեքստով, այնպես որ հայտերը չեն կորչի։

**Հայտերը դիտելու համար.** D1 → `arayi-market` → Console →
```sql
SELECT created_at, name, phone, product, quantity, message FROM rfq ORDER BY id DESC LIMIT 50;
```

## 3. Կառավարման վահանակ (ապրանքներ ավելացնել)

1. Բացեք `https://market.arayimport.am/admin/`։
2. **Sign In with Token** → GitHub token։ Ստեղծեք այստեղ՝ GitHub → Settings → Developer settings → **Fine-grained tokens** → Repository access՝ միայն `aacc1on/arayi-market`, Permissions → **Contents: Read and write**։
3. **Ապրանքներ → New** → լրացրեք դաշտերը (անուն 3 լեզվով, slug, կատեգորիա, նկարներ, բնութագրեր) → **Save**։

Նկարները ավտոմատ փոքրացվում են (WebP, մինչև 1600px)։

## 4. Տեղական մշակում

```bash
npm install
npm run dev        # http://localhost:4321/hy/
npm run build      # dist/ + Pagefind որոնման ինդեքս
npx wrangler dev   # կայքը + /api/rfq տեղում, http://localhost:8787/hy/
```

Ապրանքի JSON-ի դաշտերի օրինակ՝ `src/content/products/stainless-steel-kegs.json`։ Պարտադիր են `slug`, `category`, `title_hy`. մնացածը կամընտիր է, և դատարկ դաշտերը կայքում չեն երևում։

## 5. Կապը arayimport.am-ի հետ

- `https://market.arayimport.am/api/products.json`՝ բոլոր ապրանքները JSON-ով (CORS բաց է)։ Հիմնական կայքը կարող է ցույց տալ դրանցից `featured: true`-ները։
- Ընդհանուր գույներն ու տառատեսակները նույնն են, ինչ հիմնական կայքում։

## Կառուցվածք

```
src/
  content/products/   ապրանքներ (JSON)
  data/               կատեգորիաներ, կապի տվյալներ
  i18n/ui.ts          ինտերֆեյսի տեքստեր
  layouts/Base.astro  վերնագիր, ներքևի մաս, SEO
  components/         ապրանքի քարտ, RFQ ձև, պատկերակներ
  pages/[lang]/       գլխավոր, կատալոգ, կատեգորիա, ապրանք, RFQ, որոնում
worker/               Cloudflare Worker (/api/rfq)
wrangler.jsonc        Cloudflare-ի կարգավորումներ
public/admin/         Sveltia CMS
```
