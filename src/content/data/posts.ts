import type { Post } from '../schema';
import { pt } from '../pt';
import { img, slug } from './helpers';

const UPDATED = '2026-09-29';

export const posts: Post[] = [
  // ---------- WordPress pre-launch checklist ----------
  {
    _id: 'post-wp-checklist-tr',
    _type: 'post',
    language: 'tr',
    translationKey: 'post-wp-checklist',
    title: 'WordPress yayın öncesi kontrol listesi: 7 adım',
    slug: slug('wordpress-yayin-oncesi-kontrol-listesi'),
    publishedAt: '2026-09-15',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'İlk haftalarda çıkan sorunların çoğu birkaç basit kontrolle önlenir. Bir WordPress sitesini yayına almadan önce üzerinden geçtiğimiz yedi adım.',
    image: img('post-planning', 'Beyaz panoya iğnelenmiş planlama kartlarına yeni bir kart ekleyen el'),
    tags: ['WordPress', 'Bakım'],
    body: pt(
      'b',
      `Bir WordPress sitesini yayına almak "Yayınla" düğmesine basmak gibi görünür. Pratikte ilk haftalarda çıkan sorunların çoğu birkaç basit kontrolle önlenir. Bu liste, her yayından önce üzerinden geçtiğimiz adımların sade hâli.

## 1. Yedek alın ve geri yüklemeyi deneyin

Dosyaların ve veritabanının tam yedeğini alın. Sonra bu yedeği bir kez geri yükleyip gerçekten çalıştığını görün. Denenmemiş yedek, yedek sayılmaz. Yedeği sitenin bulunduğu sunucudan farklı bir yerde saklayın.

## 2. Güncelleyin, gereksizi silin

WordPress çekirdeğini, temayı ve eklentileri güncelleyin. Kullanmadığınız eklenti ve temaları devre dışı bırakmakla yetinmeyin, silin. Güncellenmeyen her eklenti ileride bir güvenlik açığı olabilir.

## 3. Kalıcı bağlantıları ve yönlendirmeleri ayarlayın

**Ayarlar › Kalıcı bağlantılar** bölümünden okunaklı bir yapı seçin. Örneğin yazı adı. Eski bir siteden geçiyorsanız, önemli eski adresleri yeni sayfalara **301** ile yönlendirin. Böylece arama motorlarındaki sıralamanızı kaybetmezsiniz.

## 4. Arama motorlarını engellemediğinizden emin olun

Geliştirme sırasında açılan "Arama motorlarının bu siteyi dizine eklemesini engelle" seçeneği, en sık unutulan ayardır. **Ayarlar › Okuma** bölümünden kapalı olduğunu kontrol edin. Ardından site haritasını Google Search Console'a gönderin.

## 5. Formları ve e-postayı test edin

İletişim formunu gerçek bir adresle deneyin. Mesajın ulaştığını görün. Paylaşımlı hostingde WordPress'in gönderdiği e-postalar spam klasörüne düşebilir. Bir SMTP eklentisi ve doğru SPF, DKIM kayıtları bu sorunu çoğu zaman çözer.

## 6. Önbelleği en son açın

Önbellek eklentisini en son etkinleştirin. Ardından formları, menüleri ve varsa sepet sayfasını yeniden deneyin. Görselleri yüklemeden önce gösterileceği boyuta küçültmek, çoğu zaman bir eklentiden daha fazla fark yaratır.

## 7. Telefonda ve masaüstünde gezin

Siteyi en az bir telefonda ve bir masaüstü tarayıcıda baştan sona gezin. Şunlara özellikle bakın:

- Menü ve alt bilgideki bağlantılar
- Formlar ve teşekkür mesajları
- Dış bağlantılar ve indirilebilir dosyalar
- Yasal sayfalar: gizlilik ve çerez politikası

## Yayından sonraki ilk hafta

Hata kayıtlarına ve form mesajlarına göz atın. Küçük sorunlar bu aşamada kolayca yakalanır. Site yavaş açılıyorsa [siteniz neden yavaş](/blog/siteniz-neden-yavas) yazımıza bakın.

## Sık sorulan sorular

### Yayından önce en önemli adım hangisi?

Yedek. Diğer her şey sonradan düzeltilebilir. Çalışan bir yedeğiniz yoksa küçük bir hata büyük bir kayba dönüşebilir.

### Bu kontrolleri kendim yapabilir miyim?

Evet, listedeki adımların çoğu yönetim panelinden yapılır. Yönlendirme ya da e-posta ayarlarında takılırsanız [WordPress hizmetimiz](/hizmetler/wordpress-kurumsal-site) kapsamında bu adımları biz üstleniriz.`,
    ),
    seo: {
      title: 'WordPress yayın öncesi kontrol listesi: 7 adım',
      description: 'WordPress sitenizi yayına almadan önce yedek, güncelleme, 301 yönlendirme, arama görünürlüğü, form, önbellek ve mobil kontrolü için 7 adım.',
    },
  },
  {
    _id: 'post-wp-checklist-en',
    _type: 'post',
    language: 'en',
    translationKey: 'post-wp-checklist',
    title: 'WordPress pre-launch checklist: 7 steps',
    slug: slug('wordpress-pre-launch-checklist'),
    publishedAt: '2026-09-15',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'Most problems in the first weeks can be prevented with a few simple checks. The seven steps we go through before launching a WordPress site.',
    image: img('post-planning', 'A hand pinning a new card among planning cards on a white board'),
    tags: ['WordPress', 'Maintenance'],
    body: pt(
      'b',
      `Launching a WordPress site looks like pressing "Publish". In practice, most problems in the first weeks can be prevented with a few simple checks. This list is a trimmed-down version of what we go through before every launch.

## 1. Take a backup and test the restore

Back up the files and the database. Then restore that backup once and confirm it works. An untested backup is not a backup. Store it somewhere other than the server the site runs on.

## 2. Update, then delete what you don't use

Update WordPress core, the theme and plugins. Don't just deactivate unused plugins and themes, delete them. Every plugin that stops getting updates can become a security hole.

## 3. Set permalinks and redirects

Pick a readable structure under **Settings › Permalinks**, such as post name. If you are moving from an old site, point important old URLs to the new pages with **301** redirects, so you keep your search rankings.

## 4. Make sure search engines are not blocked

The "Discourage search engines from indexing this site" option, switched on during development, is the most commonly forgotten setting. Check it is off under **Settings › Reading**, then submit your sitemap to Google Search Console.

## 5. Test forms and email

Send the contact form to a real address and confirm the message arrives. On shared hosting, emails sent by WordPress can land in spam. An SMTP plugin with correct SPF and DKIM records usually fixes this.

## 6. Turn on caching last

Enable the caching plugin last. Then test forms, menus and the cart page again, if you have one. Resizing images to their display size before upload often makes more difference than any plugin.

## 7. Browse on a phone and a desktop

Go through the whole site on at least one phone and one desktop browser. Pay attention to:

- Links in the menu and footer
- Forms and thank-you messages
- External links and downloadable files
- Legal pages: privacy and cookie policy

## The first week after launch

Check error logs and form messages. Small problems are easy to catch at this stage. If the site feels slow, read [why is your site slow](/en/blog/why-is-your-site-slow).

## Frequently asked questions

### What is the most important step before launch?

The backup. Everything else can be fixed later. Without a working backup, a small mistake can turn into a big loss.

### Can I do these checks myself?

Yes, most of the steps happen in the admin panel. If you get stuck on redirects or email settings, we handle them as part of our [WordPress service](/en/services/wordpress-business-website).`,
    ),
    seo: {
      title: 'WordPress pre-launch checklist: 7 steps',
      description: 'Seven steps before launching a WordPress site: backups, updates, 301 redirects, search visibility, forms, caching and mobile checks.',
    },
  },

  // ---------- Slow site ----------
  {
    _id: 'post-slow-site-tr',
    _type: 'post',
    language: 'tr',
    translationKey: 'post-slow-site',
    title: 'Web siteniz neden yavaş? En sık görülen 5 neden',
    slug: slug('siteniz-neden-yavas'),
    publishedAt: '2026-08-27',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'Yavaş bir site hem ziyaretçiyi hem arama sıralamasını kaybettirir. Hız sorunlarının çoğu birkaç tanıdık kaynaktan gelir ve hepsinin çözümü ölçmekle başlar.',
    image: img('post-speed', 'Ekranında hız göstergesi ve grafikler açık dizüstü bilgisayar, yanında kahve'),
    tags: ['Performans', 'WordPress'],
    body: pt(
      'b',
      `Bir sayfanın açılması birkaç saniyeyi geçtiğinde ziyaretçilerin önemli bir kısmı beklemeden ayrılır. Google da sayfa deneyimini sıralamada hesaba katar. İyi haber şu: hız sorunlarının çoğu birkaç tanıdık kaynaktan gelir ve ölçülerek bulunur.

## 1. Ölçmeden başlamak

Tahminle değil ölçümle başlayın. Google PageSpeed Insights ya da Lighthouse üç değeri gösterir:

- **LCP:** Sayfadaki en büyük içeriğin ne zaman göründüğü. Hedef 2,5 saniyenin altı.
- **INP:** Bir tıklamaya sayfanın ne kadar hızlı tepki verdiği. Hedef 200 milisaniyenin altı.
- **CLS:** Sayfa yüklenirken içeriğin ne kadar kaydığı. Hedef 0,1'in altı.

Her değişiklikten önce ve sonra aynı ölçümü alın.

## 2. Büyük görseller

En sık gördüğümüz neden, telefondan ya da kameradan olduğu gibi yüklenmiş birkaç megabaytlık görseller. Görseli gösterileceği boyuta küçültün ve WebP ya da AVIF biçimine çevirin. Bu çoğu zaman tek başına ciddi fark yaratır.

## 3. Gereğinden fazla eklenti

Her eklenti sayfaya kendi betiğini ve stil dosyasını ekleyebilir. Kullanmadığınız eklentileri silin. Aynı işi yapan iki eklenti varsa birini seçin. Sayfa oluşturucular ve kaydırıcılar en ağır olanlardır.

## 4. Yetersiz hosting

Ucuz paylaşımlı hosting, trafik arttığında ilk darboğaz olur. Sunucunun yanıt süresi, yani TTFB, sürekli yüksekse kod tarafındaki iyileştirmeler sınırlı kalır. Bazen en hızlı çözüm daha iyi bir sunucudur.

## 5. Önbellek ve CDN eksikliği

Sayfaları önbelleğe almak ve dosyaları bir CDN üzerinden sunmak, ziyaretçiye en yakın noktadan yanıt verilmesini sağlar. Önbelleği açtıktan sonra form ve sepet gibi dinamik sayfaları mutlaka yeniden test edin.

## Nereden başlamalı?

Ölçün, en büyük sorunu düzeltin, tekrar ölçün. Tek seferde her şeyi değiştirmek yerine adım adım ilerleyin. Böylece neyin işe yaradığını görürsünüz.

## Sık sorulan sorular

### Lighthouse puanı 100 olmak zorunda mı?

Hayır. Puan bir araç, hedef değil. Asıl önemli olan gerçek ziyaretçilerin deneyimi. Yine de 90'ın üzeri iyi bir işarettir.

### Hız sorununu kendim çözebilir miyim?

Görselleri küçültmek ve gereksiz eklentileri silmek kolay adımlar. Sunucu, önbellek ya da tema kaynaklı sorunlar için [teknik destek hizmetimiz](/hizmetler/teknik-destek) kapsamında nedeni bulup düzeltiriz.`,
    ),
    seo: {
      title: 'Web siteniz neden yavaş? En sık görülen 5 neden',
      description: 'Web sitesi yavaşlığının en sık 5 nedeni ve çözümleri: ölçüm (LCP, INP, CLS), büyük görseller, fazla eklenti, hosting, önbellek ve CDN.',
    },
  },
  {
    _id: 'post-slow-site-en',
    _type: 'post',
    language: 'en',
    translationKey: 'post-slow-site',
    title: 'Why is your website slow? The 5 most common causes',
    slug: slug('why-is-your-site-slow'),
    publishedAt: '2026-08-27',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'A slow site loses visitors and search rankings. Most speed problems come from a few familiar places, and fixing them starts with measuring.',
    image: img('post-speed', 'A laptop showing a speed gauge and charts, coffee beside it'),
    tags: ['Performance', 'WordPress'],
    body: pt(
      'b',
      `When a page takes more than a few seconds to load, many visitors leave before it appears. Google also takes page experience into account when ranking. The good news: most speed problems come from a few familiar places, and you can find them by measuring.

## 1. Not measuring first

Start with numbers, not guesses. Google PageSpeed Insights or Lighthouse shows three values:

- **LCP:** When the largest element on the page appears. Aim for under 2.5 seconds.
- **INP:** How quickly the page responds to a click. Aim for under 200 milliseconds.
- **CLS:** How much content shifts while the page loads. Aim for under 0.1.

Take the same measurement before and after every change.

## 2. Oversized images

The cause we see most: images uploaded straight from a phone or camera, several megabytes each. Resize images to their display size and convert them to WebP or AVIF. This alone often makes a big difference.

## 3. Too many plugins

Each plugin can add its own scripts and styles to the page. Delete the ones you don't use. If two plugins do the same job, keep one. Page builders and sliders are usually the heaviest.

## 4. Underpowered hosting

Cheap shared hosting becomes the first bottleneck when traffic grows. If the server response time, TTFB, is always high, code improvements only go so far. Sometimes the fastest fix is a better server.

## 5. No caching or CDN

Caching pages and serving files through a CDN means visitors get a response from the nearest location. After turning on caching, always test dynamic pages such as forms and the cart again.

## Where to start

Measure, fix the biggest problem, measure again. Go step by step rather than changing everything at once. That way you see what actually worked.

## Frequently asked questions

### Does the Lighthouse score need to be 100?

No. The score is a tool, not the goal. What matters is the experience of real visitors. Still, anything above 90 is a good sign.

### Can I fix speed issues myself?

Resizing images and removing unused plugins are easy steps. For server, caching or theme issues, our [technical support service](/en/services/technical-support) finds the cause and fixes it.`,
    ),
    seo: {
      title: 'Why is your website slow? 5 common causes',
      description: 'The five most common causes of a slow website and how to fix them: measuring LCP, INP and CLS, image size, plugins, hosting, caching and CDN.',
    },
  },

  // ---------- Shopify launch ----------
  {
    _id: 'post-shopify-launch-tr',
    _type: 'post',
    language: 'tr',
    translationKey: 'post-shopify-launch',
    title: 'Shopify mağaza açmadan önce yapılacak 5 ayar',
    slug: slug('shopify-magaza-acmadan-once'),
    publishedAt: '2026-07-14',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'Tema ve ürünler hazır olduğunda mağaza da hazır görünür. Ama ilk siparişin sorunsuz geçmesini ödeme, kargo, vergi, yasal sayfalar ve alan adı ayarları belirler.',
    image: img('post-boutique', 'Ahşap askılarda giysilerin sergilendiği aydınlık bir butik mağaza'),
    tags: ['Shopify', 'E-ticaret'],
    body: pt(
      'b',
      `Tema seçilip ürünler eklendiğinde mağaza hazır görünür. Pratikte ilk siparişin sorunsuz geçmesini birkaç arka plan ayarı belirler. Shopify mağaza açılışlarında üzerinden geçtiğimiz beş başlık şunlar.

## 1. Ödeme yöntemleri

Hangi ödeme sağlayıcısını kullanacağınızı ve komisyon oranlarını baştan netleştirin. Açılıştan önce gerçek bir kartla küçük bir test siparişi verip iade edin. Ödeme akışını en iyi bu gösterir.

## 2. Kargo bölgeleri ve ücretleri

Kargo bölgelerini, ücretsiz kargo sınırını ve teslim sürelerini tanımlayın. Ağır ya da büyük ürünler için ayrı kurallar gerekebilir. Müşterinin kargo ücretini ödeme adımında ilk kez görmesi, sepet terkinin en yaygın nedenlerinden biridir.

## 3. Vergiler ve fatura bilgileri

Fiyatların vergi dahil mi gösterileceğine karar verin. Mağaza ayarlarındaki şirket bilgilerini eksiksiz doldurun. Bunu muhasebecinizle birlikte kontrol etmek sonradan çıkacak soruları önler.

## 4. Yasal sayfalar

İade ve değişim koşulları, gizlilik politikası, mesafeli satış sözleşmesi ve iletişim bilgileri kolayca bulunabilmeli. Bu sayfalar hem müşteriye güven verir hem de ödeme sağlayıcılarının istediği bilgilerdir.

## 5. Alan adı ve e-posta

Kendi alan adınızı bağlayın. Sipariş e-postalarının bu alan adından gönderildiğinden emin olun. Bildirim şablonlarını markanızın diline göre düzenleyin. Alan adı ve e-posta ayarları için [alan adı ve hosting](/hizmetler/alan-adi-ve-hosting) sayfamıza bakabilirsiniz.

## Açılış günü

Mağazayı telefondan baştan sona gezin. Bir test siparişini kargoya kadar takip edin. Sonra açın.

## Sık sorulan sorular

### Shopify mağaza kurulumu ne kadar sürer?

Ürün sayısına ve özelleştirme ihtiyacına göre değişir. Küçük bir katalogla iki ila dört hafta gerçekçi bir süredir.

### Bu ayarları kendim yapabilir miyim?

Evet, hepsi Shopify yönetim panelinden yapılır. Tema, uygulama ya da ürün yapılandırıcısı gerekiyorsa [Shopify hizmetimiz](/hizmetler/shopify-magaza-kurulumu) kapsamında birlikte kurarız.`,
    ),
    seo: {
      title: 'Shopify mağaza açmadan önce yapılacak 5 ayar',
      description: 'Shopify mağazanızı açmadan önce ödeme, kargo, vergi, yasal sayfalar ve alan adı ayarları. İlk siparişin sorunsuz geçmesi için kontrol listesi.',
    },
  },
  {
    _id: 'post-shopify-launch-en',
    _type: 'post',
    language: 'en',
    translationKey: 'post-shopify-launch',
    title: '5 things to set up before opening a Shopify store',
    slug: slug('before-opening-your-shopify-store'),
    publishedAt: '2026-07-14',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'With the theme and products in place, the store looks ready. But payment, shipping, tax, policy and domain settings decide whether the first order goes smoothly.',
    image: img('post-boutique', 'A bright boutique store with garments on wooden rails'),
    tags: ['Shopify', 'E-commerce'],
    body: pt(
      'b',
      `Once a theme is chosen and products are added, a store looks ready. In practice, a few background settings decide whether the first order goes through smoothly. These are the five areas we check before every Shopify launch.

## 1. Payment methods

Decide on your payment provider and fees early. Before launch, place a small test order with a real card and refund it. Nothing shows the checkout flow better.

## 2. Shipping zones and rates

Define shipping zones, a free-shipping threshold and delivery times. Heavy or bulky products may need their own rules. Customers seeing the shipping cost for the first time at checkout is one of the most common reasons for abandoned carts.

## 3. Taxes and billing details

Decide whether prices include tax, and fill in your company details in the store settings. Checking this with your accountant avoids questions later.

## 4. Policy pages

Returns and exchanges, privacy policy, terms of sale and contact details should be easy to find. These pages build trust and are also what payment providers ask for.

## 5. Domain and email

Connect your own domain and make sure order emails are sent from it. Edit the notification templates to match your brand's voice. For domain and email setup, see [domain and hosting](/en/services/domain-and-hosting).

## Launch day

Browse the whole store on a phone. Follow a test order all the way to shipping. Then open.

## Frequently asked questions

### How long does a Shopify store setup take?

It depends on the catalog size and how much customization is needed. With a small catalog, two to four weeks is realistic.

### Can I do these settings myself?

Yes, everything is in the Shopify admin. If you need a custom theme, apps or a product configurator, we set it up together as part of our [Shopify service](/en/services/shopify-store-setup).`,
    ),
    seo: {
      title: '5 things to set up before opening a Shopify store',
      description: 'Before opening your Shopify store: payment, shipping, tax, policy pages and domain settings. A checklist for a smooth first order.',
    },
  },

  // ---------- Deutsch ----------
  {
    _id: 'post-wp-checklist-de',
    _type: 'post',
    language: 'de',
    translationKey: 'post-wp-checklist',
    title: 'WordPress-Checkliste vor dem Livegang: 7 Schritte',
    slug: slug('wordpress-checkliste-vor-dem-livegang'),
    publishedAt: '2026-09-15',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'Die meisten Probleme der ersten Wochen lassen sich mit ein paar einfachen Prüfungen vermeiden. Die sieben Schritte, die wir vor jedem WordPress-Livegang durchgehen.',
    image: img('post-planning', 'Eine Hand steckt eine neue Karte zwischen Planungskarten an eine weiße Wand'),
    tags: ['WordPress', 'Wartung'],
    body: pt(
      'b',
      `Eine WordPress-Website live zu schalten, sieht aus wie ein Klick auf „Veröffentlichen“. In der Praxis lassen sich die meisten Probleme der ersten Wochen mit ein paar einfachen Prüfungen vermeiden. Diese Liste ist eine gekürzte Fassung dessen, was wir vor jedem Livegang durchgehen.

## 1. Backup erstellen und Wiederherstellung testen

Sichern Sie Dateien und Datenbank. Spielen Sie dieses Backup dann einmal zurück und prüfen Sie, ob es funktioniert. Ein ungetestetes Backup ist kein Backup. Bewahren Sie es nicht auf dem Server auf, auf dem die Website läuft.

## 2. Aktualisieren und Unbenutztes löschen

Aktualisieren Sie WordPress, das Theme und die Plugins. Deaktivieren Sie unbenutzte Plugins und Themes nicht nur, sondern löschen Sie sie. Jedes Plugin, das keine Updates mehr bekommt, kann zur Sicherheitslücke werden.

## 3. Permalinks und Weiterleitungen einrichten

Wählen Sie unter **Einstellungen › Permalinks** eine lesbare Struktur, zum Beispiel den Beitragsnamen. Wenn Sie von einer alten Website umziehen, leiten Sie wichtige alte Adressen mit **301**-Weiterleitungen auf die neuen Seiten um. So behalten Sie Ihre Positionen in der Suche.

## 4. Suchmaschinen nicht aussperren

Die während der Entwicklung aktivierte Option „Suchmaschinen davon abhalten, diese Website zu indexieren“ ist die am häufigsten vergessene Einstellung. Prüfen Sie unter **Einstellungen › Lesen**, dass sie aus ist, und reichen Sie dann Ihre Sitemap in der Google Search Console ein.

## 5. Formulare und E-Mail testen

Senden Sie das Kontaktformular an eine echte Adresse und prüfen Sie, ob die Nachricht ankommt. Auf Shared Hosting landen E-Mails von WordPress oft im Spam. Ein SMTP-Plugin mit korrekten SPF- und DKIM-Einträgen löst das meist.

## 6. Caching zuletzt aktivieren

Schalten Sie das Caching-Plugin als Letztes ein. Testen Sie danach Formulare, Menüs und, falls vorhanden, den Warenkorb erneut. Bilder vor dem Hochladen auf ihre Anzeigegröße zu bringen, bringt oft mehr als jedes Plugin.

## 7. Auf Handy und Desktop durchklicken

Gehen Sie die ganze Website auf mindestens einem Handy und einem Desktop-Browser durch. Achten Sie auf:

- Links in Menü und Footer
- Formulare und Bestätigungsmeldungen
- Externe Links und Dateien zum Herunterladen
- Rechtstexte: Impressum, Datenschutzerklärung und Cookie-Hinweise

## Die erste Woche nach dem Livegang

Prüfen Sie Fehlerprotokolle und Formularnachrichten. Kleine Probleme lassen sich jetzt noch leicht finden. Wenn sich die Website langsam anfühlt, lesen Sie [warum ist Ihre Website langsam](/de/blog/warum-ist-ihre-website-langsam).

## Häufige Fragen

### Was ist der wichtigste Schritt vor dem Livegang?

Das Backup. Alles andere lässt sich später beheben. Ohne funktionierendes Backup kann aus einem kleinen Fehler ein großer Verlust werden.

### Kann ich diese Prüfungen selbst machen?

Ja, die meisten Schritte erledigen Sie im Admin-Bereich. Wenn Sie bei Weiterleitungen oder E-Mail-Einstellungen nicht weiterkommen, übernehmen wir das im Rahmen unserer [WordPress-Leistung](/de/leistungen/wordpress-unternehmenswebsite).`,
    ),
    seo: {
      title: 'WordPress-Checkliste vor dem Livegang: 7 Schritte',
      description: 'Sieben Schritte vor dem Livegang einer WordPress-Website: Backups, Updates, 301-Weiterleitungen, Sichtbarkeit in der Suche, Formulare, Caching und Mobilansicht.',
    },
  },
  {
    _id: 'post-slow-site-de',
    _type: 'post',
    language: 'de',
    translationKey: 'post-slow-site',
    title: 'Warum ist Ihre Website langsam? Die 5 häufigsten Ursachen',
    slug: slug('warum-ist-ihre-website-langsam'),
    publishedAt: '2026-08-27',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'Eine langsame Website verliert Besucher und Positionen in der Suche. Die meisten Ladezeit-Probleme haben wenige bekannte Ursachen, und die Lösung beginnt mit dem Messen.',
    image: img('post-speed', 'Ein Laptop mit Tachoanzeige und Diagrammen, daneben ein Kaffee'),
    tags: ['Performance', 'WordPress'],
    body: pt(
      'b',
      `Wenn eine Seite mehr als ein paar Sekunden zum Laden braucht, gehen viele Besucher, bevor sie erscheint. Auch Google berücksichtigt die Nutzererfahrung beim Ranking. Die gute Nachricht: Die meisten Ladezeit-Probleme haben wenige bekannte Ursachen, und Sie finden sie durch Messen.

## 1. Nicht zuerst messen

Beginnen Sie mit Zahlen, nicht mit Vermutungen. Google PageSpeed Insights oder Lighthouse zeigt drei Werte:

- **LCP:** Wann das größte Element der Seite erscheint. Ziel: unter 2,5 Sekunden.
- **INP:** Wie schnell die Seite auf einen Klick reagiert. Ziel: unter 200 Millisekunden.
- **CLS:** Wie stark sich Inhalte beim Laden verschieben. Ziel: unter 0,1.

Messen Sie vor und nach jeder Änderung auf dieselbe Weise.

## 2. Zu große Bilder

Die Ursache, die wir am häufigsten sehen: Bilder direkt vom Handy oder von der Kamera, jedes mehrere Megabyte groß. Bringen Sie Bilder auf ihre Anzeigegröße und wandeln Sie sie in WebP oder AVIF um. Das allein macht oft einen großen Unterschied.

## 3. Zu viele Plugins

Jedes Plugin kann eigene Skripte und Styles auf die Seite laden. Löschen Sie die, die Sie nicht nutzen. Wenn zwei Plugins dieselbe Aufgabe erfüllen, behalten Sie eines. Page Builder und Slider sind meist die schwersten.

## 4. Zu schwaches Hosting

Günstiges Shared Hosting wird zum ersten Engpass, wenn die Besucherzahl wächst. Ist die Antwortzeit des Servers, die TTFB, dauerhaft hoch, bringen Verbesserungen am Code nur begrenzt etwas. Manchmal ist ein besserer Server die schnellste Lösung.

## 5. Kein Caching und kein CDN

Wenn Seiten zwischengespeichert und Dateien über ein CDN ausgeliefert werden, bekommen Besucher die Antwort vom nächstgelegenen Standort. Testen Sie nach dem Aktivieren des Cachings dynamische Seiten wie Formulare und den Warenkorb immer erneut.

## Wo Sie anfangen

Messen, das größte Problem beheben, erneut messen. Gehen Sie Schritt für Schritt vor, statt alles auf einmal zu ändern. So sehen Sie, was wirklich geholfen hat.

## Häufige Fragen

### Muss der Lighthouse-Wert 100 sein?

Nein. Der Wert ist ein Werkzeug, nicht das Ziel. Entscheidend ist die Erfahrung echter Besucher. Alles über 90 ist trotzdem ein gutes Zeichen.

### Kann ich Ladezeit-Probleme selbst beheben?

Bildgrößen anpassen und unbenutzte Plugins entfernen sind einfache Schritte. Bei Server, Caching oder Theme findet unser [technischer Support](/de/leistungen/technischer-support) die Ursache und behebt sie.`,
    ),
    seo: {
      title: 'Warum ist Ihre Website langsam? 5 häufige Ursachen',
      description: 'Die fünf häufigsten Ursachen einer langsamen Website und was hilft: LCP, INP und CLS messen, Bildgrößen, Plugins, Hosting, Caching und CDN.',
    },
  },
  {
    _id: 'post-shopify-launch-de',
    _type: 'post',
    language: 'de',
    translationKey: 'post-shopify-launch',
    title: '5 Dinge vor der Eröffnung Ihres Shopify-Shops',
    slug: slug('vor-der-eroeffnung-ihres-shopify-shops'),
    publishedAt: '2026-07-14',
    updatedAt: UPDATED,
    author: 'SUN | WORKS',
    excerpt: 'Mit Theme und Produkten sieht der Shop fertig aus. Ob die erste Bestellung reibungslos läuft, entscheiden aber Zahlung, Versand, Steuern, Rechtstexte und Domain.',
    image: img('post-boutique', 'Eine helle Boutique mit Kleidung an Holzstangen'),
    tags: ['Shopify', 'E-Commerce'],
    body: pt(
      'b',
      `Wenn das Theme steht und die Produkte angelegt sind, sieht ein Shop fertig aus. In der Praxis entscheiden einige Einstellungen im Hintergrund, ob die erste Bestellung reibungslos durchläuft. Diese fünf Bereiche prüfen wir vor jedem Shopify-Start.

## 1. Zahlungsarten

Legen Sie Zahlungsanbieter und Gebühren früh fest. Machen Sie vor dem Start eine kleine Testbestellung mit einer echten Karte und erstatten Sie sie. Nichts zeigt den Bestellablauf besser.

## 2. Versandzonen und Versandkosten

Legen Sie Versandzonen, eine Grenze für kostenlosen Versand und Lieferzeiten fest. Schwere oder sperrige Produkte brauchen eventuell eigene Regeln. Versandkosten, die Kunden erst an der Kasse sehen, sind einer der häufigsten Gründe für abgebrochene Käufe.

## 3. Steuern und Rechnungsangaben

Entscheiden Sie, ob Preise inklusive Steuer angezeigt werden, und tragen Sie Ihre Firmendaten in den Shop-Einstellungen ein. Wenn Sie das mit Ihrem Steuerberater abstimmen, vermeiden Sie spätere Fragen.

## 4. Rechtstexte

Impressum, Widerrufsbelehrung, Datenschutzerklärung, AGB und Kontaktdaten sollten leicht zu finden sein. Diese Seiten schaffen Vertrauen und werden auch von Zahlungsanbietern verlangt.

## 5. Domain und E-Mail

Verbinden Sie Ihre eigene Domain und sorgen Sie dafür, dass Bestell-E-Mails von ihr verschickt werden. Passen Sie die Vorlagen für Benachrichtigungen an den Ton Ihrer Marke an. Zur Einrichtung von Domain und E-Mail lesen Sie [Domain und Hosting](/de/leistungen/domain-und-hosting).

## Am Tag der Eröffnung

Gehen Sie den ganzen Shop auf dem Handy durch. Verfolgen Sie eine Testbestellung bis zum Versand. Dann eröffnen Sie.

## Häufige Fragen

### Wie lange dauert die Einrichtung eines Shopify-Shops?

Das hängt von der Größe des Sortiments und vom Umfang der Anpassungen ab. Bei einem kleinen Sortiment sind zwei bis vier Wochen realistisch.

### Kann ich diese Einstellungen selbst vornehmen?

Ja, alles liegt im Shopify-Admin. Wenn Sie ein eigenes Theme, Apps oder einen Produktkonfigurator brauchen, richten wir das gemeinsam im Rahmen unserer [Shopify-Leistung](/de/leistungen/shopify-shop-einrichten) ein.`,
    ),
    seo: {
      title: '5 Dinge vor der Eröffnung Ihres Shopify-Shops',
      description: 'Vor der Eröffnung Ihres Shopify-Shops: Zahlung, Versand, Steuern, Rechtstexte und Domain. Eine Checkliste für eine reibungslose erste Bestellung.',
    },
  },
];
