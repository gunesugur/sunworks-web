import type { Service } from '../schema';
import { pt } from '../pt';
import { img, slug } from './helpers';

export const services: Service[] = [
  // ---------- WordPress ----------
  {
    _id: 'service-wordpress-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-wordpress',
    title: 'WordPress kurumsal site',
    slug: slug('wordpress-kurumsal-site'),
    order: 1,
    icon: 'wordpress',
    excerpt: 'Kurulum, tema özelleştirme, eklenti entegrasyonu ve yapılandırma; yayından sonra da bakım.',
    image: img('laptop-code-plant', 'Beyaz masada kod editörü açık bir dizüstü bilgisayar ve sarı saksıda bir bitki'),
    deliverables: [
      'WordPress kurulumu ve temel güvenlik ayarları',
      'Tema seçimi ve markanıza göre özelleştirme',
      'Eklenti kurulumu, entegrasyonu ve yapılandırması',
      'İletişim formu, yedekleme ve önbellek ayarları',
      'Yayın sonrası bakım ve güncellemeler',
    ],
    body: pt(
      'wp',
      `## Kimler için?

Kurumsal bir tanıtım sitesine ihtiyacı olan işletmeler, profesyoneller ve dernekler için. Mevcut bir WordPress sitesini toparlamak da bu hizmetin kapsamında.

## Nasıl ilerliyoruz?

Önce sayfa yapısını ve içerik ihtiyacını konuşuruz. Uygun bir tema seçip markanıza göre özelleştirir, gerekli eklentileri kurar ve ayarlarız. Site hazır olduğunda birlikte kontrol eder, yayına alırız.

## Bakım

Yayından sonra WordPress çekirdeği, tema ve eklenti güncellemelerini her seferinde yedek alarak yaparız. Bakımın kapsamını ve sıklığını birlikte belirleriz.`,
    ),
    seo: { description: 'WordPress kurumsal site kurulumu, tema özelleştirme, eklenti yapılandırması ve bakım.' },
  },
  {
    _id: 'service-wordpress-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-wordpress',
    title: 'WordPress business website',
    slug: slug('wordpress-business-website'),
    order: 1,
    icon: 'wordpress',
    excerpt: 'Setup, theme customization, plugin integration and configuration, plus maintenance after launch.',
    image: img('laptop-code-plant', 'A laptop showing a code editor on a white desk next to a plant in a yellow pot'),
    deliverables: [
      'WordPress installation and basic security settings',
      'Theme selection and customization to fit your brand',
      'Plugin installation, integration and configuration',
      'Contact form, backup and cache setup',
      'Maintenance and updates after launch',
    ],
    body: pt(
      'wp',
      `## Who is it for?

Businesses, professionals and associations that need a clear company website. Tidying up an existing WordPress site is part of this service too.

## How we work

We start with the page structure and the content you need. We pick a suitable theme and customize it to your brand, then install and configure the plugins the site needs. When it is ready, we review it together and launch.

## Maintenance

After launch we handle WordPress core, theme and plugin updates, always with a backup first. We agree on the scope and frequency together.`,
    ),
    seo: { description: 'WordPress business website setup, theme customization, plugin configuration and maintenance.' },
  },

  // ---------- Shopify ----------
  {
    _id: 'service-shopify-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-shopify',
    title: 'Shopify mağaza kurulumu',
    slug: slug('shopify-magaza-kurulumu'),
    order: 2,
    icon: 'cart',
    excerpt: 'Tema, uygulama entegrasyonları, ürün ve katalog kurulumu; gerektiğinde print-on-demand ürün yapılandırıcıları.',
    image: img('clothing-store', 'Raflarında katlanmış giysiler ve askıda ürünler bulunan küçük bir mağaza'),
    deliverables: [
      'Mağaza ve tema kurulumu',
      'Tema özelleştirme',
      'Uygulama entegrasyonları',
      'Ürün, koleksiyon ve katalog kurulumu',
      'Print-on-demand ürün yapılandırıcıları',
      'Ödeme, kargo ve vergi ayarlarında yardım',
    ],
    body: pt(
      'sh',
      `## Kimler için?

Ürünlerini çevrim içi satmaya başlamak isteyen ya da mevcut Shopify mağazasını düzenlemek isteyen küçük markalar için.

## Neler yapıyoruz?

Mağaza kurulumu, tema düzenlemeleri ve uygulama entegrasyonlarının yanı sıra print-on-demand ürünler için kişiselleştirme yapılandırıcılarını da kuruyoruz.

## Nasıl ilerliyoruz?

Ürün yapınızı ve satış kanallarınızı konuşarak başlarız. Temayı kurar ve özelleştirir, gerekli uygulamaları entegre eder, ürün ve koleksiyonları düzenleriz. Yayından önce sipariş akışını birlikte test ederiz.`,
    ),
    seo: { description: 'Shopify mağaza kurulumu: tema, uygulama entegrasyonları, ürün ve katalog kurulumu, print-on-demand yapılandırıcıları.' },
  },
  {
    _id: 'service-shopify-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-shopify',
    title: 'Shopify store setup',
    slug: slug('shopify-store-setup'),
    order: 2,
    icon: 'cart',
    excerpt: 'Themes, app integrations, product and catalog setup, and print-on-demand product configurators when needed.',
    image: img('clothing-store', 'A small shop with folded clothes on shelves and garments on hanging rails'),
    deliverables: [
      'Store and theme setup',
      'Theme customization',
      'App integrations',
      'Product, collection and catalog setup',
      'Print-on-demand product configurators',
      'Help with payment, shipping and tax settings',
    ],
    body: pt(
      'sh',
      `## Who is it for?

Small brands that want to start selling online, or that want to tidy up an existing Shopify store.

## What we do

Beyond store setup, theme changes and app integrations, we also set up personalization configurators for print-on-demand products.

## How we work

We start by talking through your product structure and sales channels. We set up and customize the theme, integrate the apps you need, and organize products and collections. Before launch we test the order flow together.`,
    ),
    seo: { description: 'Shopify store setup: themes, app integrations, product and catalog setup, print-on-demand configurators.' },
  },

  // ---------- Support ----------
  {
    _id: 'service-support-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-support',
    title: 'Teknik destek ve sorun giderme',
    slug: slug('teknik-destek'),
    order: 3,
    icon: 'wrench',
    excerpt: 'Tema, eklenti, önbellek ve özel kod kaynaklı sorunların tespiti ve çözümü; gerektiğinde sağlayıcı destek ekipleriyle iletişim.',
    image: img('pointing-laptop', 'Dizüstü bilgisayar ekranındaki bir noktayı parmağıyla gösteren biri'),
    deliverables: [
      'Sorunun yeniden üretilmesi ve kaynağının bulunması',
      'Tema ve eklenti çakışmalarının çözümü',
      'Önbellek kaynaklı sorunların giderilmesi',
      'Küçük özel kod düzeltmeleri',
      'Tema veya eklenti sağlayıcısının destek ekibiyle yazışma',
      'Yapılanları anlatan kısa bir not',
    ],
    body: pt(
      'su',
      `## Ne tür sorunlar?

Güncellemeden sonra bozulan sayfalar, birbiriyle çakışan eklentiler, değişiklikleri göstermeyen önbellek, çalışmayan formlar ya da sitenin bir bölümünde beklenmedik görünen hatalar.

## Nasıl ilerliyoruz?

Önce sorunu yeniden üretir ve kaynağını buluruz. Mümkünse düzeltmeyi bir test kopyasında deneriz; değilse yedek alarak ilerleriz. Sorun bir tema ya da eklentinin kendisinden kaynaklanıyorsa, sağlayıcının destek ekibiyle yazışmayı biz üstleniriz.

## Sonunda ne alırsınız?

Sorunun nedenini ve yapılan değişiklikleri anlatan kısa bir not. Böylece benzer bir durum tekrar yaşanırsa nereye bakılacağı bellidir.`,
    ),
    seo: { description: 'WordPress ve Shopify için teknik destek: tema, eklenti, önbellek ve özel kod sorunlarının tespiti ve çözümü.' },
  },
  {
    _id: 'service-support-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-support',
    title: 'Technical support and troubleshooting',
    slug: slug('technical-support'),
    order: 3,
    icon: 'wrench',
    excerpt: 'Finding and fixing theme, plugin, cache and custom-code issues, and working with vendor support teams when needed.',
    image: img('pointing-laptop', 'Someone pointing at a spot on a laptop screen'),
    deliverables: [
      'Reproducing the issue and finding its source',
      'Resolving theme and plugin conflicts',
      'Fixing cache-related issues',
      'Small custom-code fixes',
      'Handling communication with theme or plugin vendor support',
      'A short note explaining what was done',
    ],
    body: pt(
      'su',
      `## What kind of issues?

Pages that break after an update, plugins that conflict with each other, a cache that hides your changes, forms that stop working, or unexpected errors in one part of the site.

## How we work

First we reproduce the issue and find where it comes from. Where possible we test the fix on a staging copy; otherwise we take a backup first. If the problem sits in a theme or plugin itself, we take care of the conversation with the vendor's support team.

## What you get at the end

A short note explaining the cause and the changes made, so it is clear where to look if something similar happens again.`,
    ),
    seo: { description: 'Technical support for WordPress and Shopify: finding and fixing theme, plugin, cache and custom-code issues.' },
  },

  // ---------- Front-end ----------
  {
    _id: 'service-frontend-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-frontend',
    title: 'HTML/CSS ön yüz düzeltmeleri',
    slug: slug('on-yuz-duzeltmeleri'),
    order: 4,
    icon: 'code',
    excerpt: 'Bozulan hizalamalar, mobil görünüm sorunları ve küçük arayüz düzenlemeleri için HTML, CSS ve temel JavaScript düzeltmeleri.',
    image: img('code-dark', 'Koyu ekranlı bir dizüstü bilgisayarda renkli kod satırları'),
    deliverables: [
      'Mobil ve tablet görünüm düzeltmeleri',
      'Hizalama, boşluk ve tipografi düzenlemeleri',
      'Tema içinde küçük HTML/CSS değişiklikleri',
      'Temel JavaScript düzeltmeleri',
    ],
    body: pt(
      'fe',
      `## Ne tür işler?

Telefonda taşan bir bölüm, hizası kaymış bir menü, okunaksız bir yazı tipi ya da temanın izin vermediği küçük bir tasarım değişikliği gibi, sitenin görünümüyle ilgili küçük ve net işler.

## Kapsam

Bu hizmet HTML, CSS ve temel JavaScript ile yapılabilen küçük düzeltmeleri kapsar. Büyük ölçekli uygulama geliştirme ya da karmaşık JavaScript projeleri bu hizmetin kapsamında değildir.`,
    ),
    seo: { description: 'Küçük HTML, CSS ve temel JavaScript düzeltmeleri: mobil görünüm, hizalama ve tema içi düzenlemeler.' },
  },
  {
    _id: 'service-frontend-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-frontend',
    title: 'HTML/CSS front-end fixes',
    slug: slug('front-end-fixes'),
    order: 4,
    icon: 'code',
    excerpt: 'HTML, CSS and basic JavaScript fixes for broken alignment, mobile layout issues and small interface changes.',
    image: img('code-dark', 'Colorful lines of code on a laptop with a dark screen'),
    deliverables: [
      'Mobile and tablet layout fixes',
      'Alignment, spacing and typography adjustments',
      'Small HTML/CSS changes inside your theme',
      'Basic JavaScript fixes',
    ],
    body: pt(
      'fe',
      `## What kind of work?

Small, well-defined visual fixes: a section that overflows on phones, a misaligned menu, hard-to-read type, or a small design change your theme does not allow out of the box.

## Scope

This service covers small fixes that can be done with HTML, CSS and basic JavaScript. Large application development or complex JavaScript projects are outside its scope.`,
    ),
    seo: { description: 'Small HTML, CSS and basic JavaScript fixes: mobile layout, alignment and in-theme adjustments.' },
  },

  // ---------- Hosting ----------
  {
    _id: 'service-hosting-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-hosting',
    title: 'Alan adı ve hosting kurulumu',
    slug: slug('alan-adi-ve-hosting'),
    order: 5,
    icon: 'server',
    excerpt: 'cPanel veya Plesk üzerinde alan adı, DNS, e-posta ve SSL ayarları; sitenin sunucuya taşınması.',
    image: img('dashboard-laptop', 'Yansıtıcı bir masada grafik paneli açık dizüstü bilgisayar'),
    deliverables: [
      'Alan adı ve DNS yönlendirmeleri',
      'cPanel veya Plesk üzerinde site kurulumu',
      'SSL sertifikası kurulumu',
      'Kurumsal e-posta hesaplarının açılması',
      'Sitenin yeni sunucuya taşınması',
    ],
    body: pt(
      'ho',
      `## Ne yapıyoruz?

Alan adınızı doğru sunucuya yönlendirir, cPanel veya Plesk üzerinde sitenizi kurar, SSL sertifikasını etkinleştiririz. Gerekirse alan adınıza bağlı e-posta hesaplarını açar, mevcut sitenizi yeni bir sunucuya taşırız.

## Hangi sağlayıcı?

Hosting ve alan adı hesapları sizin adınıza açılır ve size ait kalır. Uygun bir paket seçerken ihtiyacınıza göre birkaç seçeneği birlikte değerlendirebiliriz.`,
    ),
    seo: { description: 'Alan adı, DNS, SSL ve e-posta ayarları; cPanel ve Plesk üzerinde site kurulumu ve taşıma.' },
  },
  {
    _id: 'service-hosting-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-hosting',
    title: 'Domain and hosting setup',
    slug: slug('domain-and-hosting'),
    order: 5,
    icon: 'server',
    excerpt: 'Domain, DNS, email and SSL settings on cPanel or Plesk, and moving your site to a new server.',
    image: img('dashboard-laptop', 'A laptop showing a chart dashboard on a reflective desk'),
    deliverables: [
      'Domain and DNS configuration',
      'Site setup on cPanel or Plesk',
      'SSL certificate setup',
      'Creating email accounts on your domain',
      'Moving your site to a new server',
    ],
    body: pt(
      'ho',
      `## What we do

We point your domain to the right server, set up your site on cPanel or Plesk and enable SSL. If needed, we create email accounts on your domain and move an existing site to a new server.

## Which provider?

Hosting and domain accounts are opened in your name and stay yours. When choosing a plan, we can compare a few options based on what you need.`,
    ),
    seo: { description: 'Domain, DNS, SSL and email configuration; site setup and migration on cPanel and Plesk.' },
  },

  // ---------- Training ----------
  {
    _id: 'service-training-tr',
    _type: 'service',
    language: 'tr',
    translationKey: 'service-training',
    title: 'Eğitim ve teslim',
    slug: slug('egitim-ve-teslim'),
    order: 6,
    icon: 'book',
    excerpt: 'Yayından sonra sitenizi kendiniz yönetebilmeniz için birebir eğitim ve yazılı notlar.',
    image: img('writing-notes', 'Masada kahve fincanının yanında kâğıda not alan bir el'),
    deliverables: [
      'Birebir eğitim (yüz yüze veya çevrim içi)',
      'İçerik, sayfa ve ürün güncelleme adımları',
      'Sitenize özel kısa kullanım notları',
      'Eğitimden sonraki sorular için kısa bir destek süresi',
    ],
    body: pt(
      'tr',
      `## Neden önemli?

Bir site ancak güncel tutulabildiğinde işe yarar. Teslimden sonra metin, görsel, sayfa ya da ürün eklemek için her seferinde birine ihtiyaç duymamanız gerekir.

## Nasıl ilerliyoruz?

Sitenizin yönetim panelinde, en sık yapacağınız işler üzerinden birlikte ilerleriz. Ardından adımları ekran görüntüleriyle anlatan kısa notlar hazırlarız. Eğitimi yüz yüze ya da çevrim içi yapabiliriz.`,
    ),
    seo: { description: 'WordPress ve Shopify siteniz için yayın sonrası birebir eğitim ve yazılı kullanım notları.' },
  },
  {
    _id: 'service-training-en',
    _type: 'service',
    language: 'en',
    translationKey: 'service-training',
    title: 'Training and onboarding',
    slug: slug('training-and-onboarding'),
    order: 6,
    icon: 'book',
    excerpt: 'One-to-one training and written notes after launch, so you can manage your site yourself.',
    image: img('writing-notes', 'A hand taking notes on paper next to a coffee cup'),
    deliverables: [
      'One-to-one training (in person or online)',
      'Steps for updating content, pages and products',
      'Short usage notes written for your site',
      'A short support window for questions after training',
    ],
    body: pt(
      'tr',
      `## Why it matters

A website only helps you if it can be kept up to date. After handover, you should not need someone else every time you add text, images, a page or a product.

## How we work

We go through your site's admin panel together, focusing on the tasks you will do most often. Afterwards we write short notes with screenshots of each step. Training can happen in person or online.`,
    ),
    seo: { description: 'One-to-one post-launch training and written usage notes for your WordPress or Shopify site.' },
  },
];
