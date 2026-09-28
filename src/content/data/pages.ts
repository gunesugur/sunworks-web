import type { Page } from '../schema';
import { pt } from '../pt';
import { slug } from './helpers';

const UPDATED = '2026-09-28';

export const pages: Page[] = [
  // ---------- Contact ----------
  {
    _id: 'page-contact-tr',
    _type: 'page',
    language: 'tr',
    translationKey: 'page-contact',
    kind: 'contact',
    title: 'İletişim',
    slug: slug('iletisim'),
    intro:
      'Projenizi, mevcut sitenizdeki bir sorunu ya da yalnızca bir sorunuzu yazın. Mesajınızı okuyup e-postayla dönüş yaparım.',
    body: pt(
      'c',
      `Mesajınıza sitenizin adresini ve kullandığınız platformu (WordPress, Shopify ya da başka) eklerseniz daha hızlı yardımcı olabilirim.`,
    ),
    legalReviewRequired: false,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS ile iletişime geçin: WordPress, Shopify ve teknik destek talepleri için form ve e-posta.' },
  },
  {
    _id: 'page-contact-en',
    _type: 'page',
    language: 'en',
    translationKey: 'page-contact',
    kind: 'contact',
    title: 'Contact',
    slug: slug('contact'),
    intro:
      'Tell me about your project, a problem with your current site, or just ask a question. I read every message and reply by email.',
    body: pt(
      'c',
      `If you include your site's address and the platform you use (WordPress, Shopify or something else), I can help you faster.`,
    ),
    legalReviewRequired: false,
    updatedAt: UPDATED,
    seo: { description: 'Get in touch with SUN | WORKS about WordPress, Shopify or technical support work.' },
  },

  // ---------- Privacy ----------
  {
    _id: 'page-privacy-tr',
    _type: 'page',
    language: 'tr',
    translationKey: 'page-privacy',
    kind: 'legal',
    title: 'Gizlilik politikası',
    slug: slug('gizlilik'),
    intro: 'Bu sayfa, bu sitede gerçekten işlenen verileri ve bunların nerede saklandığını anlatır.',
    body: pt(
      'p',
      `## Veri sorumlusu

Bu site, Bursa'da serbest çalışan Uğur Güneş tarafından işletilir. Kişisel verilerinizle ilgili her talep için [hello@sunworks.studio](mailto:hello@sunworks.studio) adresine yazabilirsiniz.

## Barındırma ve sunucu kayıtları

Site Cloudflare Workers üzerinde barındırılır. Her istekte IP adresiniz, tarayıcı bilgileriniz ve istenen sayfa gibi teknik veriler Cloudflare tarafından işlenir. Hata ayıklama amacıyla Cloudflare'in sağladığı çalışma kayıtları (observability) açıktır; bu kayıtlar Cloudflare'in saklama sürelerine tabidir.

## İletişim formu

Formu gönderdiğinizde adınız, e-posta adresiniz, seçtiğiniz konu, mesajınız ve sayfa dili Cloudflare D1 veritabanında saklanır. Bu veriler yalnızca size dönüş yapmak için kullanılır. Talebiniz sonuçlandıktan sonra en geç 12 ay içinde elle silinir. Şu anda form mesajları e-postayla iletilmez; yalnızca veritabanına kaydedilir.

## Bülten

Bültene kaydolduğunuzda e-posta adresiniz ve sayfa dili aynı veritabanında saklanır. Şu anda bülten e-postası gönderilmemektedir. Listeden çıkmak için [hello@sunworks.studio](mailto:hello@sunworks.studio) adresine yazmanız yeterlidir; kaydınız silinir.

## Kötüye kullanımı önleme

Formlar Cloudflare Turnstile ile korunur. Turnstile, bir insan tarafından gönderildiğini doğrulamak için tarayıcınızdan bazı teknik sinyalleri Cloudflare'e iletir; doğrulama sırasında sunucumuz da IP adresinizi Cloudflare'e gönderir. Ayrıca aşırı istekleri sınırlamak için IP adresinizin gizli bir anahtarla oluşturulmuş tek yönlü özeti (hash) en fazla 24 saat saklanır; IP adresinin kendisi saklanmaz.

## Harita

İletişim sayfasındaki harita, siz "Haritayı yükle" düğmesine basmadan yüklenmez. Yüklediğinizde harita OpenStreetMap sunucularından gelir ve IP adresiniz OpenStreetMap'e iletilir.

## Yazı tipleri, analiz ve reklam

Yazı tipleri bu sitenin kendi sunucusundan yüklenir. Sitede analiz, reklam ya da izleme aracı kullanılmaz.

## Haklarınız

Hakkınızda saklanan verilere erişmek, düzeltilmesini ya da silinmesini istemek için [hello@sunworks.studio](mailto:hello@sunworks.studio) adresine yazabilirsiniz.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS gizlilik politikası: iletişim formu, bülten, Turnstile ve barındırma sırasında işlenen veriler.' },
  },
  {
    _id: 'page-privacy-en',
    _type: 'page',
    language: 'en',
    translationKey: 'page-privacy',
    kind: 'legal',
    title: 'Privacy policy',
    slug: slug('privacy'),
    intro: 'This page describes the data this site actually processes and where it is stored.',
    body: pt(
      'p',
      `## Who is responsible

This site is run by Uğur Güneş, a freelancer based in Bursa, Türkiye. For any request about your personal data, write to [hello@sunworks.studio](mailto:hello@sunworks.studio).

## Hosting and server logs

The site is hosted on Cloudflare Workers. On every request, technical data such as your IP address, browser details and the requested page are processed by Cloudflare. Cloudflare's runtime logs (observability) are enabled for debugging and are subject to Cloudflare's retention periods.

## Contact form

When you submit the form, your name, email address, chosen topic, message and page language are stored in a Cloudflare D1 database. This data is only used to reply to you. It is deleted manually within 12 months after your request is closed. Form messages are currently not forwarded by email; they are only stored in the database.

## Newsletter

When you sign up, your email address and page language are stored in the same database. No newsletter emails are being sent yet. To leave the list, write to [hello@sunworks.studio](mailto:hello@sunworks.studio) and your entry will be deleted.

## Abuse prevention

Forms are protected by Cloudflare Turnstile, which sends some technical signals from your browser to Cloudflare to check that a person is submitting the form; during verification our server also sends your IP address to Cloudflare. To limit excessive requests, a one-way hash of your IP address created with a secret key is stored for up to 24 hours; the IP address itself is not stored.

## Map

The map on the contact page is not loaded until you press "Load map". When you do, the map is served by OpenStreetMap and your IP address is sent to OpenStreetMap.

## Fonts, analytics and ads

Fonts are served from this site's own server. The site uses no analytics, advertising or tracking tools.

## Your rights

To access, correct or delete data stored about you, write to [hello@sunworks.studio](mailto:hello@sunworks.studio).`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS privacy policy: data processed by the contact form, newsletter, Turnstile and hosting.' },
  },

  // ---------- Terms ----------
  {
    _id: 'page-terms-tr',
    _type: 'page',
    language: 'tr',
    translationKey: 'page-terms',
    kind: 'legal',
    title: 'Kullanım koşulları',
    slug: slug('kullanim-kosullari'),
    intro: 'Bu siteyi kullanırken geçerli olan temel koşullar.',
    body: pt(
      't',
      `## Sitenin amacı

Bu site, Uğur Güneş'in serbest çalışan olarak sunduğu web hizmetlerini tanıtmak ve iletişim kurmak için hazırlanmıştır. Sitedeki bilgiler genel bilgilendirme amaçlıdır ve bir teklif niteliği taşımaz. Her iş için kapsam, süre ve ücret ayrıca yazılı olarak kararlaştırılır.

## İçerik

Sitedeki metinler Uğur Güneş'e aittir. Fotoğraflar Unsplash lisansı kapsamında kullanılan görsellerdir. Blog yazılarındaki öneriler genel niteliktedir; kendi sitenize uygulamadan önce yedek almanızı öneririm.

## Formların kullanımı

İletişim ve bülten formlarını yalnızca gerçek talepler için kullanmanız beklenir. Otomatik veya kötüye kullanım amaçlı gönderimler engellenebilir.

## Dış bağlantılar

Site, üçüncü taraf sitelere bağlantılar içerebilir. Bu sitelerin içeriğinden ve gizlilik uygulamalarından ilgili siteler sorumludur.

## Değişiklikler

Bu koşullar zaman zaman güncellenebilir. Güncel sürüm her zaman bu sayfada yer alır.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS web sitesinin kullanım koşulları.' },
  },
  {
    _id: 'page-terms-en',
    _type: 'page',
    language: 'en',
    translationKey: 'page-terms',
    kind: 'legal',
    title: 'Terms of use',
    slug: slug('terms'),
    intro: 'The basic terms that apply when you use this site.',
    body: pt(
      't',
      `## Purpose of the site

This site presents the web services Uğur Güneş offers as a freelancer and makes it possible to get in touch. The information here is general and is not an offer. Scope, timeline and fees for each job are agreed separately in writing.

## Content

The text on this site belongs to Uğur Güneş. Photos are used under the Unsplash license. Advice in blog posts is general; I recommend taking a backup before applying it to your own site.

## Using the forms

Please use the contact and newsletter forms for genuine requests only. Automated or abusive submissions may be blocked.

## External links

The site may link to third-party sites. Those sites are responsible for their own content and privacy practices.

## Changes

These terms may be updated from time to time. The current version is always on this page.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'Terms of use for the SUN | WORKS website.' },
  },

  // ---------- Cookies ----------
  {
    _id: 'page-cookies-tr',
    _type: 'page',
    language: 'tr',
    translationKey: 'page-cookies',
    kind: 'legal',
    title: 'Çerez politikası',
    slug: slug('cerez-politikasi'),
    intro: 'Bu site kendi çerezlerini kullanmaz. Aşağıda tarayıcınızda saklanabilecek her şeyi bulabilirsiniz.',
    body: pt(
      'k',
      `## Bu sitenin kendi çerezleri

Yok. Oturum açma, analiz ya da reklam çerezi kullanılmaz.

## Tarayıcı depolaması

Açılış animasyonunun aynı oturumda tekrar gösterilmemesi için tarayıcınızın oturum depolamasına (sessionStorage) tek bir işaret yazılır. Bu bilgi sunucuya gönderilmez ve tarayıcı sekmesini kapattığınızda silinir.

## Üçüncü taraflar

- **Cloudflare:** Siteyi barındıran ve koruyan Cloudflare, güvenlik amacıyla zorunlu çerezler ayarlayabilir.
- **Cloudflare Turnstile:** Formların bulunduğu sayfalarda bot korumasını sağlar ve tarayıcınızdan teknik sinyaller toplar.
- **OpenStreetMap:** Yalnızca iletişim sayfasında "Haritayı yükle" düğmesine bastığınızda yüklenir.

Ayrıntılar için [gizlilik politikasına](/gizlilik) bakabilirsiniz.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS çerez politikası: kendi çerezimiz yok; Cloudflare, Turnstile ve OpenStreetMap hakkında bilgiler.' },
  },
  {
    _id: 'page-cookies-en',
    _type: 'page',
    language: 'en',
    translationKey: 'page-cookies',
    kind: 'legal',
    title: 'Cookie policy',
    slug: slug('cookies'),
    intro: 'This site does not set cookies of its own. Below is everything that may be stored in your browser.',
    body: pt(
      'k',
      `## Cookies set by this site

None. There are no login, analytics or advertising cookies.

## Browser storage

To avoid replaying the intro animation during the same session, a single flag is written to your browser's session storage (sessionStorage). It is never sent to the server and is cleared when you close the tab.

## Third parties

- **Cloudflare:** Cloudflare hosts and protects the site and may set strictly necessary security cookies.
- **Cloudflare Turnstile:** Provides bot protection on pages with forms and collects technical signals from your browser.
- **OpenStreetMap:** Loaded only when you press "Load map" on the contact page.

See the [privacy policy](/en/privacy) for details.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS cookie policy: no first-party cookies; details on Cloudflare, Turnstile and OpenStreetMap.' },
  },
];
