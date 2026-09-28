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
    author: 'Uğur Güneş',
    excerpt:
      'İlk haftalarda çıkan sorunların çoğu birkaç basit kontrolle önlenebilir. Yayın öncesinde üzerinden geçtiğim yedi adım.',
    image: img('planning-board', 'Beyaz bir panoya iğnelenmiş planlama kartlarını düzenleyen bir el'),
    tags: ['WordPress', 'Bakım'],
    body: pt(
      'b',
      `Bir WordPress sitesini yayına almak çoğu zaman "yayınla" düğmesine basmaktan ibaret görünür. Pratikte, ilk haftalarda çıkan sorunların çoğu birkaç basit kontrolle önlenebilir. Aşağıdaki liste, yayın öncesinde üzerinden geçtiğim adımların sadeleştirilmiş hâli.

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

İlk hafta hata kayıtlarına ve form mesajlarına göz atmak, küçük sorunları büyümeden yakalamanın en kolay yolu. Bu listeyle ilgili bir sorunuz varsa [iletişim sayfasından](/iletisim) yazabilirsiniz.`,
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
    author: 'Uğur Güneş',
    excerpt:
      'Most problems in the first weeks after launch can be avoided with a few simple checks. Here are the seven steps I go through before going live.',
    image: img('planning-board', 'A hand arranging planning cards pinned to a white board'),
    tags: ['WordPress', 'Maintenance'],
    body: pt(
      'b',
      `Launching a WordPress site often looks like nothing more than pressing "Publish". In practice, most problems in the first weeks can be avoided with a few simple checks. The list below is a simplified version of the steps I go through before launch.

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

Checking error logs and form messages during the first week is the easiest way to catch small problems before they grow. If you have a question about this list, you can write to me from the [contact page](/en/contact).`,
    ),
    seo: {
      description: 'Pre-launch WordPress checks: backups, updates, redirects, search visibility, forms and caching.',
    },
  },
];
