# ARAYI Market — market.arayimport.am

ARAYI-ի B2B մարկետը՝ արդյունաբերական սարքավորումների, արտադրական գծերի, տեխնիկայի և մեծածախ ապրանքների ներմուծման համար։ Երեք լեզու (հայերեն, անգլերեն, ռուսերեն), որոնում, հարցում գնի համար (RFQ) և կառավարման վահանակ։

**Սերվեր պետք չէ.** կայքը ստատիկ է (Astro) և աշխատում է Cloudflare Pages-ում անվճար։ Հայտերը պահվում են Cloudflare D1-ում և գալիս են Telegram-ով։

| Ինչ | Որտեղ |
|---|---|
| Ապրանքներ | `src/content/products/*.json` (կամ `market.arayimport.am/admin`) |
| Կատեգորիաներ | `src/data/categories.json` |
| Կապի տվյալներ, սոցցանցեր | `src/data/site.json` |
| Ինտերֆեյսի տեքստեր (3 լեզու) | `src/i18n/ui.ts` |
| Դիզայն (գույներ, տառատեսակներ) | `src/styles/global.css` |
| Նկարներ | `public/images/products/` |
| Հարցումների սերվերային մաս | `functions/api/rfq.js` |
| D1 աղյուսակ | `schema.sql` |

---

## 1. Տեղադրում Cloudflare Pages-ում (մեկ անգամ)

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → ընտրեք `aacc1on/arayi-market`։
2. Build settings.
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - Node-ի տարբերակը վերցվում է `.node-version` ֆայլից (22)
3. **Save and Deploy**։ Կայքը կբացվի `arayi-market.pages.dev` հասցեով։
4. Նախագծի **Custom domains** → **Set up a custom domain** → `market.arayimport.am`։ DNS-ը արդեն Cloudflare-ում է, CNAME-ը կավելանա ինքնաբերաբար։

Դրանից հետո ամեն `git push` կամ ադմինում պահպանում կայքը կթարմացնի 1–2 րոպեում։

## 2. Հայտերի պահպանում (D1) և Telegram ծանուցումներ

**D1 բազա**
1. Cloudflare → **Storage & Databases** → **D1** → **Create** → անունը `arayi-market`։
2. Բացեք բազան → **Console** → տեղադրեք `schema.sql`-ի պարունակությունը → **Execute**։
3. Pages նախագիծ → **Settings** → **Bindings** → **Add** → **D1 database** → Variable name՝ `DB`, բազան՝ `arayi-market`։

**Telegram**
1. Telegram-ում [@BotFather](https://t.me/BotFather) → `/newbot` → պատճենեք token-ը։
2. Գրեք ձեր բոտին ցանկացած նամակ, հետո բացեք `https://api.telegram.org/bot<TOKEN>/getUpdates` և գտեք `"chat":{"id": ...}` թիվը։
3. Pages նախագիծ → **Settings** → **Variables and Secrets** → ավելացրեք.
   - `TELEGRAM_BOT_TOKEN` (Secret)
   - `TELEGRAM_CHAT_ID`
4. **Deployments** → վերջին տեղադրման վրա **Retry deployment**, որ փոփոխականները կիրառվեն։

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
functions/api/rfq.js  Cloudflare Pages Function
public/admin/         Sveltia CMS
```
