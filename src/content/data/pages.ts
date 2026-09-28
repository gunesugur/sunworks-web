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
    intro: 'Projenizi, mevcut sitenizdeki bir sorunu ya da aklınızdaki bir soruyu yazın; en kısa sürede e-postayla dönüş yaparız.',
    body: pt(
      'c',
      `Mesajınıza sitenizin adresini ve kullandığınız platformu (WordPress, Shopify ya da başka) eklerseniz size daha hızlı yardımcı olabiliriz.`,
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
    intro: 'Tell us about your project, a problem with your current site, or a question you have. We reply by email as soon as we can.',
    body: pt(
      'c',
      `If you include your site's address and the platform you use (WordPress, Shopify or something else), we can help you faster.`,
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
    intro: '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, bu sitede hangi kişisel verileri neden işlediğimizi açıklar.',
    body: pt(
      'p',
      `## Veri sorumlusu

Veri sorumlusu: Uğur Güneş (SUN | WORKS). Kişisel verilerinizle ilgili tüm talepleriniz için [hello@sunworks.studio](mailto:hello@sunworks.studio) adresine yazabilirsiniz.

## İşlediğimiz veriler ve amaçları

- **İletişim formu:** Ad, e-posta adresi, konu ve mesajınız; yalnızca talebinize yanıt vermek için.
- **Bülten:** E-posta adresiniz; yalnızca yeni yazılarımızı duyurmak için.
- **Güvenlik:** Formların kötüye kullanımını önlemek için Cloudflare Turnstile doğrulaması ve IP adresinizin geri döndürülemez bir özeti.
- **Barındırma:** Siteyi size ulaştırmak için sunucunun işlediği IP adresi, tarayıcı bilgisi ve ziyaret edilen sayfa gibi teknik veriler.

Sitede analiz, reklam ya da takip aracı kullanmıyoruz.

## Hukuki sebep

Formlardaki veriler açık rızanıza ve talebinize yanıt verebilmemiz için meşru menfaatimize; güvenlik ve barındırma verileri ise hizmetin güvenli şekilde sunulmasına dayanır (KVKK m. 5).

## Aktarım

Site ve form verileri, barındırma hizmeti aldığımız Cloudflare'in altyapısında saklanır; bu nedenle verileriniz yurt dışındaki sunucularda işlenebilir. Verilerinizi başka hiçbir üçüncü kişiyle paylaşmayız ve satmayız.

## Saklama süresi

- İletişim mesajları, talebiniz sonuçlandıktan sonra en geç 12 ay içinde silinir.
- Bülten kaydınız, listeden çıkana kadar saklanır.
- Güvenlik amaçlı IP özetleri 24 saat içinde silinir.

## Haklarınız

KVKK'nın 11. maddesi uyarınca verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini ya da silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz. Taleplerinizi [hello@sunworks.studio](mailto:hello@sunworks.studio) adresine iletebilirsiniz; en geç 30 gün içinde yanıtlarız.

Çerezler ve tarayıcı depolaması için [çerez politikasına](/cerez-politikasi) bakabilirsiniz.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS gizlilik politikası: hangi kişisel verileri, hangi amaçla ve ne kadar süre işlediğimiz.' },
  },
  {
    _id: 'page-privacy-en',
    _type: 'page',
    language: 'en',
    translationKey: 'page-privacy',
    kind: 'legal',
    title: 'Privacy policy',
    slug: slug('privacy'),
    intro: 'Which personal data this site processes, why, and for how long — under Turkish data protection law (KVKK No. 6698).',
    body: pt(
      'p',
      `## Data controller

The data controller is Uğur Güneş (SUN | WORKS). For any request about your personal data, write to [hello@sunworks.studio](mailto:hello@sunworks.studio).

## Data we process and why

- **Contact form:** Your name, email address, topic and message, only to reply to your request.
- **Newsletter:** Your email address, only to announce new articles.
- **Security:** Cloudflare Turnstile verification and a one-way hash of your IP address, to prevent abuse of the forms.
- **Hosting:** Technical data such as your IP address, browser details and the page you visit, processed by the server to deliver the site.

We use no analytics, advertising or tracking tools.

## Legal basis

Form data is processed with your explicit consent and our legitimate interest in replying to you; security and hosting data is processed to provide the service securely (KVKK Art. 5).

## Transfers

The site and form data are stored on the infrastructure of Cloudflare, our hosting provider, so your data may be processed on servers outside Türkiye. We do not share your data with anyone else and we never sell it.

## Retention

- Contact messages are deleted within 12 months after your request is closed.
- Your newsletter sign-up is kept until you unsubscribe.
- IP hashes used for security are deleted within 24 hours.

## Your rights

Under Article 11 of the KVKK you can ask whether your data is processed, request information, ask for it to be corrected or deleted, and object to its processing. Send requests to [hello@sunworks.studio](mailto:hello@sunworks.studio); we reply within 30 days.

For cookies and browser storage, see the [cookie policy](/en/cookies).`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS privacy policy: which personal data we process, why, and for how long.' },
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
    intro: 'Bu siteyi kullanırken geçerli olan koşullar.',
    body: pt(
      't',
      `## Bilgilendirme

Sitedeki bilgiler SUN | WORKS hizmetlerini tanıtmak amacıyla hazırlanmıştır ve teklif niteliği taşımaz. Her projenin kapsamı, süresi ve ücreti ayrıca yazılı olarak belirlenir.

## Fikri haklar

Sitedeki metinler, tasarım ve logo SUN | WORKS'e aittir; izinsiz kopyalanamaz. Fotoğraflar Unsplash lisansı kapsamında kullanılmaktadır.

## Blog içerikleri

Blog yazılarındaki öneriler genel niteliktedir. Kendi sitenizde uygulamadan önce yedek almanızı öneririz.

## Formlar

Formları yalnızca gerçek talepler için kullanın. Otomatik ya da kötüye kullanım amaçlı gönderimler engellenir.

## Değişiklikler

Bu koşulları gerektiğinde güncelleyebiliriz. Güncel sürüm her zaman bu sayfadadır.`,
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
    intro: 'The terms that apply when you use this site.',
    body: pt(
      't',
      `## Information only

The information on this site presents SUN | WORKS services and is not an offer. The scope, timeline and fee of each project are agreed separately in writing.

## Intellectual property

The text, design and logo on this site belong to SUN | WORKS and may not be copied without permission. Photos are used under the Unsplash license.

## Blog content

Advice in blog posts is general. We recommend taking a backup before applying it to your own site.

## Forms

Please use the forms for genuine requests only. Automated or abusive submissions are blocked.

## Changes

We may update these terms when needed. The current version is always on this page.`,
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
    intro: 'Bu sitede reklam ya da takip çerezi kullanmıyoruz. Tarayıcınızda saklanan her şeyin listesi aşağıda.',
    body: pt(
      'k',
      `## Zorunlu

Sitenin çalışması ve tercihlerinizin hatırlanması için gereklidir; kapatılamaz.

- **sw-consent** (bu site, tarayıcı depolaması): Çerez tercihlerinizi saklar. Süre: 12 ay.
- **sw-prefs** (bu site, tarayıcı depolaması): Tema ve erişilebilirlik ayarlarınızı saklar. Yalnızca bir ayarı değiştirdiğinizde oluşur; siz silene kadar kalır.
- **sw-intro** (bu site, oturum depolaması): Açılış animasyonunun aynı oturumda tekrar gösterilmemesini sağlar. Sekmeyi kapattığınızda silinir.
- **Cloudflare ve Turnstile** (üçüncü taraf): Siteyi saldırılara karşı korumak ve formların bir insan tarafından gönderildiğini doğrulamak için güvenlik çerezleri ayarlayabilir.

## İşlevsel

Yalnızca izin verirseniz çalışır.

- **OpenStreetMap** (üçüncü taraf): İletişim sayfasındaki haritayı gösterir. Harita yüklendiğinde IP adresiniz OpenStreetMap'e iletilir.

## Analiz ve pazarlama

Kullanmıyoruz.

## Tercihlerinizi değiştirme

Tercihlerinizi istediğiniz zaman sayfanın altındaki **Çerez tercihleri** bağlantısından değiştirebilirsiniz. Ayrıntılar için [gizlilik politikasına](/gizlilik) bakabilirsiniz.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS çerez politikası: kullandığımız çerezler, amaçları ve süreleri.' },
  },
  {
    _id: 'page-cookies-en',
    _type: 'page',
    language: 'en',
    translationKey: 'page-cookies',
    kind: 'legal',
    title: 'Cookie policy',
    slug: slug('cookies'),
    intro: 'We use no advertising or tracking cookies. Below is everything that may be stored in your browser.',
    body: pt(
      'k',
      `## Necessary

Needed for the site to work and to remember your choices; these cannot be switched off.

- **sw-consent** (this site, browser storage): Stores your cookie choices. Duration: 12 months.
- **sw-prefs** (this site, browser storage): Stores your theme and accessibility settings. Created only when you change a setting; kept until you clear it.
- **sw-intro** (this site, session storage): Keeps the intro animation from replaying during the same session. Cleared when you close the tab.
- **Cloudflare and Turnstile** (third party): May set security cookies to protect the site from attacks and to check that forms are sent by a person.

## Functional

Only used if you allow them.

- **OpenStreetMap** (third party): Shows the map on the contact page. When the map loads, your IP address is sent to OpenStreetMap.

## Analytics and marketing

We do not use any.

## Changing your choices

You can change your choices at any time with the **Cookie settings** link at the bottom of every page. See the [privacy policy](/en/privacy) for details.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS cookie policy: the cookies we use, why, and for how long.' },
  },
];
