import type { Service } from '../schema';
import { pt } from '../pt';
import { img, slug } from './helpers';

const faq = (prefix: string, items: [string, string][]) =>
  items.map(([question, answer], i) => ({ _key: `${prefix}${i + 1}`, question, answer }));

export const services: Service[] = [
  // ---------- WordPress ----------
  {
    _id: 'service-wordpress-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-wordpress',
    title: 'WordPress',
    headline: 'WordPress ile kurumsal web sitesi',
    slug: slug('wordpress-kurumsal-site'),
    order: 1,
    icon: 'wordpress',
    excerpt: 'Şirketinizi sade ve şık bir şekilde anlatan, yazı ve fotoğraflarınızı kimseye ihtiyaç duymadan ekleyebileceğiniz kurumsal web siteleri.',
    image: img('laptop-code-plant', 'Kod editörü açık bir dizüstü bilgisayarda WordPress tema dosyaları'),
    deliverables: [
      'Sayfa yapısı ve içerik planı',
      'Tema kurulumu ve markaya göre özelleştirme',
      'Gerekli eklentilerin seçimi ve ayarları',
      'Form, yedekleme, önbellek ve güvenlik ayarları',
      'Temel SEO kurulumu: başlıklar, açıklamalar, site haritası',
      'Yayın sonrası güncelleme ve bakım',
    ],
    body: pt(
      'wp',
      `## Kimler için?

Kendini net anlatan bir siteye ihtiyacı olan işletmeler, serbest çalışanlar, dernekler ve kurumlar için. Dağınık hale gelmiş mevcut bir WordPress sitesini toparlamak da bu hizmetin parçası.

## Neye göre kuruyoruz?

Tema seçmeden önce içeriğe bakarız. Hangi sayfalar gerekli, ziyaretçi ne arıyor, sitede içeriği kim güncelleyecek? Yapıyı bu sorulara göre kurar, temayı ona göre seçeriz. Tersini yapmayız.

Her eklenti bakım yükü demektir. Bu yüzden yalnızca gerçekten işe yarayanları kurarız. İşi temanın kendisi görüyorsa ek eklenti eklemeyiz.

## Nasıl ilerliyoruz?

1. **Keşif:** Hedefi, sayfaları ve içeriği konuşuruz. Kapsamı yazılı bir teklifte toplarız.
2. **Kurulum:** Siteyi bir test ortamında kurar, ilerlemeyi bir önizleme bağlantısından paylaşırız.
3. **Kontrol:** Hız, mobil görünüm, formlar ve temel SEO ayarlarını birlikte kontrol ederiz.
4. **Yayın:** Yedek alıp yayına alır, ilk günlerde siteyi yakından izleriz.

## Yayından sonra

WordPress çekirdeğini, temayı ve eklentileri güncel tutarız. Her güncellemeden önce yedek alırız. Bir şey bozulursa [teknik destek](/hizmetler/teknik-destek) tarafında aynı ekip devreye girer. Siteyi kendiniz yönetmek isterseniz kısa bir [eğitim](/hizmetler/egitim-ve-teslim) veririz.

Yayına hazırlanıyorsanız [WordPress yayın öncesi kontrol listemiz](/blog/wordpress-yayin-oncesi-kontrol-listesi) iyi bir başlangıç noktası.`,
    ),
    faq: faq('wpq', [
      ['WordPress sitesi ne kadar sürede hazır olur?', 'Kapsama göre değişir. Tanıtım amaçlı birkaç sayfalık bir site genellikle iki ila dört hafta sürer. Takvimi teklifle birlikte yazılı olarak paylaşırız.'],
      ['Hazır tema mı kullanıyorsunuz, özel tasarım mı?', 'İhtiyaca göre. Çoğu kurumsal site için iyi bir tema, markaya göre özelleştirildiğinde yeterlidir. Tema ihtiyacı karşılamıyorsa özel bileşenler ekleriz.'],
      ['Hosting ve alan adı kimin adına açılır?', 'Sizin adınıza. Hesaplar size ait kalır. Kurulumu isterseniz biz yaparız.'],
      ['Siteyi sonradan kendim güncelleyebilir miyim?', 'Evet. Teslimde yönetim panelini birlikte kullanır, adım adım notlar bırakırız.'],
    ]),
    seo: {
      title: 'WordPress kurumsal site kurulumu ve bakımı',
      description: 'İçeriğe göre planlanan, hızlı ve bakımı kolay WordPress kurumsal siteler. Kurulum, tema özelleştirme, eklenti ayarları, SEO temeli ve bakım.',
    },
  },
  {
    _id: 'service-wordpress-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-wordpress',
    title: 'WordPress',
    headline: 'WordPress websites for businesses',
    slug: slug('wordpress-business-website'),
    order: 1,
    icon: 'wordpress',
    excerpt: 'Company websites that present your business simply and elegantly, where you can add your own text and photos without needing anyone.',
    image: img('laptop-code-plant', 'WordPress theme files open in a code editor on a laptop'),
    deliverables: [
      'Page structure and content plan',
      'Theme setup and brand customization',
      'Plugin selection and configuration',
      'Forms, backups, caching and security settings',
      'SEO basics: titles, descriptions, sitemap',
      'Updates and maintenance after launch',
    ],
    body: pt(
      'wp',
      `## Who it is for

Businesses, freelancers, associations and organizations that need a site that explains what they do. Tidying up an existing WordPress site that has grown messy is part of this service too.

## What we build around

We look at the content before we pick a theme. Which pages are needed, what visitors are looking for, and who will update the site? The structure follows those answers, and the theme follows the structure. Not the other way round.

Every plugin adds maintenance. We only install the ones that earn their place. If the theme already does the job, we don't add another plugin.

## How we work

1. **Discovery:** We talk through goals, pages and content, then put the scope in a written proposal.
2. **Build:** We build on a staging site and share progress through a preview link.
3. **Review:** We check speed, mobile layout, forms and SEO settings together.
4. **Launch:** We take a backup, go live and watch the site closely in the first days.

## After launch

We keep WordPress core, the theme and plugins up to date, with a backup before every update. If something breaks, the same team handles [technical support](/en/services/technical-support). If you want to run the site yourself, we offer short [training](/en/services/training-and-onboarding).

Getting ready to launch? Our [WordPress pre-launch checklist](/en/blog/wordpress-pre-launch-checklist) is a good place to start.`,
    ),
    faq: faq('wpq', [
      ['How long does a WordPress site take?', 'It depends on scope. A small company site usually takes two to four weeks. We share the timeline in writing with the proposal.'],
      ['Do you use a ready-made theme or a custom design?', 'Whatever the project needs. For most business sites, a good theme customized to the brand is enough. When it is not, we add custom components.'],
      ['Whose name are hosting and the domain registered in?', 'Yours. The accounts stay yours. We can set them up for you if you like.'],
      ['Can I update the site myself later?', 'Yes. At handover we go through the admin panel together and leave step-by-step notes.'],
    ]),
    seo: {
      title: 'WordPress business website setup and care',
      description: 'WordPress business sites planned around your content: setup, theme customization, plugin configuration, SEO basics and ongoing maintenance.',
    },
  },

  // ---------- Shopify ----------
  {
    _id: 'service-shopify-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-shopify',
    title: 'Shopify',
    headline: 'Shopify mağaza kurulumu ve geliştirme',
    slug: slug('shopify-magaza-kurulumu'),
    order: 2,
    icon: 'cart',
    excerpt: 'Ürünlerinizi kolayca sergileyip satabileceğiniz, siparişlerinizi telefonunuzdan bile takip edebileceğiniz online mağazalar.',
    image: img('clothing-store', 'Raflarda katlanmış giysiler ve askıda ürünler bulunan küçük bir mağaza'),
    deliverables: [
      'Mağaza kurulumu ve tema özelleştirme',
      'Ürün, varyant ve koleksiyon yapısı',
      'Uygulama seçimi ve entegrasyonları',
      'Print-on-demand ürün yapılandırıcıları',
      'Ödeme, kargo, vergi ve yasal sayfa ayarları',
      'Yayın öncesi sipariş testi',
    ],
    body: pt(
      'sh',
      `## Kimler için?

Çevrim içi satışa başlayan küçük markalar ve mevcut Shopify mağazasını düzene sokmak isteyenler için.

## Mağazayı nasıl kuruyoruz?

Temadan önce ürünlere bakarız. Müşteri ürünü nasıl buluyor, neyi karşılaştırıyor, satın almadan önce neyi merak ediyor? Koleksiyonları, filtreleri ve ürün sayfalarını bu sorulara göre düzenleriz.

Uygulama eklemek kolay, sonradan temizlemek zor. Her uygulama sayfayı biraz daha yavaşlatır ve aylık bir maliyet getirir. Bu yüzden önce temanın ve Shopify'ın kendi özelliklerinin yetip yetmediğine bakarız.

## Kişiselleştirilebilir ürünler

Print-on-demand ürünler için müşterinin rengi, bedeni ya da baskıyı seçtiği ürün yapılandırıcıları kuruyoruz. Seçimleri fiyat mantığına bağlıyor, siparişin üretime doğru bilgiyle gitmesini sağlıyoruz.

## Nasıl ilerliyoruz?

1. **Keşif:** Ürün yapısını, satış kanallarını ve teslimat ihtiyacını konuşuruz.
2. **Kurulum:** Temayı kurar ve özelleştirir, ürünleri ve koleksiyonları düzenleriz.
3. **Entegrasyon:** Gerekli uygulamaları bağlar, ödeme ve kargo ayarlarını tamamlarız.
4. **Test ve yayın:** Gerçek bir sipariş akışını baştan sona dener, sonra mağazayı açarız.

Açılıştan önce [Shopify mağaza açmadan önce yapılacak 5 ayar](/blog/shopify-magaza-acmadan-once) yazımıza da göz atabilirsiniz.`,
    ),
    faq: faq('shq', [
      ['Shopify mı, WooCommerce mu?', 'Ürün sayısına, ekibinize ve bütçenize bağlı. Sunucu ve güncelleme işiyle uğraşmak istemiyorsanız Shopify genellikle daha az bakım ister. Kararı birlikte veririz.'],
      ['Mevcut mağazamı devralabilir misiniz?', 'Evet. Önce mağazayı inceler, gereksiz uygulamaları ve yavaşlığa yol açan noktaları raporlarız.'],
      ['Ürünleri siz mi yüklüyorsunuz?', 'İsterseniz evet. Toplu yükleme için ürün listesini birlikte hazırlarız ya da sizin yüklemeniz için şablon veririz.'],
    ]),
    seo: {
      title: 'Shopify mağaza kurulumu ve tema özelleştirme',
      description: 'Ürünlerinize göre kurulan Shopify mağazaları: tema özelleştirme, uygulama entegrasyonları, katalog yapısı ve print-on-demand ürün yapılandırıcıları.',
    },
  },
  {
    _id: 'service-shopify-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-shopify',
    title: 'Shopify',
    headline: 'Shopify store setup and development',
    slug: slug('shopify-store-setup'),
    order: 2,
    icon: 'cart',
    excerpt: 'Online stores where you can show and sell your products with ease, and follow orders even from your phone.',
    image: img('clothing-store', 'A small shop with folded clothes on shelves and garments on hanging rails'),
    deliverables: [
      'Store setup and theme customization',
      'Product, variant and collection structure',
      'App selection and integrations',
      'Print-on-demand product configurators',
      'Payment, shipping, tax and policy settings',
      'Test orders before launch',
    ],
    body: pt(
      'sh',
      `## Who it is for

Small brands starting to sell online, and store owners who want to bring order to an existing Shopify store.

## How we set up a store

We look at the products before the theme. How do customers find a product, what do they compare, and what do they want to know before they buy? Collections, filters and product pages follow those answers.

Apps are easy to add and hard to remove. Each one slows the storefront a little and adds a monthly cost. So we first check whether the theme and Shopify's own features already cover the need.

## Personalized products

For print-on-demand products we build configurators where customers pick the color, size or print. Each choice is tied to the pricing logic, so the order reaches production with the right details.

## How we work

1. **Discovery:** We talk through product structure, sales channels and fulfilment.
2. **Setup:** We install and customize the theme, then organize products and collections.
3. **Integration:** We connect the apps you need and finish payment and shipping settings.
4. **Test and launch:** We run a real order from start to finish, then open the store.

Before launch, see [5 things to set up before opening a Shopify store](/en/blog/before-opening-your-shopify-store).`,
    ),
    faq: faq('shq', [
      ['Shopify or WooCommerce?', 'It depends on your catalog, your budget and who will run the store. If you would rather not deal with servers and updates, Shopify usually needs less maintenance. We make the call together.'],
      ['Can you take over my existing store?', 'Yes. We review the store first and report unused apps and the things slowing it down.'],
      ['Do you upload the products?', 'If you like. For bulk uploads we prepare the product list with you, or give you a template to fill in.'],
    ]),
    seo: {
      title: 'Shopify store setup and theme customization',
      description: 'Shopify stores built around your products: theme customization, app integrations, catalog structure and print-on-demand product configurators.',
    },
  },

  // ---------- Support ----------
  {
    _id: 'service-support-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-support',
    title: 'Teknik destek',
    headline: 'WordPress ve Shopify için teknik destek',
    slug: slug('teknik-destek'),
    order: 3,
    icon: 'wrench',
    excerpt: 'Bozulan sayfa, yavaşlayan site ya da genel teknik aksaklıklarda kafanızı yormamanız için yanınızda duran pratik destek.',
    image: img('pointing-laptop', 'Dizüstü bilgisayar ekranındaki bir hatayı parmağıyla gösteren biri'),
    deliverables: [
      'Sorunun yeniden üretilmesi ve kaynağının bulunması',
      'Tema ve eklenti çakışmalarının çözümü',
      'Önbellek ve hız sorunlarının giderilmesi',
      'Küçük kod ve arayüz düzeltmeleri',
      'Tema, eklenti ve hosting destek ekipleriyle yazışma',
      'Nedeni ve yapılanı anlatan kısa bir rapor',
    ],
    body: pt(
      'su',
      `## Ne tür sorunlar?

- Güncellemeden sonra bozulan sayfalar ya da beyaz ekran
- Birbiriyle çakışan eklentiler veya uygulamalar
- Değişiklikleri göstermeyen önbellek
- Gönderilmeyen formlar, ulaşmayan e-postalar
- Telefonda kayan, taşan ya da hizası bozulan bölümler
- Birden yavaşlayan sayfalar

## Nasıl çalışıyoruz?

Belirtiyi değil nedeni ararız. Önce sorunu yeniden üretir, hangi değişiklikten sonra başladığını buluruz. Düzeltmeyi mümkünse bir test kopyasında deneriz. Değilse önce yedek alırız.

Sorun bir temanın, eklentinin ya da hosting firmasının kendisinden kaynaklanıyorsa destek ekipleriyle yazışmayı biz yürütürüz. Sizin araya girmeniz gerekmez.

## Sonunda ne alırsınız?

Çalışan bir site ve kısa bir rapor: sorun neydi, neden oldu, ne değişti. Benzer bir durum tekrar yaşanırsa nereye bakılacağı bellidir.

Site yavaşlığıyla uğraşıyorsanız [siteniz neden yavaş](/blog/siteniz-neden-yavas) yazımızda en sık karşılaştığımız beş nedeni anlattık.`,
    ),
    faq: faq('suq', [
      ['Acil bir sorunda ne kadar hızlı dönüyorsunuz?', 'İlk yanıtı 24 saat içinde veririz. Site tamamen erişilemez durumdaysa önceliklendiririz.'],
      ['Başkasının kurduğu siteye de bakıyor musunuz?', 'Evet. Çoğu destek talebi başka birinin kurduğu sitelerden gelir. Önce kısa bir inceleme yaparız.'],
      ['Ücretlendirme nasıl?', 'İşin büyüklüğüne göre. Tek seferlik düzeltmeler için sabit fiyat, sürekli destek için aylık paket öneririz.'],
    ]),
    seo: {
      title: 'WordPress ve Shopify teknik destek',
      description: 'Bozulan sayfalar, eklenti çakışmaları, önbellek ve hız sorunları. WordPress ve Shopify siteleri için sorunu kaynağında bulan teknik destek.',
    },
  },
  {
    _id: 'service-support-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-support',
    title: 'Technical support',
    headline: 'Technical support for WordPress and Shopify',
    slug: slug('technical-support'),
    order: 3,
    icon: 'wrench',
    excerpt: 'Practical support for broken pages, a slow site or general technical hiccups, so you don\'t have to worry about them.',
    image: img('pointing-laptop', 'Someone pointing at an error on a laptop screen'),
    deliverables: [
      'Reproducing the issue and finding its source',
      'Resolving theme and plugin conflicts',
      'Fixing cache and speed issues',
      'Small code and layout fixes',
      'Handling theme, plugin and hosting support tickets',
      'A short report on cause and changes',
    ],
    body: pt(
      'su',
      `## What kind of issues?

- Pages that break after an update, or a blank white screen
- Plugins or apps that conflict with each other
- A cache that hides your changes
- Forms that don't send, emails that don't arrive
- Sections that shift, overflow or misalign on phones
- Pages that suddenly load slowly

## How we work

We look for the cause, not the symptom. First we reproduce the issue and find which change started it. Where possible we test the fix on a staging copy. Otherwise we take a backup first.

If the problem sits in a theme, a plugin or the hosting provider, we handle the conversation with their support team. You don't need to be in the middle.

## What you get

A working site and a short report: what the problem was, why it happened and what changed. If something similar comes up again, it is clear where to look.

Dealing with a slow site? We cover the five causes we see most in [why is your site slow](/en/blog/why-is-your-site-slow).`,
    ),
    faq: faq('suq', [
      ['How fast do you respond to urgent issues?', 'We reply within 24 hours. If the site is completely down, it gets priority.'],
      ['Do you work on sites someone else built?', 'Yes. Most support requests come from sites built by someone else. We start with a short review.'],
      ['How is it priced?', 'By the size of the job. A fixed price for one-off fixes, a monthly plan for ongoing support.'],
    ]),
    seo: {
      title: 'WordPress and Shopify technical support',
      description: 'Broken pages, plugin conflicts, cache and speed issues. Technical support for WordPress and Shopify sites that finds and fixes the cause.',
    },
  },

  // ---------- AI-assisted development ----------
  {
    _id: 'service-ai-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-ai',
    title: 'AI destekli geliştirme',
    headline: 'AI destekli web geliştirme',
    slug: slug('ai-destekli-gelistirme'),
    order: 4,
    icon: 'ai',
    excerpt: 'Günlük rutin işlerinizi kolaylaştıran, web sitenizde müşterilerinize yardımcı olan ya da iş süreçlerinizi hızlandıran akıllı küçük çözümler.',
    image: img('code-dark', 'Koyu temalı bir kod editöründe renkli kod satırları'),
    deliverables: [
      'İhtiyaca göre AI kullanım planı',
      'Hızlı prototip ve arayüz denemeleri',
      'Özel eklenti, entegrasyon ve otomasyonlar',
      'Sitenize bağlı AI özellikleri: arama, asistan, içerik akışları',
      'İnsan gözüyle kod incelemesi ve test',
      'Gizlilik ve veri güvenliği kontrolü',
    ],
    body: pt(
      'ai',
      `## Ne demek?

Yapay zekâ araçları bazı işleri çok hızlandırıyor: araştırma, ilk taslak, tekrar eden kod, test senaryoları. Biz bu araçları tam da bu noktalarda kullanıyoruz. Neyin yapılacağına, nasıl yapılacağına ve işin doğru olup olmadığına ise biz karar veriyoruz.

AI, muhakemenin yerine geçmez. Hızlandırdığı kısımdan kazandığımız zamanı tasarıma, teste ve detaylara ayırıyoruz.

## Neler yapıyoruz?

- **Prototip:** Bir fikri günler yerine saatler içinde tıklanabilir bir örneğe dönüştürürüz. Böylece karar vermeden önce görürsünüz.
- **Özel geliştirme:** WordPress eklentileri, Shopify uygulama entegrasyonları, küçük otomasyonlar ve API bağlantıları.
- **AI özellikleri:** Sitenize akıllı arama, soru yanıtlayan bir asistan ya da içerik düzenleme akışları eklemek.
- **Mevcut kodu anlamak:** Belgesi olmayan eski bir temayı ya da eklentiyi hızla çözümler, güvenle değiştiririz.

## Nasıl kontrol ediyoruz?

AI'ın ürettiği her satır kod bir geliştiricinin incelemesinden geçer. Testleri çalıştırır, hız ve erişilebilirliği ölçeriz. Müşteri verisini ve gizli bilgileri AI araçlarıyla paylaşmayız.

## Kimler için?

Hazır bir tema ya da eklentinin yetmediği, ama sıfırdan büyük bir yazılım projesine de gerek olmayan işler için. Çoğu zaman bir [WordPress](/hizmetler/wordpress-kurumsal-site) ya da [Shopify](/hizmetler/shopify-magaza-kurulumu) projesinin içinde yer alır.`,
    ),
    faq: faq('aiq', [
      ['Kodu tamamen AI mı yazıyor?', 'Hayır. AI taslak ve tekrar eden kısımlarda yardım eder. Mimariyi, kararları ve son kontrolü biz yaparız. Her değişiklik incelenir ve test edilir.'],
      ['Verilerim AI araçlarıyla paylaşılıyor mu?', 'Hayır. Müşteri verisini, şifreleri ve gizli bilgileri AI araçlarına vermeyiz. Gerekirse anonim örnek veriyle çalışırız.'],
      ['Siteme bir AI asistanı ekleyebilir misiniz?', 'Evet. Sitenizin içeriğine dayanan ve sınırları belli bir asistan kurabiliriz. Önce gerçekten işe yarayıp yaramayacağını birlikte değerlendiririz.'],
    ]),
    seo: {
      title: 'AI destekli web geliştirme',
      description: 'Yapay zekâyı prototip, özel geliştirme ve otomasyon için kullanan, her satırı insan gözüyle kontrol eden web geliştirme hizmeti.',
    },
  },
  {
    _id: 'service-ai-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-ai',
    title: 'AI-assisted development',
    headline: 'AI-assisted web development',
    slug: slug('ai-assisted-development'),
    order: 4,
    icon: 'ai',
    excerpt: 'Smart small solutions that ease your daily routine, help customers on your website or speed up the way you work.',
    image: img('code-dark', 'Colorful lines of code in a dark-themed code editor'),
    deliverables: [
      'A plan for where AI actually helps',
      'Fast prototypes and interface experiments',
      'Custom plugins, integrations and automations',
      'AI features on your site: search, assistants, content flows',
      'Human code review and testing',
      'Privacy and data handling checks',
    ],
    body: pt(
      'ai',
      `## What it means

AI tools make some work much faster: research, first drafts, repetitive code, test cases. That is exactly where we use them. What gets built, how it is built and whether it is right is still our call.

AI is not a substitute for judgement. The time it saves goes into design, testing and the details.

## What we do

- **Prototypes:** We turn an idea into a clickable example in hours rather than days, so you see it before you decide.
- **Custom development:** WordPress plugins, Shopify app integrations, small automations and API connections.
- **AI features:** Adding smart search, a question-answering assistant or content editing flows to your site.
- **Understanding existing code:** We quickly map an undocumented theme or plugin, then change it safely.

## How we keep it in check

Every line of AI-generated code is reviewed by a developer. We run the tests and measure speed and accessibility. We don't share customer data or secrets with AI tools.

## Who it is for

Work where an off-the-shelf theme or plugin is not enough, but a large software project would be overkill. It usually sits inside a [WordPress](/en/services/wordpress-business-website) or [Shopify](/en/services/shopify-store-setup) project.`,
    ),
    faq: faq('aiq', [
      ['Does AI write all the code?', 'No. AI helps with drafts and repetitive parts. Architecture, decisions and final review are ours. Every change is reviewed and tested.'],
      ['Is my data shared with AI tools?', 'No. We don\'t give customer data, passwords or secrets to AI tools. When needed, we work with anonymized sample data.'],
      ['Can you add an AI assistant to my site?', 'Yes. We can build an assistant grounded in your site\'s content, with clear limits. First we check together whether it would actually help.'],
    ]),
    seo: {
      title: 'AI-assisted web development',
      description: 'Web development that uses AI for prototypes, custom builds and automation, with every line reviewed by a developer before it ships.',
    },
  },

  // ---------- Hosting ----------
  {
    _id: 'service-hosting-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-hosting',
    title: 'Alan adı ve hosting',
    headline: 'Alan adı, hosting ve e-posta kurulumu',
    slug: slug('alan-adi-ve-hosting'),
    order: 5,
    icon: 'server',
    excerpt: 'Alan adı, DNS, SSL ve kurumsal e-posta ayarları. Sitenizi yeni sunucuya kesintisiz taşırız. Hesaplar sizin adınıza açılır.',
    image: img('dashboard-laptop', 'Ekranında sunucu kontrol paneli açık bir dizüstü bilgisayar'),
    deliverables: [
      'İhtiyaca uygun hosting paketi önerisi',
      'Alan adı ve DNS yönlendirmeleri',
      'cPanel veya Plesk üzerinde site kurulumu',
      'SSL sertifikası ve HTTPS yönlendirmesi',
      'Kurumsal e-posta hesapları ve SPF, DKIM, DMARC kayıtları',
      'Sitenin yeni sunucuya taşınması',
    ],
    body: pt(
      'ho',
      `## Ne yapıyoruz?

Alan adınızı doğru sunucuya yönlendirir, cPanel ya da Plesk üzerinde sitenizi kurar, SSL sertifikasını etkinleştiririz. Alan adınıza bağlı e-posta hesaplarını açar, e-postaların spam klasörüne düşmemesi için gerekli DNS kayıtlarını ekleriz.

## Taşıma

Mevcut sitenizi yeni bir sunucuya taşırken önce tam yedek alırız. Siteyi yeni sunucuda kurup kontrol ettikten sonra DNS'i yönlendiririz. Böylece ziyaretçileriniz kesinti yaşamaz, e-postalarınız kaybolmaz.

## Hesaplar kimin?

Sizin. Hosting ve alan adı hesapları sizin adınıza açılır. Şifreler sizde kalır. Paket seçerken ihtiyacınıza göre birkaç seçeneği karşılaştırır, gereğinden büyük bir paket önermeyiz.

Yeni bir site kuruyorsanız bu adım genellikle bir [WordPress](/hizmetler/wordpress-kurumsal-site) projesinin parçası olarak yapılır.`,
    ),
    faq: faq('hoq', [
      ['Hangi hosting firmasını öneriyorsunuz?', 'Tek bir firmaya bağlı değiliz. Site türüne, trafiğe ve bütçeye göre birkaç seçenek sunarız.'],
      ['Taşıma sırasında site kapanır mı?', 'Hayır. Siteyi yeni sunucuda hazırlayıp kontrol ettikten sonra yönlendirme yaparız.'],
      ['E-postalarım neden spam klasörüne düşüyor?', 'Çoğu zaman SPF, DKIM ve DMARC kayıtları eksik ya da hatalıdır. Kurulumda bunları doğru şekilde ekleriz.'],
    ]),
    seo: {
      title: 'Alan adı, hosting, SSL ve e-posta kurulumu',
      description: 'Alan adı ve DNS ayarları, cPanel ve Plesk kurulumu, SSL, kurumsal e-posta ve kesintisiz site taşıma. Hesaplar sizin adınıza açılır.',
    },
  },
  {
    _id: 'service-hosting-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-hosting',
    title: 'Domain and hosting',
    headline: 'Domain, hosting and email setup',
    slug: slug('domain-and-hosting'),
    order: 5,
    icon: 'server',
    excerpt: 'Domain, DNS, SSL and business email settings. We move your site to a new server without downtime. Accounts are opened in your name.',
    image: img('dashboard-laptop', 'A server control panel open on a laptop screen'),
    deliverables: [
      'A hosting plan that fits the site',
      'Domain and DNS configuration',
      'Site setup on cPanel or Plesk',
      'SSL certificate and HTTPS redirect',
      'Business email with SPF, DKIM and DMARC records',
      'Moving your site to a new server',
    ],
    body: pt(
      'ho',
      `## What we do

We point your domain to the right server, set up your site on cPanel or Plesk and enable SSL. We create email accounts on your domain and add the DNS records that keep your emails out of spam folders.

## Migration

When moving an existing site to a new server, we take a full backup first. We set up and check the site on the new server, then switch DNS. Visitors see no downtime and no email gets lost.

## Whose accounts?

Yours. Hosting and domain accounts are opened in your name and the passwords stay with you. When choosing a plan, we compare a few options and don't suggest more than the site needs.

For a new site, this step usually happens as part of a [WordPress](/en/services/wordpress-business-website) project.`,
    ),
    faq: faq('hoq', [
      ['Which hosting provider do you recommend?', 'We are not tied to one. We suggest a few options based on the type of site, traffic and budget.'],
      ['Will the site go down during migration?', 'No. We prepare and check the site on the new server before switching over.'],
      ['Why do my emails land in spam?', 'Usually because SPF, DKIM and DMARC records are missing or wrong. We set them up correctly.'],
    ]),
    seo: {
      title: 'Domain, hosting, SSL and email setup',
      description: 'Domain and DNS settings, cPanel and Plesk setup, SSL, business email and zero-downtime site migration. Accounts stay in your name.',
    },
  },

  // ---------- Training ----------
  {
    _id: 'service-training-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-training',
    title: 'Eğitim',
    headline: 'WordPress ve Shopify yönetim eğitimi',
    slug: slug('egitim-ve-teslim'),
    order: 6,
    icon: 'book',
    excerpt: 'Sitenizi ya da mağazanızı kendiniz yönetebilmeniz için birebir eğitim ve sitenize özel yazılı notlar.',
    image: img('writing-notes', 'Masada kahve fincanının yanında kâğıda not alan bir el'),
    deliverables: [
      'Birebir eğitim, yüz yüze ya da çevrim içi',
      'Sayfa, yazı, görsel ve ürün güncelleme adımları',
      'Sitenize özel, ekran görüntülü kullanım notları',
      'Eğitim kaydı (isterseniz)',
      'Eğitimden sonra kısa bir soru-cevap süresi',
    ],
    body: pt(
      'tr',
      `## Neden önemli?

Bir site ancak güncel tutulabildiğinde işe yarar. Yeni bir ürün eklemek ya da bir metni düzeltmek için her seferinde birine yazmanız gerekmemeli.

## Neyi öğretiyoruz?

Genel bir WordPress ya da Shopify kursu değil. Sizin sitenizin panelinde, sizin en sık yapacağınız işler üzerinden ilerleriz: sayfa ve yazı düzenlemek, görsel eklemek, ürün ve stok güncellemek, form mesajlarını görmek.

Neye dokunmamanız gerektiğini de gösteririz. Bir ayarı yanlışlıkla değiştirmek, çoğu zaman bir sorunun başlangıcıdır.

## Nasıl ilerliyoruz?

Eğitimi yüz yüze ya da çevrim içi yaparız. Ardından her adımı ekran görüntüsüyle anlatan kısa notlar hazırlarız. Eğitimden sonraki ilk haftalarda aklınıza takılan soruları yanıtlarız.

Eğitim genellikle bir [WordPress](/hizmetler/wordpress-kurumsal-site) ya da [Shopify](/hizmetler/shopify-magaza-kurulumu) projesinin teslim aşamasında verilir. Mevcut siteniz için ayrıca da alabilirsiniz.`,
    ),
    faq: faq('trq', [
      ['Eğitim ne kadar sürer?', 'Genellikle bir ila iki saat. Konu sayısına göre iki oturuma bölebiliriz.'],
      ['Başkasının kurduğu site için de eğitim veriyor musunuz?', 'Evet. Önce siteyi kısaca inceleriz, sonra eğitimi o siteye göre hazırlarız.'],
      ['Ekibimden birden fazla kişi katılabilir mi?', 'Evet. Farklı rollerdeki kişiler için konuları ayırabiliriz.'],
    ]),
    seo: {
      title: 'WordPress ve Shopify yönetim eğitimi',
      description: 'Sitenizi kendiniz yönetebilmeniz için birebir WordPress ve Shopify eğitimi. Sitenize özel, ekran görüntülü yazılı kullanım notları.',
    },
  },
  {
    _id: 'service-training-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-training',
    title: 'Training',
    headline: 'WordPress and Shopify admin training',
    slug: slug('training-and-onboarding'),
    order: 6,
    icon: 'book',
    excerpt: 'One-to-one training and written notes for your own site, so you can run it yourself.',
    image: img('writing-notes', 'A hand taking notes on paper next to a coffee cup'),
    deliverables: [
      'One-to-one training, in person or online',
      'Steps for updating pages, posts, images and products',
      'Usage notes with screenshots, written for your site',
      'A recording of the session (optional)',
      'A short Q&A window after training',
    ],
    body: pt(
      'tr',
      `## Why it matters

A website only helps you if it can be kept up to date. Adding a product or fixing a sentence should not mean writing to someone every time.

## What we teach

Not a general WordPress or Shopify course. We work in your site's admin panel, on the tasks you will do most: editing pages and posts, adding images, updating products and stock, reading form messages.

We also show you what not to touch. Changing a setting by accident is often where problems start.

## How we work

Training happens in person or online. Afterwards we write short notes with a screenshot for each step. In the first weeks after training, we answer the questions that come up.

Training is usually part of handover on a [WordPress](/en/services/wordpress-business-website) or [Shopify](/en/services/shopify-store-setup) project. You can also book it for an existing site.`,
    ),
    faq: faq('trq', [
      ['How long is a session?', 'Usually one to two hours. We can split it into two sessions depending on the topics.'],
      ['Do you train on sites someone else built?', 'Yes. We review the site briefly first, then prepare the training for it.'],
      ['Can several people from my team join?', 'Yes. We can split topics for people in different roles.'],
    ]),
    seo: {
      title: 'WordPress and Shopify admin training',
      description: 'One-to-one WordPress and Shopify training so you can run your site yourself, with written usage notes and screenshots made for your site.',
    },
  },
];
