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
    image: img('service-wordpress', 'Ekranında sade bir web sitesi düzeni açık dizüstü bilgisayar, yanında bitkiler ve defter'),
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

## Siteyi neye göre kuralım?

Tema seçmeden önce içeriğe bakalım. Hangi sayfalar gerekli, ziyaretçi ne arıyor, sitede içeriği kim güncelleyecek? Yapıyı bu sorulara göre kuralım, temayı da ona göre seçelim. Tersini yapmayız.

Her eklenti bakım yükü demektir. Bu yüzden yalnızca gerçekten işe yarayanları kuralım. İşi temanın kendisi görüyorsa ek eklenti eklemeyelim.

## Nasıl ilerleyelim?

1. **Keşif:** Hedefi, sayfaları ve içeriği konuşalım. Kapsamı yazılı bir teklifte toplayalım.
2. **Kurulum:** Siteyi bir test ortamında kuralım, ilerlemeyi bir önizleme bağlantısından paylaşalım.
3. **Kontrol:** Hız, mobil görünüm, formlar ve temel SEO ayarlarını birlikte kontrol edelim.
4. **Yayın:** Yedek alıp yayına alalım, ilk günlerde siteyi yakından izleyelim.

## Yayından sonra

WordPress çekirdeğini, temayı ve eklentileri güncel tutalım. Her güncellemeden önce yedek alırız. Bir şey bozulursa [teknik destek](/hizmetler/teknik-destek) tarafında aynı ekip devreye girer. Sitenin hızlı açılması ve aramalarda doğru görünmesi için [hız ve SEO](/hizmetler/hiz-ve-seo) tarafında da birlikte çalışabiliriz.

Yayına hazırlanıyorsanız [WordPress yayın öncesi kontrol listemiz](/blog/wordpress-yayin-oncesi-kontrol-listesi) iyi bir başlangıç noktası.`,
    ),
    faq: faq('wpq', [
      ['WordPress sitesi ne kadar sürede hazır olur?', 'Kapsama göre değişir. Tanıtım amaçlı birkaç sayfalık bir site genellikle iki ila dört hafta sürer. Takvimi teklifle birlikte yazılı olarak paylaşırız.'],
      ['Hazır tema mı kullanıyorsunuz, özel tasarım mı?', 'İhtiyaca göre. Çoğu kurumsal site için iyi bir tema, markaya göre özelleştirildiğinde yeterlidir. Tema ihtiyacı karşılamıyorsa özel bileşenler ekleyelim.'],
      ['Hosting ve alan adı kimin adına açılır?', 'Sizin adınıza. Hesaplar size ait kalır. İsterseniz kurulumu biz yapalım.'],
      ['Siteyi sonradan kendim güncelleyebilir miyim?', 'Evet. Teslimde yönetim panelini birlikte kullanalım, bilmeniz gerekenleri gösterelim.'],
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
    image: img('service-wordpress', 'A laptop showing a simple website layout, with plants and a notebook nearby'),
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

We keep WordPress core, the theme and plugins up to date, with a backup before every update. If something breaks, the same team handles [technical support](/en/services/technical-support). For a fast site that shows up properly in search, we can also work on [speed and SEO](/en/services/speed-and-seo).

Getting ready to launch? Our [WordPress pre-launch checklist](/en/blog/wordpress-pre-launch-checklist) is a good place to start.`,
    ),
    faq: faq('wpq', [
      ['How long does a WordPress site take?', 'It depends on scope. A small company site usually takes two to four weeks. We share the timeline in writing with the proposal.'],
      ['Do you use a ready-made theme or a custom design?', 'Whatever the project needs. For most business sites, a good theme customized to the brand is enough. When it is not, we add custom components.'],
      ['Whose name are hosting and the domain registered in?', 'Yours. The accounts stay yours. We can set them up for you if you like.'],
      ['Can I update the site myself later?', 'Yes. At handover we go through the admin panel together and show you what you need to know.'],
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
    image: img('service-shopify', 'Katlanmış giysiler ve ürün görselleri açık bir tabletle butik mağaza tezgâhı'),
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

## Mağazayı nasıl kuralım?

Temadan önce ürünlere bakalım. Müşteri ürünü nasıl buluyor, neyi karşılaştırıyor, satın almadan önce neyi merak ediyor? Koleksiyonları, filtreleri ve ürün sayfalarını bu sorulara göre düzenleyelim.

Uygulama eklemek kolay, sonradan temizlemek zor. Her uygulama sayfayı biraz daha yavaşlatır ve aylık bir maliyet getirir. Bu yüzden önce temanın ve Shopify'ın kendi özelliklerinin yetip yetmediğine bakalım.

## Kişiselleştirilebilir ürünler

Print-on-demand ürünler için müşterinin rengi, bedeni ya da baskıyı seçtiği ürün yapılandırıcıları kuralım. Seçimleri fiyat mantığına bağlayalım, siparişin üretime doğru bilgiyle gitmesini sağlayalım.

## Nasıl ilerleyelim?

1. **Keşif:** Ürün yapısını, satış kanallarını ve teslimat ihtiyacını konuşalım.
2. **Kurulum:** Temayı kuralım ve markanıza göre özelleştirelim, ürünleri ve koleksiyonları düzenleyelim.
3. **Entegrasyon:** Gerekli uygulamaları bağlayalım, ödeme ve kargo ayarlarını tamamlayalım.
4. **Test ve yayın:** Gerçek bir sipariş akışını baştan sona deneyelim, sonra mağazayı açalım.

Açılıştan önce [Shopify mağaza açmadan önce yapılacak 5 ayar](/blog/shopify-magaza-acmadan-once) yazımıza da göz atabilirsiniz.`,
    ),
    faq: faq('shq', [
      ['Shopify mı, WooCommerce mu?', 'Ürün sayısına, ekibinize ve bütçenize bağlı. Sunucu ve güncelleme işiyle uğraşmak istemiyorsanız Shopify genellikle daha az bakım ister. Kararı birlikte verelim.'],
      ['Mevcut mağazamı devralabilir misiniz?', 'Evet. Önce mağazayı inceleyelim, gereksiz uygulamaları ve yavaşlığa yol açan noktaları belirleyelim.'],
      ['Ürünleri siz mi yüklüyorsunuz?', 'İsterseniz evet. Toplu yükleme için ürün listesini birlikte hazırlayalım ya da sizin yüklemeniz için bir şablon verelim.'],
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
    image: img('service-shopify', 'A boutique shop counter with folded clothes and a tablet showing product tiles'),
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
    image: img('service-support', 'Dizüstü bilgisayar ekranındaki bir noktayı parmağıyla gösteren biri'),
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

## Nasıl çalışalım?

Belirtiyi değil nedeni arayalım. Önce sorunu yeniden üretelim, hangi değişiklikten sonra başladığını bulalım. Düzeltmeyi mümkünse bir test kopyasında deneyelim. Değilse önce yedek alalım.

Sorun bir temanın, eklentinin ya da hosting firmasının kendisinden kaynaklanıyorsa destek ekipleriyle yazışmayı biz yürütelim. Sizin araya girmeniz gerekmez.

## Sonunda ne alırsınız?

Çalışan bir site ve kısa bir rapor: sorun neydi, neden oldu, ne değişti. Benzer bir durum tekrar yaşanırsa nereye bakılacağı bellidir.

Site yavaşlığıyla uğraşıyorsanız [siteniz neden yavaş](/blog/siteniz-neden-yavas) yazımızda en sık karşılaştığımız beş nedeni anlattık.`,
    ),
    faq: faq('suq', [
      ['Acil bir sorunda ne kadar hızlı dönüyorsunuz?', 'İlk yanıtı 24 saat içinde veririz. Site tamamen erişilemez durumdaysa önceliklendiririz.'],
      ['Başkasının kurduğu siteye de bakıyor musunuz?', 'Evet. Çoğu destek talebi başka birinin kurduğu sitelerden gelir. Önce kısa bir inceleme yapalım.'],
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
    image: img('service-support', 'Someone pointing at a spot on a laptop screen'),
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
    image: img('service-ai', 'Ekranında yumuşak dalga biçimleri olan dizüstü bilgisayar, masada bir fincan'),
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

## Neler yapalım?

- **Prototip:** Bir fikri günler yerine saatler içinde tıklanabilir bir örneğe dönüştürelim. Böylece karar vermeden önce görürsünüz.
- **Özel geliştirme:** WordPress eklentileri, Shopify uygulama entegrasyonları, küçük otomasyonlar ve API bağlantıları.
- **AI özellikleri:** Sitenize akıllı arama, soru yanıtlayan bir asistan ya da içerik düzenleme akışları eklemek.
- **Mevcut kodu anlamak:** Belgesi olmayan eski bir temayı ya da eklentiyi hızla çözümleyelim, güvenle değiştirelim.

## Nasıl kontrol ediyoruz?

AI'ın ürettiği her satır kod bir geliştiricinin incelemesinden geçer. Testleri çalıştırır, hız ve erişilebilirliği ölçeriz. Müşteri verisini ve gizli bilgileri AI araçlarıyla paylaşmayız.

## Kimler için?

Hazır bir tema ya da eklentinin yetmediği, ama sıfırdan büyük bir yazılım projesine de gerek olmayan işler için. Çoğu zaman bir [WordPress](/hizmetler/wordpress-kurumsal-site) ya da [Shopify](/hizmetler/shopify-magaza-kurulumu) projesinin içinde yer alır.`,
    ),
    faq: faq('aiq', [
      ['Kodu tamamen AI mı yazıyor?', 'Hayır. AI taslak ve tekrar eden kısımlarda yardım eder. Mimariyi, kararları ve son kontrolü biz yaparız. Her değişiklik incelenir ve test edilir.'],
      ['Verilerim AI araçlarıyla paylaşılıyor mu?', 'Hayır. Müşteri verisini, şifreleri ve gizli bilgileri AI araçlarına vermeyiz. Gerekirse anonim örnek veriyle çalışırız.'],
      ['Siteme bir AI asistanı ekleyebilir misiniz?', 'Evet. Sitenizin içeriğine dayanan ve sınırları belli bir asistan kurabiliriz. Önce gerçekten işe yarayıp yaramayacağını birlikte değerlendirelim.'],
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
    image: img('service-ai', 'A laptop showing soft flowing wave shapes, a mug on the desk'),
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
    excerpt: 'Alan adı, DNS, SSL ve kurumsal e-posta ayarları. Sitenizi yeni sunucuya kesintisiz taşıyalım. Hesaplar sizin adınıza açılır.',
    image: img('service-hosting', 'Dizüstü bilgisayarın yanında durum ışıkları yanan küçük bir sunucu cihazı'),
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
      `## Neler yapalım?

Alan adınızı doğru sunucuya yönlendirelim, cPanel ya da Plesk üzerinde sitenizi kuralım, SSL sertifikasını etkinleştirelim. Alan adınıza bağlı e-posta hesaplarını açalım, e-postaların spam klasörüne düşmemesi için gerekli DNS kayıtlarını ekleyelim.

## Taşıma

Mevcut sitenizi yeni bir sunucuya taşırken önce tam yedek alalım. Siteyi yeni sunucuda kurup kontrol ettikten sonra DNS'i yönlendirelim. Böylece ziyaretçileriniz kesinti yaşamaz, e-postalarınız kaybolmaz.

## Hesaplar kimin?

Sizin. Hosting ve alan adı hesapları sizin adınıza açılır. Şifreler sizde kalır. Paket seçerken ihtiyacınıza göre birkaç seçeneği karşılaştıralım. Gereğinden büyük bir paket önermeyiz.

Yeni bir site kuruyorsanız bu adım genellikle bir [WordPress](/hizmetler/wordpress-kurumsal-site) projesinin parçası olarak yapılır.`,
    ),
    faq: faq('hoq', [
      ['Hangi hosting firmasını öneriyorsunuz?', 'Tek bir firmaya bağlı değiliz. Site türüne, trafiğe ve bütçeye göre birkaç seçeneğe birlikte bakalım.'],
      ['Taşıma sırasında site kapanır mı?', 'Hayır. Siteyi yeni sunucuda hazırlayıp kontrol ettikten sonra yönlendirme yaparız.'],
      ['E-postalarım neden spam klasörüne düşüyor?', 'Çoğu zaman SPF, DKIM ve DMARC kayıtları eksik ya da hatalıdır. Kurulumda bunları doğru şekilde ekleyelim.'],
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
    image: img('service-hosting', 'A small server device with status lights next to a laptop'),
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

  // ---------- Speed and SEO ----------
  {
    _id: 'service-seo-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-seo',
    title: 'Hız ve SEO',
    headline: 'Site hızı ve teknik SEO',
    slug: slug('hiz-ve-seo'),
    order: 6,
    icon: 'search',
    excerpt: 'Sitenizi hızlandıralım, Google\'ın doğru okuyacağı şekilde düzenleyelim. Ziyaretçi de arama motoru da beklemesin.',
    image: img('service-speed', 'Ekranında yükselen çubuk grafikler açık dizüstü bilgisayarda yazan eller'),
    deliverables: [
      'Hız ölçümü: LCP, INP ve CLS',
      'Görsel, kod ve eklenti optimizasyonu',
      'Önbellek ve CDN ayarları',
      'Başlık yapısı, meta başlık ve açıklamalar',
      'Site haritası, yönlendirmeler ve yapısal veri',
      'Search Console kurulumu ve takibi',
    ],
    body: pt(
      'seo',
      `## Neden önemli?

Yavaş açılan bir sayfada ziyaretçi beklemez. Google da sayfa deneyimini sıralamada hesaba katar. Hızlı ve düzgün yapılandırılmış bir site hem ziyaretçiyi tutar hem de aramalarda daha kolay bulunur.

## Neler yapalım?

- **Hız:** Sayfalarınızı ölçelim, en çok yavaşlatan şeyleri bulalım. Görselleri küçültelim, gereksiz eklentileri ve kodları temizleyelim, önbelleği doğru kuralım.
- **Teknik SEO:** Başlık sırasını, meta başlık ve açıklamaları, site haritasını ve yönlendirmeleri düzenleyelim. Google'ın sayfalarınızı doğru anlaması için yapısal veri ekleyelim.
- **Takip:** Google Search Console'u kuralım, sitenin aramalardaki durumunu birlikte izleyelim.

## Nasıl ilerleyelim?

Önce mevcut durumu ölçelim ve size sade bir özet çıkaralım. Hangi adımın en çok fark yaratacağını birlikte seçelim. Her değişiklikten sonra yeniden ölçelim, farkı birlikte görelim.

Site yavaşlığının en sık nedenlerini [siteniz neden yavaş](/blog/siteniz-neden-yavas) yazımızda anlattık. Yavaşlık bir hatadan kaynaklanıyorsa [teknik destek](/hizmetler/teknik-destek) tarafında birlikte bakalım.`,
    ),
    faq: faq('seoq', [
      ['Lighthouse puanı 100 olmak zorunda mı?', 'Hayır. Puan bir araç, hedef değil. Asıl önemli olan gerçek ziyaretçinin deneyimi. Yine de 90 ve üzeri iyi bir işarettir.'],
      ['SEO ile hemen ilk sıraya çıkar mıyım?', 'Kimse bunu söz veremez. Teknik SEO, sitenizin doğru okunmasını ve hızlı açılmasını sağlar. Sıralamayı içerik ve zaman da belirler.'],
      ['Bu çalışma mevcut siteme zarar verir mi?', 'Hayır. Her değişiklikten önce yedek alırız, mümkünse önce bir test kopyasında deneriz.'],
    ]),
    seo: {
      title: 'Site hızı ve teknik SEO',
      description: 'Web sitenizi hızlandıralım ve Google için doğru yapılandıralım: hız ölçümü, görsel ve kod optimizasyonu, meta etiketler, site haritası ve Search Console.',
    },
  },
  {
    _id: 'service-seo-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-seo',
    title: 'Speed and SEO',
    headline: 'Site speed and technical SEO',
    slug: slug('speed-and-seo'),
    order: 6,
    icon: 'search',
    excerpt: 'We make your site faster and set it up so Google reads it correctly. Neither visitors nor search engines have to wait.',
    image: img('service-speed', 'Hands typing on a laptop showing rising bar charts'),
    deliverables: [
      'Speed measurement: LCP, INP and CLS',
      'Image, code and plugin optimization',
      'Caching and CDN settings',
      'Heading structure, meta titles and descriptions',
      'Sitemap, redirects and structured data',
      'Search Console setup and monitoring',
    ],
    body: pt(
      'seo',
      `## Why it matters

Visitors don't wait for a slow page. Google also takes page experience into account when ranking. A fast, well-structured site keeps visitors and is easier to find in search.

## What we do

- **Speed:** We measure your pages and find what slows them down most. We resize images, remove unneeded plugins and code, and set up caching properly.
- **Technical SEO:** We sort out heading order, meta titles and descriptions, the sitemap and redirects, and add structured data so Google understands your pages.
- **Monitoring:** We set up Google Search Console and follow how the site does in search together.

## How we work

First we measure where things stand and give you a plain summary. Together we pick the step that will make the most difference. After each change we measure again, so you see the difference.

We cover the most common causes of a slow site in [why is your site slow](/en/blog/why-is-your-site-slow). If the slowdown comes from a bug, our [technical support](/en/services/technical-support) looks into it.`,
    ),
    faq: faq('seoq', [
      ['Does the Lighthouse score need to be 100?', 'No. The score is a tool, not the goal. What matters is the experience of real visitors. Still, 90 and above is a good sign.'],
      ['Will SEO put me at the top right away?', 'Nobody can promise that. Technical SEO makes sure your site is read correctly and loads fast. Content and time decide the ranking too.'],
      ['Could this work harm my current site?', 'No. We take a backup before every change and, where possible, try it on a staging copy first.'],
    ]),
    seo: {
      title: 'Site speed and technical SEO',
      description: 'We make your website faster and set it up properly for Google: speed audits, image and code optimization, meta tags, sitemaps and Search Console.',
    },
  },

  // ---------- Deutsch ----------
  {
    _id: 'service-wordpress-de',
    _type: 'service',
    language: 'de',
    translationKey: 'service-wordpress',
    title: 'WordPress',
    headline: 'WordPress-Websites für Unternehmen',
    slug: slug('wordpress-unternehmenswebsite'),
    order: 1,
    icon: 'wordpress',
    excerpt: 'Firmenwebsites, die Ihr Unternehmen klar und ansprechend zeigen. Texte und Fotos pflegen Sie danach selbst, ohne auf jemanden angewiesen zu sein.',
    image: img('service-wordpress', 'Ein Laptop mit einem schlichten Website-Layout, daneben Pflanzen und ein Notizbuch'),
    deliverables: [
      'Seitenstruktur und Inhaltsplan',
      'Theme-Einrichtung und Anpassung an Ihre Marke',
      'Auswahl und Konfiguration der Plugins',
      'Formulare, Backups, Caching und Sicherheit',
      'SEO-Grundlagen: Titel, Beschreibungen, Sitemap',
      'Updates und Wartung nach dem Livegang',
    ],
    body: pt(
      'wp',
      `## Für wen

Unternehmen, Selbstständige, Vereine und Organisationen, die eine Website brauchen, die ihre Arbeit erklärt. Auch das Aufräumen einer bestehenden WordPress-Website, die mit der Zeit unübersichtlich geworden ist, gehört dazu.

## Wovon wir ausgehen

Bevor wir ein Theme wählen, schauen wir auf die Inhalte. Welche Seiten braucht es, was suchen die Besucher und wer pflegt die Website? Die Struktur folgt diesen Antworten, das Theme folgt der Struktur. Nicht umgekehrt.

Jedes Plugin bedeutet Wartung. Wir installieren nur die, die sich lohnen. Wenn das Theme die Aufgabe schon erfüllt, kommt kein weiteres Plugin dazu.

## So arbeiten wir

1. **Gespräch:** Wir sprechen über Ziele, Seiten und Inhalte und halten den Umfang in einem schriftlichen Angebot fest.
2. **Umsetzung:** Wir bauen auf einer Testumgebung und zeigen Ihnen den Stand über einen Vorschau-Link.
3. **Prüfung:** Gemeinsam prüfen wir Geschwindigkeit, mobile Darstellung, Formulare und SEO-Einstellungen.
4. **Livegang:** Wir erstellen ein Backup, schalten die Website live und behalten sie in den ersten Tagen genau im Blick.

## Nach dem Livegang

Wir halten WordPress, das Theme und die Plugins aktuell, mit einem Backup vor jedem Update. Wenn etwas nicht funktioniert, kümmert sich dasselbe Team im [technischen Support](/de/leistungen/technischer-support) darum. Für eine schnelle Website, die in der Suche gut dasteht, arbeiten wir auch an [Ladezeit und SEO](/de/leistungen/ladezeit-und-seo).

Sie stehen kurz vor dem Start? Unsere [WordPress-Checkliste vor dem Livegang](/de/blog/wordpress-checkliste-vor-dem-livegang) ist ein guter Anfang.`,
    ),
    faq: faq('wpq', [
      ['Wie lange dauert eine WordPress-Website?', 'Das hängt vom Umfang ab. Eine kleine Firmenwebsite dauert meist zwei bis vier Wochen. Den Zeitplan erhalten Sie schriftlich mit dem Angebot.'],
      ['Nutzen Sie ein fertiges Theme oder ein eigenes Design?', 'Was das Projekt braucht. Für die meisten Firmenwebsites reicht ein gutes Theme, das an Ihre Marke angepasst wird. Wenn nicht, ergänzen wir eigene Komponenten.'],
      ['Auf wessen Namen laufen Hosting und Domain?', 'Auf Ihren. Die Zugänge gehören Ihnen. Auf Wunsch richten wir sie für Sie ein.'],
      ['Kann ich die Website später selbst pflegen?', 'Ja. Bei der Übergabe gehen wir den Admin-Bereich gemeinsam durch und zeigen Ihnen alles, was Sie brauchen.'],
    ]),
    seo: {
      title: 'WordPress-Firmenwebsite: Einrichtung und Wartung',
      description: 'WordPress-Websites, geplant nach Ihren Inhalten: Einrichtung, Theme-Anpassung, Plugin-Konfiguration, SEO-Grundlagen und laufende Wartung.',
    },
  },
  {
    _id: 'service-shopify-de',
    _type: 'service',
    language: 'de',
    translationKey: 'service-shopify',
    title: 'Shopify',
    headline: 'Shopify-Shop: Einrichtung und Entwicklung',
    slug: slug('shopify-shop-einrichten'),
    order: 2,
    icon: 'cart',
    excerpt: 'Onlineshops, in denen Sie Ihre Produkte einfach zeigen und verkaufen und Bestellungen sogar vom Handy aus verfolgen.',
    image: img('service-shopify', 'Eine Ladentheke mit gefalteter Kleidung und einem Tablet mit Produktkacheln'),
    deliverables: [
      'Shop-Einrichtung und Theme-Anpassung',
      'Struktur für Produkte, Varianten und Kollektionen',
      'Auswahl und Anbindung von Apps',
      'Produktkonfiguratoren für Print on Demand',
      'Zahlung, Versand, Steuern und Rechtstexte',
      'Testbestellungen vor dem Start',
    ],
    body: pt(
      'sh',
      `## Für wen

Kleine Marken, die online verkaufen wollen, und Shop-Betreiber, die Ordnung in einen bestehenden Shopify-Shop bringen möchten.

## Wie wir einen Shop aufbauen

Vor dem Theme schauen wir auf die Produkte. Wie finden Kunden ein Produkt, was vergleichen sie und was wollen sie vor dem Kauf wissen? Kollektionen, Filter und Produktseiten folgen diesen Antworten.

Apps sind schnell installiert und schwer wieder loszuwerden. Jede macht den Shop etwas langsamer und kostet monatlich. Deshalb prüfen wir zuerst, ob das Theme und die Bordmittel von Shopify den Bedarf schon abdecken.

## Personalisierte Produkte

Für Print-on-Demand-Produkte bauen wir Konfiguratoren, in denen Kunden Farbe, Größe oder Motiv wählen. Jede Auswahl ist mit der Preislogik verknüpft, damit die Bestellung mit den richtigen Angaben in die Produktion geht.

## So arbeiten wir

1. **Gespräch:** Wir sprechen über Produktstruktur, Verkaufskanäle und Versand.
2. **Einrichtung:** Wir installieren und passen das Theme an und ordnen Produkte und Kollektionen.
3. **Anbindung:** Wir verbinden die nötigen Apps und schließen Zahlungs- und Versandeinstellungen ab.
4. **Test und Start:** Wir spielen eine echte Bestellung von Anfang bis Ende durch und eröffnen dann den Shop.

Vor dem Start lohnt sich ein Blick auf [5 Dinge vor der Eröffnung Ihres Shopify-Shops](/de/blog/vor-der-eroeffnung-ihres-shopify-shops).`,
    ),
    faq: faq('shq', [
      ['Shopify oder WooCommerce?', 'Das hängt von Ihrem Sortiment, Ihrem Budget und davon ab, wer den Shop betreibt. Wenn Sie sich nicht um Server und Updates kümmern möchten, braucht Shopify meist weniger Wartung. Wir entscheiden gemeinsam.'],
      ['Können Sie meinen bestehenden Shop übernehmen?', 'Ja. Zuerst prüfen wir den Shop und zeigen Ihnen ungenutzte Apps und alles, was ihn bremst.'],
      ['Laden Sie die Produkte hoch?', 'Wenn Sie möchten. Für größere Mengen bereiten wir die Produktliste mit Ihnen vor oder geben Ihnen eine Vorlage zum Ausfüllen.'],
    ]),
    seo: {
      title: 'Shopify-Shop einrichten und Theme anpassen',
      description: 'Shopify-Shops, aufgebaut rund um Ihre Produkte: Theme-Anpassung, App-Anbindungen, Katalogstruktur und Produktkonfiguratoren für Print on Demand.',
    },
  },
  {
    _id: 'service-support-de',
    _type: 'service',
    language: 'de',
    translationKey: 'service-support',
    title: 'Technischer Support',
    headline: 'Technischer Support für WordPress und Shopify',
    slug: slug('technischer-support'),
    order: 3,
    icon: 'wrench',
    excerpt: 'Praktische Hilfe bei fehlerhaften Seiten, einer langsamen Website oder anderen technischen Problemen, damit Sie sich nicht darum kümmern müssen.',
    image: img('service-support', 'Eine Person zeigt auf eine Stelle auf einem Laptop-Bildschirm'),
    deliverables: [
      'Fehler nachstellen und die Ursache finden',
      'Konflikte zwischen Theme und Plugins lösen',
      'Probleme mit Cache und Ladezeit beheben',
      'Kleine Korrekturen an Code und Layout',
      'Support-Anfragen bei Theme, Plugin und Hosting',
      'Ein kurzer Bericht zu Ursache und Änderungen',
    ],
    body: pt(
      'su',
      `## Welche Probleme?

- Seiten, die nach einem Update nicht mehr funktionieren, oder ein weißer Bildschirm
- Plugins oder Apps, die sich gegenseitig stören
- Ein Cache, der Ihre Änderungen verdeckt
- Formulare, die nicht senden, und E-Mails, die nicht ankommen
- Bereiche, die auf dem Handy verrutschen oder überstehen
- Seiten, die plötzlich langsam laden

## So arbeiten wir

Wir suchen die Ursache, nicht das Symptom. Zuerst stellen wir den Fehler nach und finden heraus, welche Änderung ihn ausgelöst hat. Wo möglich, testen wir die Lösung auf einer Kopie. Sonst erstellen wir vorher ein Backup.

Liegt das Problem bei einem Theme, einem Plugin oder dem Hoster, übernehmen wir die Abstimmung mit deren Support. Sie müssen nicht dazwischen stehen.

## Was Sie bekommen

Eine funktionierende Website und einen kurzen Bericht: was das Problem war, warum es auftrat und was geändert wurde. Taucht etwas Ähnliches wieder auf, ist klar, wo man suchen muss.

Ihre Website ist langsam? Die fünf häufigsten Ursachen zeigen wir in [warum ist Ihre Website langsam](/de/blog/warum-ist-ihre-website-langsam).`,
    ),
    faq: faq('suq', [
      ['Wie schnell reagieren Sie bei dringenden Problemen?', 'Wir antworten innerhalb von 24 Stunden. Ist die Website komplett ausgefallen, hat das Vorrang.'],
      ['Arbeiten Sie auch an Websites, die jemand anderes gebaut hat?', 'Ja. Die meisten Support-Anfragen kommen von Websites, die jemand anderes gebaut hat. Wir beginnen mit einer kurzen Prüfung.'],
      ['Wie wird abgerechnet?', 'Nach Umfang. Ein Festpreis für einmalige Korrekturen, ein Monatspaket für laufenden Support.'],
    ]),
    seo: {
      title: 'Technischer Support für WordPress und Shopify',
      description: 'Fehlerhafte Seiten, Plugin-Konflikte, Probleme mit Cache und Ladezeit. Technischer Support für WordPress und Shopify, der die Ursache findet und behebt.',
    },
  },
  {
    _id: 'service-ai-de',
    _type: 'service',
    language: 'de',
    translationKey: 'service-ai',
    title: 'KI-gestützte Entwicklung',
    headline: 'KI-gestützte Webentwicklung',
    slug: slug('ki-gestuetzte-entwicklung'),
    order: 4,
    icon: 'ai',
    excerpt: 'Kleine, clevere Lösungen, die Ihren Alltag erleichtern, Kunden auf Ihrer Website helfen oder Ihre Abläufe beschleunigen.',
    image: img('service-ai', 'Ein Laptop mit weichen, fließenden Wellenformen, daneben eine Tasse'),
    deliverables: [
      'Ein Plan, wo KI wirklich hilft',
      'Schnelle Prototypen und Oberflächen-Tests',
      'Eigene Plugins, Integrationen und Automationen',
      'KI-Funktionen auf Ihrer Website: Suche, Assistenten, Inhalte',
      'Code-Review und Tests durch Menschen',
      'Prüfung von Datenschutz und Datenverarbeitung',
    ],
    body: pt(
      'ai',
      `## Was das bedeutet

KI-Werkzeuge machen manche Arbeit deutlich schneller: Recherche, erste Entwürfe, wiederkehrender Code, Testfälle. Genau dort setzen wir sie ein. Was gebaut wird, wie es gebaut wird und ob es stimmt, entscheiden weiterhin wir.

KI ersetzt kein Urteilsvermögen. Die gesparte Zeit fließt in Gestaltung, Tests und Details.

## Was wir machen

- **Prototypen:** Wir machen aus einer Idee in Stunden statt Tagen ein klickbares Beispiel, damit Sie es sehen, bevor Sie entscheiden.
- **Eigene Entwicklung:** WordPress-Plugins, Anbindungen an Shopify-Apps, kleine Automationen und API-Verbindungen.
- **KI-Funktionen:** Eine intelligente Suche, ein Assistent, der Fragen beantwortet, oder Abläufe zur Bearbeitung von Inhalten auf Ihrer Website.
- **Bestehenden Code verstehen:** Wir erfassen ein undokumentiertes Theme oder Plugin schnell und ändern es dann sicher.

## Wie wir die Kontrolle behalten

Jede Zeile KI-generierter Code wird von einem Entwickler geprüft. Wir führen die Tests aus und messen Ladezeit und Barrierefreiheit. Kundendaten und Zugangsdaten geben wir nicht an KI-Werkzeuge weiter.

## Für wen

Aufgaben, bei denen ein fertiges Theme oder Plugin nicht reicht, ein großes Softwareprojekt aber übertrieben wäre. Meist ist das Teil eines Projekts mit [WordPress](/de/leistungen/wordpress-unternehmenswebsite) oder [Shopify](/de/leistungen/shopify-shop-einrichten).`,
    ),
    faq: faq('aiq', [
      ['Schreibt die KI den ganzen Code?', 'Nein. Die KI hilft bei Entwürfen und wiederkehrenden Teilen. Architektur, Entscheidungen und die letzte Prüfung liegen bei uns. Jede Änderung wird geprüft und getestet.'],
      ['Werden meine Daten an KI-Werkzeuge weitergegeben?', 'Nein. Kundendaten, Passwörter und Zugangsdaten geben wir nicht an KI-Werkzeuge. Bei Bedarf arbeiten wir mit anonymisierten Beispieldaten.'],
      ['Können Sie einen KI-Assistenten auf meiner Website einbauen?', 'Ja. Wir können einen Assistenten bauen, der sich auf die Inhalte Ihrer Website stützt und klare Grenzen hat. Vorher prüfen wir gemeinsam, ob er wirklich hilft.'],
    ]),
    seo: {
      title: 'KI-gestützte Webentwicklung',
      description: 'Webentwicklung mit KI für Prototypen, eigene Lösungen und Automationen. Jede Zeile wird von einem Entwickler geprüft, bevor sie live geht.',
    },
  },
  {
    _id: 'service-hosting-de',
    _type: 'service',
    language: 'de',
    translationKey: 'service-hosting',
    title: 'Domain und Hosting',
    headline: 'Domain, Hosting und E-Mail einrichten',
    slug: slug('domain-und-hosting'),
    order: 5,
    icon: 'server',
    excerpt: 'Domain, DNS, SSL und geschäftliche E-Mail. Wir ziehen Ihre Website ohne Ausfall auf einen neuen Server um. Die Zugänge laufen auf Ihren Namen.',
    image: img('service-hosting', 'Ein kleiner Server mit Statusleuchten neben einem Laptop'),
    deliverables: [
      'Ein Hosting-Tarif, der zur Website passt',
      'Domain- und DNS-Konfiguration',
      'Einrichtung der Website in cPanel oder Plesk',
      'SSL-Zertifikat und HTTPS-Weiterleitung',
      'Geschäftliche E-Mail mit SPF, DKIM und DMARC',
      'Umzug Ihrer Website auf einen neuen Server',
    ],
    body: pt(
      'ho',
      `## Was wir machen

Wir verbinden Ihre Domain mit dem richtigen Server, richten Ihre Website in cPanel oder Plesk ein und aktivieren SSL. Wir legen E-Mail-Postfächer auf Ihrer Domain an und ergänzen die DNS-Einträge, damit Ihre E-Mails nicht im Spam landen.

## Umzug

Bevor wir eine bestehende Website auf einen neuen Server umziehen, erstellen wir ein vollständiges Backup. Wir richten die Website auf dem neuen Server ein, prüfen sie und stellen dann die DNS um. Besucher merken keinen Ausfall und keine E-Mail geht verloren.

## Wem gehören die Zugänge?

Ihnen. Hosting und Domain laufen auf Ihren Namen, die Passwörter bleiben bei Ihnen. Bei der Wahl des Tarifs vergleichen wir einige Angebote und empfehlen nicht mehr, als die Website braucht.

Bei einer neuen Website ist dieser Schritt meist Teil eines [WordPress](/de/leistungen/wordpress-unternehmenswebsite)-Projekts.`,
    ),
    faq: faq('hoq', [
      ['Welchen Hoster empfehlen Sie?', 'Wir sind an keinen gebunden. Je nach Art der Website, Besucherzahl und Budget schlagen wir einige Optionen vor.'],
      ['Ist die Website während des Umzugs offline?', 'Nein. Wir bereiten die Website auf dem neuen Server vor und prüfen sie, bevor wir umschalten.'],
      ['Warum landen meine E-Mails im Spam?', 'Meist fehlen SPF-, DKIM- und DMARC-Einträge oder sie sind falsch. Wir richten sie korrekt ein.'],
    ]),
    seo: {
      title: 'Domain, Hosting, SSL und E-Mail einrichten',
      description: 'Domain und DNS, Einrichtung in cPanel und Plesk, SSL, geschäftliche E-Mail und Umzug ohne Ausfall. Die Zugänge bleiben auf Ihrem Namen.',
    },
  },
  {
    _id: 'service-seo-de',
    _type: 'service',
    language: 'de',
    translationKey: 'service-seo',
    title: 'Ladezeit und SEO',
    headline: 'Ladezeit und technisches SEO',
    slug: slug('ladezeit-und-seo'),
    order: 6,
    icon: 'search',
    excerpt: 'Wir machen Ihre Website schneller und richten sie so ein, dass Google sie richtig liest. Weder Besucher noch Suchmaschinen müssen warten.',
    image: img('service-speed', 'Hände tippen auf einem Laptop mit steigenden Balkendiagrammen'),
    deliverables: [
      'Messung der Ladezeit: LCP, INP und CLS',
      'Optimierung von Bildern, Code und Plugins',
      'Caching und CDN-Einstellungen',
      'Überschriften, Meta-Titel und Beschreibungen',
      'Sitemap, Weiterleitungen und strukturierte Daten',
      'Einrichtung und Beobachtung der Search Console',
    ],
    body: pt(
      'seo',
      `## Warum das wichtig ist

Besucher warten nicht auf eine langsame Seite. Auch Google berücksichtigt die Nutzererfahrung beim Ranking. Eine schnelle, gut strukturierte Website hält Besucher und ist in der Suche leichter zu finden.

## Was wir machen

- **Ladezeit:** Wir messen Ihre Seiten und finden, was sie am meisten bremst. Wir passen Bildgrößen an, entfernen unnötige Plugins und unnötigen Code und richten das Caching richtig ein.
- **Technisches SEO:** Wir ordnen Überschriften, Meta-Titel und Beschreibungen, Sitemap und Weiterleitungen und ergänzen strukturierte Daten, damit Google Ihre Seiten versteht.
- **Beobachtung:** Wir richten die Google Search Console ein und verfolgen gemeinsam, wie sich die Website in der Suche entwickelt.

## So arbeiten wir

Zuerst messen wir den aktuellen Stand und geben Ihnen eine verständliche Zusammenfassung. Gemeinsam wählen wir den Schritt, der am meisten bringt. Nach jeder Änderung messen wir erneut, damit Sie den Unterschied sehen.

Die häufigsten Ursachen einer langsamen Website zeigen wir in [warum ist Ihre Website langsam](/de/blog/warum-ist-ihre-website-langsam). Liegt es an einem Fehler, kümmert sich unser [technischer Support](/de/leistungen/technischer-support) darum.`,
    ),
    faq: faq('seoq', [
      ['Muss der Lighthouse-Wert 100 sein?', 'Nein. Der Wert ist ein Werkzeug, nicht das Ziel. Entscheidend ist die Erfahrung echter Besucher. Ab 90 ist es trotzdem ein gutes Zeichen.'],
      ['Bringt mich SEO sofort nach oben?', 'Das kann niemand versprechen. Technisches SEO sorgt dafür, dass Ihre Website richtig gelesen wird und schnell lädt. Über das Ranking entscheiden auch Inhalte und Zeit.'],
      ['Kann diese Arbeit meiner Website schaden?', 'Nein. Vor jeder Änderung erstellen wir ein Backup und testen, wo möglich, zuerst auf einer Kopie.'],
    ]),
    seo: {
      title: 'Ladezeit und technisches SEO',
      description: 'Wir machen Ihre Website schneller und richten sie für Google ein: Ladezeit-Analyse, Optimierung von Bildern und Code, Meta-Tags, Sitemaps und Search Console.',
    },
  },
];
