# SUN | WORKS

SUN | WORKS web stüdyosunun kurumsal sitesi. Türkçe (`/`) ve İngilizce (`/en`) olarak yayınlanır.

## Teknolojiler

| Alan | Kullanılan |
| --- | --- |
| Arayüz | [Astro](https://astro.build) + TypeScript, statik sayfalar |
| Barındırma | Cloudflare Workers (statik dosyalar + form API'leri) |
| İçerik yönetimi | [Sanity](https://www.sanity.io) (Studio: `studio/` klasörü) |
| Formlar | Cloudflare D1 veritabanı, Turnstile bot koruması, istek sınırlama |
| Test | Node test runner, Playwright (uçtan uca + erişilebilirlik), Lighthouse |

## Klasör yapısı

```
src/
  pages/        Sayfa yolları ve /api/* form uç noktaları
  templates/    Sayfa şablonları
  components/   Arayüz bileşenleri
  content/      İçerik şeması (zod) ve yerel örnek içerik
  lib/          İçerik okuma, görsel, SEO yardımcıları
  server/       Form doğrulama, güvenlik ve istek sınırlama
  scripts/      Tarayıcı tarafı küçük geliştirmeler
studio/         Sanity Studio (içerik paneli)
migrations/     D1 veritabanı tabloları
tests/          Birim ve uçtan uca testler
```

## Yerel geliştirme

Node.js 22.12 veya üstü gerekir.

```bash
npm install
cp .dev.vars.example .dev.vars   # yerel test anahtarları
npm run build
npm run db:migrate:local         # yerel veritabanı tabloları
npm run preview                  # http://127.0.0.1:8788
```

Diğer komutlar:

```bash
npm run lint        # ESLint
npm run typecheck   # Astro + TypeScript tip kontrolü
npm test            # birim ve API testleri
npm run test:e2e    # Playwright testleri
```

## İçerik

İçerikler Sanity'de tutulur ve **https://sunworks.sanity.studio** üzerinden düzenlenir.
Studio'da bir içerik yayınlandığında (Publish) site otomatik olarak yeniden derlenir ve birkaç dakika içinde güncellenir.

`SANITY_PROJECT_ID` tanımlı değilse site, `src/content/data/` altındaki yerel örnek içerikle derlenir (testler bu şekilde çalışır).
Her iki kaynak da `src/content/schema.ts` içindeki aynı şemayla doğrulanır.

## Yayına alma

`main` dalına gelen her değişiklik Cloudflare Workers Builds ile otomatik olarak derlenip yayınlanır.
`studio/` klasöründeki değişiklikler GitHub Actions ile Sanity Studio'ya ayrıca yüklenir.

## Ortam değişkenleri

| Ad | Nerede | Açıklama |
| --- | --- | --- |
| `TURNSTILE_SECRET_KEY` | Worker secret | Turnstile doğrulaması (yoksa formlar kapalı kalır) |
| `RATE_LIMIT_SALT` | Worker secret | İstek sınırlama anahtarı için tuz |
| `PUBLIC_TURNSTILE_SITE_KEY` | Build değişkeni | Turnstile site anahtarı |
| `SANITY_PROJECT_ID`, `SANITY_DATASET` | Build değişkeni | İçerik kaynağı (`.env.production`) |
| `FORMS_ENABLED` | `wrangler.jsonc` | Formları topluca açıp kapatır |
| `SANITY_AUTH_TOKEN` | GitHub secret | Studio yükleme yetkisi |

## Görseller

Fotoğraflar SUN | WORKS için özel olarak üretildi. Her görselin açık ve koyu tema için iki sürümü var (`src/assets/images/<ad>.webp` ve `<ad>-dark.webp`). Sanity'de koyu sürüm, görsel alanındaki "Dark mode image" alanına yüklenir.

Yeni görsel yüklerken genişliği en az 2500 piksel olsun; retina ekranlarda büyük görseller ancak böyle net görünür. Mevcut görseller orijinal PNG'lerden yapay zekâyla 2 kat büyütüldü ve bir kez, kalite 92 WebP olarak kaydedildi. Site her derlemede bunlardan AVIF ve WebP boyları üretir.
