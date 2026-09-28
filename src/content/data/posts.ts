import type { Post } from '../schema';
import { pt } from '../pt';
import { img, slug } from './helpers';

export const posts: Post[] = [
  {
    _id: 'post-wp-checklist-tr',
    _type: 'post',
    language: 'tr',
    translationKey: 'post-wp-checklist',
    title: 'WordPress sitenizi yayına almadan önce: kısa bir kontrol listesi',
    slug: slug('wordpress-yayin-oncesi-kontrol-listesi'),
    publishedAt: '2026-09-15',
    author: 'SUN | WORKS',
    excerpt:
      'İlk haftalarda çıkan sorunların çoğu birkaç basit kontrolle önlenebilir. Yayın öncesinde üzerinden geçtiğimiz yedi adım.',
    image: img('planning-board', 'Beyaz bir panoya iğnelenmiş planlama kartlarını düzenleyen bir el'),
    tags: ['WordPress', 'Bakım'],
    body: pt(
      'b',
      `Bir WordPress sitesini yayına almak çoğu zaman "yayınla" düğmesine basmaktan ibaret görünür. Pratikte, ilk haftalarda çıkan sorunların çoğu birkaç basit kontrolle önlenebilir. Aşağıdaki liste, yayın öncesinde üzerinden geçtiğimiz adımların sadeleştirilmiş hâli.

## 1. Yedek ve geri dönüş planı

Yayından önce hem dosyaların hem de veritabanının tam bir yedeğini alın ve bu yedeğin gerçekten geri yüklenebildiğini bir kez deneyin. Yedeği, sitenin bulunduğu sunucudan farklı bir yerde saklayın.

## 2. Güncellemeler ve gereksiz eklentiler

WordPress çekirdeğini, temayı ve eklentileri güncelleyin. Kullanmadığınız eklenti ve temaları yalnızca devre dışı bırakmak yerine tamamen silin; güncellenmeyen her eklenti ileride sorun çıkarabilir.

## 3. Kalıcı bağlantılar ve yönlendirmeler

**Ayarlar › Kalıcı bağlantılar** bölümünden okunaklı bir yapı seçin. Eski bir siteden geçiş yapıyorsanız, önemli eski adresleri yeni sayfalara 301 ile yönlendirin.

## 4. Arama motoru görünürlüğü

Geliştirme sırasında açılan "Arama motorlarının bu siteyi dizine eklemesini engelle" seçeneği, yayına alırken en sık unutulan ayarlardan biridir. **Ayarlar › Okuma** bölümünden kapalı olduğunu kontrol edin.

## 5. Formlar ve e-posta

İletişim formunu gerçek bir adresle test edin ve mesajın gerçekten ulaştığından emin olun. Paylaşımlı hosting'de WordPress'in gönderdiği e-postalar spam klasörüne düşebilir; bu durumda bir SMTP eklentisiyle doğrulanmış bir gönderici kullanmak genellikle işe yarar.

## 6. Önbellek ve görseller

Önbellek eklentisini en son etkinleştirin; ardından formları, menüleri ve varsa sepet sayfasını yeniden deneyin. Görselleri yüklemeden önce makul boyutlara küçültmek çoğu zaman eklentilerden daha fazla fark yaratır.

## 7. Mobil ve tarayıcı kontrolü

Siteyi en az bir telefonda ve bir masaüstü tarayıcıda baştan sona gezin:

- Menü ve alt bilgideki bağlantılar
- Formlar ve teşekkür mesajları
- Dış bağlantılar ve indirilebilir dosyalar
- Yasal sayfalar (gizlilik, çerezler)

## Yayından sonra

İlk hafta hata kayıtlarına ve form mesajlarına göz atmak, küçük sorunları büyümeden yakalamanın en kolay yolu. Bu listeyle ilgili bir sorunuz varsa [iletişim sayfasından](/iletisim) bize yazabilirsiniz.`,
    ),
    seo: {
      description: 'WordPress sitesini yayına almadan önce yedek, güncelleme, yönlendirme, arama görünürlüğü, form ve önbellek kontrolleri.',
    },
  },
  {
    _id: 'post-wp-checklist-en',
    _type: 'post',
    language: 'en',
    translationKey: 'post-wp-checklist',
    title: 'Before you launch a WordPress site: a short checklist',
    slug: slug('wordpress-pre-launch-checklist'),
    publishedAt: '2026-09-15',
    author: 'SUN | WORKS',
    excerpt:
      'Most problems in the first weeks after launch can be avoided with a few simple checks. Here are the seven steps we go through before going live.',
    image: img('planning-board', 'A hand arranging planning cards pinned to a white board'),
    tags: ['WordPress', 'Maintenance'],
    body: pt(
      'b',
      `Launching a WordPress site often looks like nothing more than pressing "Publish". In practice, most problems in the first weeks can be avoided with a few simple checks. The list below is a simplified version of the steps we go through before launch.

## 1. Backups and a way back

Before launch, take a full backup of both the files and the database, and try restoring it once to make sure it actually works. Keep the backup somewhere other than the server the site lives on.

## 2. Updates and unused plugins

Update WordPress core, your theme and your plugins. Delete plugins and themes you do not use instead of only deactivating them; every plugin that stops getting updates can cause trouble later.

## 3. Permalinks and redirects

Choose a readable structure under **Settings › Permalinks**. If you are moving from an old site, add 301 redirects from important old URLs to the new pages.

## 4. Search engine visibility

The "Discourage search engines from indexing this site" option, switched on during development, is one of the settings most often forgotten at launch. Check under **Settings › Reading** that it is off.

## 5. Forms and email

Test the contact form with a real address and make sure the message actually arrives. On shared hosting, emails sent by WordPress can land in spam; using an SMTP plugin with a verified sender usually helps.

## 6. Cache and images

Turn on the caching plugin last, then test forms, menus and the cart page (if you have one) again. Resizing images to sensible dimensions before uploading them often makes more difference than any plugin.

## 7. Mobile and browser check

Go through the whole site on at least one phone and one desktop browser:

- Links in the menu and footer
- Forms and thank-you messages
- External links and downloadable files
- Legal pages (privacy, cookies)

## After launch

Checking error logs and form messages during the first week is the easiest way to catch small problems before they grow. If you have a question about this list, you can write to us from the [contact page](/en/contact).`,
    ),
    seo: {
      description: 'Pre-launch WordPress checks: backups, updates, redirects, search visibility, forms and caching.',
    },
  },
  {
    _id: 'post-slow-site-tr',
    _type: 'post',
    language: 'tr',
    translationKey: 'post-slow-site',
    title: 'Siteniz neden yavaş? En sık karşılaştığımız beş sebep',
    slug: slug('siteniz-neden-yavas'),
    publishedAt: '2026-08-27',
    author: 'SUN | WORKS',
    excerpt: 'Yavaş bir site ziyaretçiyi de arama motorunu da kaçırır. Hız sorunlarının çoğu birkaç tanıdık kaynaktan gelir; hepsinin çözümü de ölçmekle başlar.',
    image: img('dashboard-laptop', 'Ekranında grafikler açık bir dizüstü bilgisayar'),
    tags: ['Performans', 'WordPress'],
    body: pt(
      'b',
      `Bir sayfanın açılması iki saniyeyi geçtiğinde ziyaretçilerin önemli bir kısmı beklemeden ayrılır. İyi haber şu: hız sorunlarının çoğu birkaç tanıdık kaynaktan gelir ve neredeyse hepsi ölçülerek bulunabilir.

## 1. Önce ölçün

Tahminle değil ölçümle başlayın. Google PageSpeed Insights ya da Lighthouse, en büyük içeriğin ne zaman göründüğünü (LCP) ve sayfanın ne kadar süre tepkisiz kaldığını gösterir. Değişiklikten önce ve sonra aynı ölçümü alın.

## 2. Büyük görseller

En sık rastladığımız sebep, telefondan ya da kameradan olduğu gibi yüklenmiş birkaç megabaytlık görsellerdir. Görselleri gösterileceği boyuta küçültmek ve WebP gibi modern bir biçime çevirmek çoğu zaman tek başına ciddi fark yaratır.

## 3. Gereğinden fazla eklenti

Her eklenti sayfaya kendi betiğini ve stil dosyasını ekleyebilir. Kullanılmayan eklentileri kaldırın; benzer işi yapan birden fazla eklenti varsa birini seçin.

## 4. Barındırma

Ucuz paylaşımlı barındırma, trafik arttığında ilk darboğaz olur. Sunucunun yanıt süresi (TTFB) sürekli yüksekse, kod tarafındaki iyileştirmeler sınırlı kalır.

## 5. Önbellek ve CDN

Sayfaları önbelleğe almak ve statik dosyaları bir CDN üzerinden sunmak, ziyaretçiye en yakın noktadan yanıt verilmesini sağlar. Önbelleği açtıktan sonra form ve sepet gibi dinamik sayfaları mutlaka yeniden test edin.

## Nereden başlamalı?

Ölçüm alın, en büyük kalemi düzeltin, yeniden ölçün. Sitenizin hızıyla ilgili bir değerlendirme isterseniz [iletişim sayfamızdan](/iletisim) yazabilirsiniz.`,
    ),
    seo: { description: 'Yavaş web sitelerinin en sık beş sebebi: ölçüm, görseller, eklentiler, barındırma ve önbellek.' },
  },
  {
    _id: 'post-slow-site-en',
    _type: 'post',
    language: 'en',
    translationKey: 'post-slow-site',
    title: 'Why is your site slow? The five causes we see most',
    slug: slug('why-is-your-site-slow'),
    publishedAt: '2026-08-27',
    author: 'SUN | WORKS',
    excerpt: 'A slow site loses visitors and search rankings alike. Most speed problems come from a few familiar places, and every fix starts with a measurement.',
    image: img('dashboard-laptop', 'A laptop showing charts on its screen'),
    tags: ['Performance', 'WordPress'],
    body: pt(
      'b',
      `When a page takes more than two seconds to load, a large share of visitors leave without waiting. The good news: most speed problems come from a few familiar places, and nearly all of them can be found by measuring.

## 1. Measure first

Start from numbers, not guesses. Google PageSpeed Insights or Lighthouse shows when the largest content appears (LCP) and how long the page stays unresponsive. Take the same measurement before and after every change.

## 2. Oversized images

The most common cause we find is a handful of multi-megabyte images uploaded straight from a phone or camera. Resizing them to the size they are shown at and converting them to a modern format such as WebP often makes a big difference on its own.

## 3. Too many plugins

Every plugin can add its own scripts and stylesheets to the page. Remove the ones you do not use, and where several do the same job, keep one.

## 4. Hosting

Cheap shared hosting is the first bottleneck when traffic grows. If the server's response time (TTFB) is consistently high, improvements on the code side can only go so far.

## 5. Caching and a CDN

Caching pages and serving static files through a CDN lets visitors get a response from the nearest point. After turning caching on, always re-test dynamic pages such as forms and the cart.

## Where to start

Measure, fix the biggest item, measure again. If you would like an assessment of your site's speed, write to us from our [contact page](/en/contact).`,
    ),
    seo: { description: 'The five most common causes of slow websites: measurement, images, plugins, hosting and caching.' },
  },
  {
    _id: 'post-shopify-launch-tr',
    _type: 'post',
    language: 'tr',
    translationKey: 'post-shopify-launch',
    title: 'Shopify mağazanızı açmadan önce ayarlamanız gereken beş şey',
    slug: slug('shopify-magaza-acmadan-once'),
    publishedAt: '2026-07-14',
    author: 'SUN | WORKS',
    excerpt: 'Tema ve ürünler hazır olduğunda mağaza da hazır görünür. Ama ödemeden kargoya, yasal sayfalardan alan adına kadar birkaç ayar ilk siparişin sorunsuz geçmesini belirler.',
    image: img('clothing-store', 'Askılarda kıyafetlerin sergilendiği aydınlık bir mağaza'),
    tags: ['Shopify', 'E-ticaret'],
    body: pt(
      'b',
      `Tema seçilip ürünler eklendiğinde mağaza hazır görünür. Pratikte ilk siparişin sorunsuz geçmesini birkaç arka plan ayarı belirler. Mağaza açılışlarında üzerinden geçtiğimiz beş başlık şunlar.

## 1. Ödeme yöntemleri

Hangi ödeme sağlayıcısını kullanacağınızı ve komisyon oranlarını baştan netleştirin. Açılıştan önce gerçek bir kartla küçük bir test siparişi verip iade edin; ödeme akışını en iyi bu gösterir.

## 2. Kargo bölgeleri ve ücretleri

Kargo bölgelerini, ücretsiz kargo eşiğini ve teslim sürelerini tanımlayın. Ağır ya da büyük ürünler için ayrı kurallar gerekebilir.

## 3. Vergiler ve fatura bilgileri

Fiyatların vergi dahil mi gösterileceğine karar verin ve mağaza ayarlarındaki şirket bilgilerini eksiksiz doldurun. Muhasebecinizle birlikte kontrol etmek sonradan çıkacak soruları önler.

## 4. Yasal sayfalar

İade ve değişim koşulları, gizlilik politikası, mesafeli satış sözleşmesi ve iletişim bilgileri açıkça erişilebilir olmalı. Bu sayfalar hem güven verir hem de ödeme sağlayıcılarının istediği bilgilerdir.

## 5. Alan adı ve e-posta

Kendi alan adınızı bağlayın ve sipariş e-postalarının bu alan adından gönderildiğinden emin olun. Bildirim şablonlarını marka dilinize göre düzenleyin.

## Açılış günü

Son olarak mağazayı telefondan baştan sona gezin ve bir test siparişini kargoya kadar takip edin. Mağaza kurulumu için destek isterseniz [bize yazın](/iletisim).`,
    ),
    seo: { description: 'Shopify mağazası açmadan önce: ödeme, kargo, vergi, yasal sayfalar ve alan adı ayarları.' },
  },
  {
    _id: 'post-shopify-launch-en',
    _type: 'post',
    language: 'en',
    translationKey: 'post-shopify-launch',
    title: 'Five things to set up before you open your Shopify store',
    slug: slug('before-opening-your-shopify-store'),
    publishedAt: '2026-07-14',
    author: 'SUN | WORKS',
    excerpt: 'Once the theme and products are in, the store looks ready. But a few settings, from payments and shipping to legal pages and the domain, decide whether the first order goes smoothly.',
    image: img('clothing-store', 'A bright shop with clothes displayed on rails'),
    tags: ['Shopify', 'E-commerce'],
    body: pt(
      'b',
      `With a theme chosen and products added, a store looks ready. In practice, a few settings behind the scenes decide whether the first order goes smoothly. These are the five areas we go through at every store launch.

## 1. Payment methods

Settle early on which payment provider you will use and what it charges. Before launch, place a small test order with a real card and refund it; nothing shows the checkout flow better.

## 2. Shipping zones and rates

Define shipping zones, a free-shipping threshold and delivery times. Heavy or bulky products may need their own rules.

## 3. Taxes and invoice details

Decide whether prices are shown with tax included, and fill in the company details in the store settings completely. Checking them with your accountant avoids questions later.

## 4. Legal pages

Returns and exchanges, the privacy policy, terms of sale and contact details should all be easy to find. They build trust, and payment providers ask for them too.

## 5. Domain and email

Connect your own domain and make sure order emails are sent from it. Edit the notification templates to match your brand's voice.

## Launch day

Finally, browse the whole store on a phone and follow a test order all the way to shipping. If you would like help setting up your store, [get in touch](/en/contact).`,
    ),
    seo: { description: 'Before opening a Shopify store: payments, shipping, taxes, legal pages and domain settings.' },
  },
];
