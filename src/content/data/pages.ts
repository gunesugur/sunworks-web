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
    intro: 'Yeni bir proje, mevcut sitenizde bir sorun ya da bir soru. Yazın, 24 saat içinde e-postayla dönelim.',
    body: pt(
      'c',
      `Mesajınıza sitenizin adresini ve kullandığınız platformu (WordPress, Shopify ya da başka) eklerseniz size daha hızlı yardımcı olabiliriz.`,
    ),
    legalReviewRequired: false,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS ile iletişime geçin. WordPress, Shopify, AI destekli geliştirme ve teknik destek talepleri için form ve e-posta.' },
  },
  {
    _id: 'page-contact-en',
    _type: 'page',
    language: 'en',
    translationKey: 'page-contact',
    kind: 'contact',
    title: 'Contact',
    slug: slug('contact'),
    intro: 'A new project, a problem with your current site, or a question. Write to us and we will reply by email within 24 hours.',
    body: pt(
      'c',
      `If you include your site's address and the platform you use (WordPress, Shopify or something else), we can help you faster.`,
    ),
    legalReviewRequired: false,
    updatedAt: UPDATED,
    seo: { description: 'Contact SUN | WORKS about WordPress, Shopify, AI-assisted development or technical support. Form and email, reply within 24 hours.' },
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

Veri sorumlusu: SUN | WORKS. Kişisel verilerinizle ilgili tüm talepleriniz için [hello@sunworks.studio](mailto:hello@sunworks.studio) adresine yazabilirsiniz.

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
    intro: 'Which personal data this site processes, why, and for how long, under Turkish data protection law (KVKK No. 6698).',
    body: pt(
      'p',
      `## Data controller

The data controller is SUN | WORKS. For any request about your personal data, write to [hello@sunworks.studio](mailto:hello@sunworks.studio).

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

Sitedeki metinler, görseller, tasarım ve logo SUN | WORKS'e aittir; izinsiz kopyalanamaz.

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

The text, images, design and logo on this site belong to SUN | WORKS and may not be copied without permission.

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

  // ---------- Deutsch ----------
  {
    _id: 'page-contact-de',
    _type: 'page',
    language: 'de',
    translationKey: 'page-contact',
    kind: 'contact',
    title: 'Kontakt',
    slug: slug('kontakt'),
    intro: 'Ein neues Projekt, ein Problem mit Ihrer Website oder eine Frage. Schreiben Sie uns, wir antworten innerhalb von 24 Stunden per E-Mail, auf Deutsch, Türkisch oder Englisch.',
    body: pt(
      'c',
      `Wenn Sie die Adresse Ihrer Website und die Plattform nennen, die Sie nutzen (WordPress, Shopify oder etwas anderes), können wir Ihnen schneller helfen.`,
    ),
    legalReviewRequired: false,
    updatedAt: UPDATED,
    seo: { description: 'Kontakt zu SUN | WORKS: WordPress, Shopify, KI-gestützte Entwicklung und technischer Support. Formular und E-Mail, Antwort innerhalb von 24 Stunden.' },
  },
  {
    _id: 'page-privacy-de',
    _type: 'page',
    language: 'de',
    translationKey: 'page-privacy',
    kind: 'legal',
    title: 'Datenschutzerklärung',
    slug: slug('datenschutz'),
    intro: 'Welche personenbezogenen Daten diese Website verarbeitet, warum und wie lange, nach der DSGVO und dem türkischen Datenschutzgesetz (KVKK Nr. 6698).',
    body: pt(
      'p',
      `## Verantwortlicher

Verantwortlich ist SUN | WORKS, die Angaben finden Sie im [Impressum](/de/impressum). Für alle Anliegen zu Ihren Daten schreiben Sie an [hello@sunworks.studio](mailto:hello@sunworks.studio).

## Welche Daten wir verarbeiten und warum

- **Kontaktformular:** Ihr Name, Ihre E-Mail-Adresse, das Thema und Ihre Nachricht, nur um Ihre Anfrage zu beantworten.
- **Newsletter:** Ihre E-Mail-Adresse, nur um neue Beiträge anzukündigen.
- **Sicherheit:** Die Prüfung durch Cloudflare Turnstile und ein nicht umkehrbarer Hash Ihrer IP-Adresse, um Missbrauch der Formulare zu verhindern.
- **Hosting:** Technische Daten wie IP-Adresse, Browserangaben und die aufgerufene Seite, die der Server zur Auslieferung der Website verarbeitet.

Wir nutzen keine Analyse-, Werbe- oder Tracking-Werkzeuge.

## Rechtsgrundlagen

Formulardaten verarbeiten wir mit Ihrer Einwilligung und zur Beantwortung Ihrer Anfrage (Art. 6 Abs. 1 lit. a und b DSGVO). Sicherheits- und Hostingdaten verarbeiten wir aufgrund unseres berechtigten Interesses an einem sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).

## Übermittlung

Die Website und die Formulardaten liegen auf der Infrastruktur unseres Hosters Cloudflare. Ihre Daten können daher auch auf Servern außerhalb der EU und der Türkei verarbeitet werden. Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert. Wir geben Ihre Daten an niemanden sonst weiter und verkaufen sie nie.

## Speicherdauer

- Kontaktnachrichten löschen wir spätestens 12 Monate nach Abschluss Ihrer Anfrage.
- Ihre Newsletter-Anmeldung bleibt bestehen, bis Sie sich abmelden.
- IP-Hashes für die Sicherheit löschen wir innerhalb von 24 Stunden.

## Ihre Rechte

Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO). Eine Einwilligung können Sie jederzeit widerrufen. Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren. Schreiben Sie an [hello@sunworks.studio](mailto:hello@sunworks.studio), wir antworten innerhalb von 30 Tagen.

Zu Cookies und Browserspeicher lesen Sie die [Cookie-Richtlinie](/de/cookie-richtlinie).`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'Datenschutzerklärung von SUN | WORKS: welche personenbezogenen Daten wir verarbeiten, warum und wie lange.' },
  },
  {
    _id: 'page-terms-de',
    _type: 'page',
    language: 'de',
    translationKey: 'page-terms',
    kind: 'legal',
    title: 'Nutzungsbedingungen',
    slug: slug('nutzungsbedingungen'),
    intro: 'Die Bedingungen, die gelten, wenn Sie diese Website nutzen.',
    body: pt(
      't',
      `## Nur zur Information

Die Angaben auf dieser Website stellen die Leistungen von SUN | WORKS vor und sind kein Angebot. Umfang, Zeitplan und Preis jedes Projekts werden gesondert schriftlich vereinbart.

## Urheberrecht

Texte, Bilder, Gestaltung und Logo dieser Website gehören SUN | WORKS und dürfen nicht ohne Erlaubnis kopiert werden.

## Blogbeiträge

Die Hinweise in den Blogbeiträgen sind allgemeiner Natur. Wir empfehlen, vor der Umsetzung auf Ihrer eigenen Website ein Backup zu erstellen.

## Formulare

Bitte nutzen Sie die Formulare nur für echte Anfragen. Automatisierte oder missbräuchliche Einsendungen werden blockiert.

## Änderungen

Wir können diese Bedingungen bei Bedarf anpassen. Die aktuelle Fassung steht immer auf dieser Seite.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'Nutzungsbedingungen der Website von SUN | WORKS.' },
  },
  {
    _id: 'page-cookies-de',
    _type: 'page',
    language: 'de',
    translationKey: 'page-cookies',
    kind: 'legal',
    title: 'Cookie-Richtlinie',
    slug: slug('cookie-richtlinie'),
    intro: 'Wir nutzen keine Werbe- oder Tracking-Cookies. Hier steht alles, was in Ihrem Browser gespeichert werden kann.',
    body: pt(
      'k',
      `## Notwendig

Erforderlich, damit die Website funktioniert und sich Ihre Auswahl merkt. Diese lassen sich nicht abschalten.

- **sw-consent** (diese Website, Browserspeicher): Speichert Ihre Cookie-Auswahl. Dauer: 12 Monate.
- **sw-prefs** (diese Website, Browserspeicher): Speichert Ihre Einstellungen zu Farbschema und Barrierefreiheit. Entsteht nur, wenn Sie eine Einstellung ändern, und bleibt, bis Sie sie löschen.
- **sw-intro** (diese Website, Sitzungsspeicher): Verhindert, dass die Eingangsanimation in derselben Sitzung erneut abläuft. Wird gelöscht, wenn Sie den Tab schließen.
- **Cloudflare und Turnstile** (Drittanbieter): Können Sicherheits-Cookies setzen, um die Website vor Angriffen zu schützen und zu prüfen, ob Formulare von einem Menschen gesendet werden.

## Funktional

Nur aktiv, wenn Sie zustimmen.

- **OpenStreetMap** (Drittanbieter): Zeigt die Karte auf der Kontaktseite. Beim Laden der Karte wird Ihre IP-Adresse an OpenStreetMap übermittelt.

## Analyse und Marketing

Nutzen wir nicht.

## Auswahl ändern

Sie können Ihre Auswahl jederzeit über den Link **Cookie-Einstellungen** unten auf jeder Seite ändern. Einzelheiten finden Sie in der [Datenschutzerklärung](/de/datenschutz).`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'Cookie-Richtlinie von SUN | WORKS: welche Cookies wir nutzen, wozu und wie lange.' },
  },

  // ---------- Imprint ----------
  {
    _id: 'page-imprint-tr',
    _type: 'page',
    language: 'tr',
    translationKey: 'page-imprint',
    kind: 'legal',
    title: 'Künye',
    slug: slug('kunye'),
    intro: 'SUN | WORKS markasının arkasındaki şirket ve iletişim bilgileri.',
    body: pt(
      'i',
      `## Şirket

SUN | WORKS, [Şirket unvanı] markasıdır.

- **Unvan:** [Şirket unvanı]
- **Adres:** [Açık adres], Bursa, Türkiye
- **Ticaret sicil:** [Ticaret sicil müdürlüğü], sicil no [numara]
- **MERSİS no:** [numara]
- **Vergi dairesi ve no:** [Vergi dairesi], [vergi numarası]
- **Yetkili:** [Ad Soyad]

## İletişim

- **E-posta:** [hello@sunworks.studio](mailto:hello@sunworks.studio)
- **Telefon:** [telefon numarası]

## İçerikten sorumlu

[Ad Soyad], adres yukarıdaki gibidir.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS künye: şirket unvanı, adres, sicil ve iletişim bilgileri.' },
  },
  {
    _id: 'page-imprint-en',
    _type: 'page',
    language: 'en',
    translationKey: 'page-imprint',
    kind: 'legal',
    title: 'Imprint',
    slug: slug('imprint'),
    intro: 'The company behind the SUN | WORKS brand, and how to reach it.',
    body: pt(
      'i',
      `## Company

SUN | WORKS is a brand of [Company name].

- **Company:** [Company name]
- **Address:** [Street address], Bursa, Türkiye
- **Trade register:** [Trade registry office], no. [number]
- **MERSIS no.:** [number]
- **Tax office and number:** [Tax office], [tax number]
- **Represented by:** [Full name]

## Contact

- **Email:** [hello@sunworks.studio](mailto:hello@sunworks.studio)
- **Phone:** [phone number]

## Responsible for content

[Full name], address as above.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'SUN | WORKS imprint: company name, address, registration and contact details.' },
  },
  {
    _id: 'page-imprint-de',
    _type: 'page',
    language: 'de',
    translationKey: 'page-imprint',
    kind: 'legal',
    title: 'Impressum',
    slug: slug('impressum'),
    intro: 'Angaben gemäß § 5 DDG zum Unternehmen hinter der Marke SUN | WORKS.',
    body: pt(
      'i',
      `## Anbieter

SUN | WORKS ist eine Marke der [Firmenname].

- **Firma:** [Firmenname]
- **Anschrift:** [Straße und Hausnummer], [PLZ] Bursa, Türkei
- **Handelsregister:** [Handelsregisteramt], Nr. [Nummer]
- **MERSIS-Nr.:** [Nummer]
- **Steueramt und Steuernummer:** [Steueramt], [Steuernummer]
- **Vertreten durch:** [Vor- und Nachname]

## Kontakt

- **E-Mail:** [hello@sunworks.studio](mailto:hello@sunworks.studio)
- **Telefon:** [Telefonnummer]

## Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV

[Vor- und Nachname], Anschrift wie oben.

## Verbraucherstreitbeilegung

Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
    ),
    legalReviewRequired: true,
    updatedAt: UPDATED,
    seo: { description: 'Impressum von SUN | WORKS: Firma, Anschrift, Registerangaben und Kontakt.' },
  },
];
