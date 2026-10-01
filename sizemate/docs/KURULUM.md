# Sizemate kurulum rehberi

Bu rehber uygulamayı sıfırdan yayına almak için yapman gerekenleri sırayla anlatıyor. Kod hazır ve testleri geçiyor. Aşağıdaki adımlar senin kimliğinle yapılması gereken işler: hesap açmak, sözleşme onaylamak, ödeme bilgisi girmek ve sunucu kiralamak.

## 1. Shopify Partner hesabı (10 dakika)

1. https://www.shopify.com/partners adresine git ve **Join now** de.
2. E-posta adresinle kaydol, e-postanı doğrula.
3. İşletme adı olarak `SUN | WORKS` yaz. Ülke olarak Türkiye'yi seç.
4. Partner Program Agreement'ı oku ve onayla.
5. **Settings › Payouts**: Ödeme yöntemini ekle. Burayı mutlaka kontrol et: Türkiye için hangi yöntemin (PayPal, banka havalesi) açık olduğu hesabına göre değişiyor. App Store'da ücret almadan önce bu adımın tamamlanmış olması gerekiyor. Burada bir engel çıkarsa bana yaz, alternatiflere birlikte bakalım.

> Bu adımı senin yerine yapamadım: hesap senin adına açılıyor, e-posta doğrulaması ve yasal sözleşme onayı gerekiyor, ödeme ve vergi bilgisi de senin bilgilerin.

**App Store kaydı (19 USD, bir kez):** Uygulamayı App Store'da yayınlayıp ücret almak için Partner hesabını bir kereye mahsus 19 USD ödeyerek App Store'a kaydetmen gerekiyor. Geliştirme ve test için bu ödemeye gerek yok. Shopify, 1 Ocak 2025'ten itibaren kazandığın ilk 1.000.000 USD'nin tamamını sana bırakıyor, üstü için %15 komisyon alıyor. Ödemelerden ayrıca %2,9 işlem ücreti kesiliyor.

## 2. Geliştirme mağazası (2 dakika)

Partner Dashboard'da **Stores › Add store › Create development store** yolunu izle. Amacı olarak "Test an app or theme" seç. Bu mağaza ücretsiz. Test ödemeleri gerçek para çekmez.

## 3. Uygulamayı bilgisayarında çalıştır (15 dakika)

Gerekenler: Node.js 22.12 veya üstü, Git ve Shopify CLI (`npm install -g @shopify/cli`).

> **Windows:** PowerShell "running scripts is disabled" hatası verirse bir kez `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` çalıştır. Zip'i açınca iç içe iki `sizemate` klasörü oluşursa `package.json` dosyasının bulunduğu klasöre gir.
>
> **Mağaza şifresi:** `npm run dev` "store password" sorarsa, geliştirme mağazasının vitrin şifresini gir. Şifre **Online Mağaza › Tercihler › Mağaza erişimi › Parola** alanında. Mağazayı açıkça belirtmek için: `npm run dev -- --store MAGAZAN.myshopify.com`

```bash
git clone https://github.com/gunesugur/sunworks-web.git
cd sunworks-web/sizemate
npm install
npm run config:link   # "Create a new app" de, adı: Sizemate
npm run dev           # geliştirme mağazasını seç, verilen linkten uygulamayı yükle
```

`config:link` komutu `shopify.app.toml` dosyasına `client_id` ve adresleri kendisi yazar. `npm run dev` açıkken:

1. Uygulamada **Create size chart** ile bir şablon seç.
2. Ana Sayfa'daki **Turn on in theme editor** düğmesine bas, açılan tema editöründe **Save** de.
3. Mağazanda bir ürün sayfası aç. "Size chart" düğmesi görünmeli.

### İlk testte özellikle kontrol et

Bu iki nokta Shopify'ın kendi sunucusunda çalıştığı için bu ortamda test edemedim:

- Tablo, ürün sayfasında görünüyor mu? Görünmüyorsa tema editöründe **App embeds** altında "Sizemate size charts" açık mı, ona bak.
- Ana Sayfa'daki "Theme: On" rozeti embed açıldıktan sonra doğru görünüyor mu?

Bir sorun çıkarsa ekran görüntüsüyle bana yaz, hemen düzeltirim.

## 4. Fiyat planları (Partner Dashboard, 10 dakika)

Partner Dashboard'da **Apps › Sizemate › Distribution** altında **Shopify App Store**'u seç. Sonra **Pricing › Manage pricing** yolunu izle ve **Managed pricing**'i aç. Şu planları oluştur (isimler birebir aynı olmalı, çünkü uygulama planı isimden tanıyor):

| Plan adı | Aylık | Yıllık | Deneme |
| --- | --- | --- | --- |
| Free | 0 | — | — |
| Pro | 4.99 USD | 49.90 USD | 7 gün |
| Plus | 9.99 USD | 99.90 USD | 7 gün |

Özellik listesini `app/lib/plans.ts` dosyasındaki `highlights` satırlarından kopyalayabilirsin. Uygulamadaki **Plans** sayfası mağaza sahibini doğrudan Shopify'ın plan seçme sayfasına götürür.

Planlar, Dev Dashboard'da uygulama **Public distribution (Shopify App Store)** olarak ayarlandıktan sonra açılan **Pricing** bölümünde oluşturuluyor. Listeyi yayına göndermen gerekmiyor; taslak liste yeterli. Aynı organizasyona ait geliştirme mağazaları her planı **0 USD'ye** deneyebiliyor. Yani Plans sayfasındaki "Start 7-day free trial" düğmesine basıp onaylarsan uygulama planı algılamalı ve paralı özellikler açılmalı. Abonelik sistemini uçtan uca test etmenin yolu bu.

Plan oluşturmadan da paralı planları ödeme yapmadan denemek için uygulamayı `SIZEMATE_DEV_PLAN=plus npm run dev` komutuyla başlat (Windows PowerShell'de: `$env:SIZEMATE_DEV_PLAN="plus"; npm run dev`). Bu ayar sadece geliştirme ortamında çalışır, canlıda etkisizdir.

## 5. Sunucuya yükleme

Uygulamanın her zaman açık bir sunucuda çalışması gerekiyor. Mağaza tarafı ise sunucuya hiç istek atmıyor, yani sunucu kısa süreliğine kapansa bile mağazadaki tablolar çalışmaya devam eder.

Önerilen düzen şöyle:

- **Sunucu**: Fly.io, Render veya Railway (aylık yaklaşık 5–10 USD). Klasörde bir `Dockerfile` hazır.
- **Veritabanı**: Canlıda SQLite yerine Postgres kullan (Neon ve Supabase'in ücretsiz planları yeterli). `prisma/schema.prisma` dosyasında `provider = "postgresql"` ve `url = env("DATABASE_URL")` yap. Sonra `npx prisma migrate dev --name postgres` ile migration'ları yeniden oluştur.
- **Ortam değişkenleri**: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES=read_products,read_themes,read_locales,write_files`, `DATABASE_URL`, `NODE_ENV=production`.
- **Son adım**: Sunucu adresini `shopify.app.toml` içindeki `application_url` ve `redirect_urls` alanlarına yaz. Ardından `npm run deploy` ile uygulama ayarlarını ve tema eklentisini Shopify'a gönder.

## 6. App Store başvurusu

Başvurmadan önce şunları hazırla:

- [ ] Uygulama simgesi (1200×1200 px)
- [ ] 3–6 ekran görüntüsü (`docs/screenshots` klasöründeki mağaza görünümleri başlangıç için hazır; admin görüntülerini geliştirme mağazasından alman gerekiyor)
- [ ] Kısa tanıtım ve özellik listesi (bu README'den uyarlanabilir)
- [ ] Gizlilik politikası sayfası (sunworks.studio altında yayınla; içerik: müşteri verisi saklanmıyor, sadece mağazanın tablo ve ayarları tutuluyor, mağaza silinince 48 saat içinde her şey siliniyor)
- [ ] Destek e-postası: `app/lib/brand.ts` içinde `hello@sunworks.studio` olarak ayarlı
- [ ] Test için geliştirme mağazası erişimi (Shopify inceleme ekibi için)
- [ ] "Sizemate" adının App Store'da kullanılmadığını kontrol et. Kullanılıyorsa adı `app/lib/brand.ts`, `shopify.app.toml` ve dil dosyalarındaki "Powered by Sizemate" satırlarında değiştir.

Zorunlu gizlilik webhook'ları (`customers/data_request`, `customers/redact`, `shop/redact`) uygulamada hazır ve `shopify.app.toml` içinde tanımlı.

## Neler var, nerede?

| İş | Dosya |
| --- | --- |
| Planlar ve limitler | `app/lib/plans.ts` |
| Hazır şablonlar | `app/lib/templates.ts` |
| Beden önerici (Fit Finder) | `app/lib/fit.ts` |
| Mağazada görünen HTML | `extensions/sizemate-theme/snippets/sizemate-core.liquid` |
| Mağaza stili | `extensions/sizemate-theme/assets/sizemate.css` |
| Mağaza çevirileri | `extensions/sizemate-theme/locales/*.json` |
| Yönetim sayfaları | `app/routes/app.*.tsx` |

Kodda değişiklik yaptıktan sonra `npm test` ve `npm run test:e2e` komutlarını çalıştır. Mağaza script'ini değiştirdiysen `npm run build:storefront` da çalıştırman gerekiyor.
