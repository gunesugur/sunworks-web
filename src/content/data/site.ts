import type { HomePage, Navigation, SiteSettings } from '../schema';
import { img } from './helpers';

const socials: SiteSettings['socials'] = [
  { platform: 'instagram', url: '#' },
  { platform: 'linkedin', url: '#' },
  { platform: 'github', url: '#' },
];

const map: SiteSettings['map'] = { lat: 40.1885, lng: 29.061, zoom: 12, label: 'Bursa' };

export const settings: SiteSettings[] = [
  {
    _id: 'siteSettings-tr',
    _type: 'siteSettings',
    language: 'tr',
    translationKey: 'siteSettings',
    siteName: 'SUN | WORKS',
    tagline: 'WordPress, Shopify ve AI destekli geliştirme yapan bağımsız web stüdyosu',
    email: 'hello@sunworks.studio',
    whatsapp: '905550000000',
    city: 'Bursa',
    socials,
    map: { ...map, label: 'Bursa, Türkiye' },
    newsletter: {
      title: 'Bülten',
      text: 'Yeni bir yazı yayımladığımızda size kısa bir e-posta gönderelim.',
    },
    footerNote: 'Web siteleri, mağazalar ve arkalarında çalışan sistemler.',
    seo: {
      title: 'SUN | WORKS · WordPress, Shopify ve web geliştirme stüdyosu',
      description:
        'Bursa merkezli bağımsız web stüdyosu. WordPress kurumsal siteler, Shopify mağazalar, AI destekli geliştirme, teknik destek ve bakım.',
    },
  },
  {
    _id: 'siteSettings-en',
    _type: 'siteSettings',
    language: 'en',
    translationKey: 'siteSettings',
    siteName: 'SUN | WORKS',
    tagline: 'An independent web studio for WordPress, Shopify and AI-assisted development',
    email: 'hello@sunworks.studio',
    whatsapp: '905550000000',
    city: 'Bursa',
    socials,
    map: { ...map, label: 'Bursa, Türkiye' },
    newsletter: {
      title: 'Newsletter',
      text: "We'll send you a short email when we publish a new article.",
    },
    footerNote: 'Websites, stores and the systems working behind them.',
    seo: {
      title: 'SUN | WORKS · WordPress, Shopify and web development studio',
      description:
        'An independent web studio in Bursa, Türkiye. WordPress business sites, Shopify stores, AI-assisted development, technical support and care.',
    },
  },
];

export const navigation: Navigation[] = [
  {
    _id: 'navigation-tr',
    _type: 'navigation',
    language: 'tr',
    translationKey: 'navigation',
    header: [
      { label: 'Ana sayfa', href: '/' },
      { label: 'Hizmetler', href: '/hizmetler' },
      { label: 'Blog', href: '/blog' },
      { label: 'İletişim', href: '/iletisim' },
    ],
    cta: { label: 'Proje konuşalım', href: '/iletisim' },
    footerColumns: [
      {
        _key: 'pages',
        title: 'Sayfalar',
        links: [
          { label: 'Ana sayfa', href: '/' },
          { label: 'Hizmetler', href: '/hizmetler' },
          { label: 'Blog', href: '/blog' },
          { label: 'İletişim', href: '/iletisim' },
        ],
      },
      {
        _key: 'services',
        title: 'Hizmetler',
        links: [
          { label: 'WordPress', href: '/hizmetler/wordpress-kurumsal-site' },
          { label: 'Shopify', href: '/hizmetler/shopify-magaza-kurulumu' },
          { label: 'AI destekli geliştirme', href: '/hizmetler/ai-destekli-gelistirme' },
          { label: 'Teknik destek', href: '/hizmetler/teknik-destek' },
          { label: 'Alan adı ve hosting', href: '/hizmetler/alan-adi-ve-hosting' },
        ],
      },
      {
        _key: 'contact',
        title: 'İletişim',
        links: [
          { label: 'hello@sunworks.studio', href: 'mailto:hello@sunworks.studio' },
          { label: 'İletişim formu', href: '/iletisim' },
        ],
      },
    ],
    legalLinks: [
      { label: 'Gizlilik', href: '/gizlilik' },
      { label: 'Kullanım koşulları', href: '/kullanim-kosullari' },
      { label: 'Çerez politikası', href: '/cerez-politikasi' },
    ],
  },
  {
    _id: 'navigation-en',
    _type: 'navigation',
    language: 'en',
    translationKey: 'navigation',
    header: [
      { label: 'Home', href: '/en' },
      { label: 'Services', href: '/en/services' },
      { label: 'Blog', href: '/en/blog' },
      { label: 'Contact', href: '/en/contact' },
    ],
    cta: { label: "Let's talk", href: '/en/contact' },
    footerColumns: [
      {
        _key: 'pages',
        title: 'Pages',
        links: [
          { label: 'Home', href: '/en' },
          { label: 'Services', href: '/en/services' },
          { label: 'Blog', href: '/en/blog' },
          { label: 'Contact', href: '/en/contact' },
        ],
      },
      {
        _key: 'services',
        title: 'Services',
        links: [
          { label: 'WordPress', href: '/en/services/wordpress-business-website' },
          { label: 'Shopify', href: '/en/services/shopify-store-setup' },
          { label: 'AI-assisted development', href: '/en/services/ai-assisted-development' },
          { label: 'Technical support', href: '/en/services/technical-support' },
          { label: 'Domain and hosting', href: '/en/services/domain-and-hosting' },
        ],
      },
      {
        _key: 'contact',
        title: 'Contact',
        links: [
          { label: 'hello@sunworks.studio', href: 'mailto:hello@sunworks.studio' },
          { label: 'Contact form', href: '/en/contact' },
        ],
      },
    ],
    legalLinks: [
      { label: 'Privacy', href: '/en/privacy' },
      { label: 'Terms', href: '/en/terms' },
      { label: 'Cookie policy', href: '/en/cookies' },
    ],
  },
];

const tools = ['WordPress', 'Elementor', 'Shopify', 'Stripe', 'PayPal', 'Figma', 'Claude', 'Cloudflare', 'Google Search Console', 'Google Analytics', 'Google Tag Manager', 'Google Ads', 'Meta', 'Mailchimp', 'Make', 'Sanity', 'Astro', 'GitHub', 'cPanel', 'Plesk'];

export const home: HomePage[] = [
  {
    _id: 'homePage-tr',
    _type: 'homePage',
    language: 'tr',
    translationKey: 'homePage',
    seo: {},
    hero: {
      title: 'Aklınızdaki projeyi birlikte hayata geçirelim',
      note: 'Neye ihtiyacınız olduğunu konuşalım, yönetmesi kolay çözümü birlikte kuralım.',
      image: img('hero-desk', 'Aydınlık bir masada kod editörü açık bir dizüstü bilgisayar, yanında bir fincan ve masa lambası'),
      smallImage: img('hands-typing', 'Dizüstü bilgisayarın klavyesinde yazı yazan eller'),
      tags: ['WordPress', 'Shopify', 'AI destekli geliştirme', 'Teknik destek', 'Bakım'],
    },
    tools: { title: 'Çalıştığımız platformlar ve araçlar', items: tools },
    intro: {
      title: 'Önce sizi dinliyoruz',
      text: 'Her işin ve markanın beklentisi farklıdır. Ezbere kalıplar sunmak yerine tam olarak ne yapmak istediğinizi konuşuyor, bütçenize ve hedefinize en uygun yolu birlikte planlıyoruz.',
      cta: { label: 'Hizmetleri inceleyin', href: '/hizmetler' },
    },
    duo: {
      first: img('planning-laptop', 'Dizüstü bilgisayarın yanında kâğıda plan notları alan bir el'),
      second: img('laptop-top-view', 'Ahşap masa üzerinde yukarıdan görünen dizüstü bilgisayar, kahve ve kalemler'),
      firstTag: 'Önce plan',
      secondTag: 'Sonra kurulum',
      link: { label: 'Sürecimizi görün', href: '#process' },
    },
    approach: {
      title: 'Daha az sürpriz, daha fazla netlik',
      image: img('checklist-notebook', 'Defterdeki kontrol listesine işaret koyan bir el'),
      tag: 'Kontrol listesiyle',
      items: [
        {
          _key: 'root-cause',
          icon: 'wrench',
          title: 'Karşılaştığınız sorunlara pratik ve akılcı çözümler',
          text: 'Sitenizde bir şeyler ters mi gidiyor, yavaşlık mı var ya da aklınızda yeni bir fikir mi var? Durumu birlikte inceliyor, gereksiz karmaşaya girmeden işinizi kolaylaştıracak adımları beraber atıyoruz.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'Site yayına girdikten sonra da yanınızdayız',
          text: 'İşi teslim edip iletişimi kesmiyoruz. Sayfalarınızı ve ürünlerinizi nasıl rahatça güncelleyebileceğinizi gösteriyor, aklınıza bir soru takıldığında danışabileceğiniz bir çalışma arkadaşı oluyoruz.',
        },
      ],
      cta: { label: 'Proje konuşalım', href: '/iletisim' },
    },
    servicesSection: {
      title: 'Hizmetler',
      text: 'Her işin ihtiyacı aynı değildir. Sizin için hangisi en kolay ve en mantıklıysa onunla ilerliyoruz.',
    },
    process: {
      title: 'Nasıl çalışıyoruz',
      text: 'Üç aşama, hepsi yazılı. Her aşamanın sonunda neyin bittiğini görür, bir sonrakine birlikte geçeriz.',
      steps: [
        {
          _key: 's1',
          title: 'Tanışalım ve ihtiyacı belirleyelim',
          text: 'Aklınızdaki fikri, nasıl bir site hayal ettiğinizi konuşur, sizin için en doğru yol haritasını çıkarırız.',
          deliverables: ['Yazılı teklif', 'İş takvimi', 'Kapsam dışı kalemler'],
        },
        {
          _key: 's2',
          title: 'Birlikte şekillendirelim',
          text: 'Tasarımı ve sayfaları hazırlarken sürekli iletişimde kalır, adımları sizin onayınızla ilerletiriz.',
          deliverables: ['Canlı önizleme bağlantısı', 'Düzenli ilerleme notları', 'Hız ve erişilebilirlik kontrolü'],
        },
        {
          _key: 's3',
          title: 'Yayına alalım ve devredelim',
          text: 'Sitenizi açtıktan sonra paneli nasıl kullanacağınızı gösteririz. Sonrasında aklınıza takılan her şey için yine buradayız.',
          deliverables: ['Yayın kontrol listesi', 'Yönetim eğitimi', 'Kullanım kılavuzu'],
        },
      ],
    },
    stats: {
      items: [
        { _key: 'reply', value: 24, suffix: 'sa', label: 'İlk yanıt süremiz' },
        { _key: 'lighthouse', value: 100, label: 'Hedeflediğimiz Lighthouse puanı' },
        { _key: 'phases', value: 3, label: 'Aşamalı, yazılı süreç' },
        { _key: 'contact', value: 1, label: 'Baştan sona tek muhatap' },
      ],
    },
    closing: {
      title: 'Aklınızda bir proje mi var? Gelin, birlikte bakalım.',
      text: 'İster yeni bir web sitesi fikri, ister mevcut sitenizle ilgili bir destek ihtiyacı. Bize kısaca yazın, size nasıl yardımcı olabileceğimize birlikte karar verelim.',
      image: img('laptop-dark-desk', 'Koyu ahşap masada açık duran dizüstü bilgisayar ve beyaz bir sandalye'),
      tag: 'Yeni projelere açığız',
      cta: { label: 'İletişime geçin', href: '/iletisim' },
    },
  },
  {
    _id: 'homePage-en',
    _type: 'homePage',
    language: 'en',
    translationKey: 'homePage',
    seo: {},
    hero: {
      title: "Let's build your project together",
      note: "Let's talk about what you need and build a solution that's easy to run.",
      image: img('hero-desk', 'A laptop with a code editor open on a bright desk, next to a mug and a desk lamp'),
      smallImage: img('hands-typing', 'Hands typing on a laptop keyboard'),
      tags: ['WordPress', 'Shopify', 'AI-assisted development', 'Tech support', 'Maintenance'],
    },
    tools: { title: 'Platforms and tools we work with', items: tools },
    intro: {
      title: 'First, we listen',
      text: 'Every business and every brand expects something different. Instead of off-the-shelf templates, we talk about exactly what you want to do and plan the route that best fits your budget and goals.',
      cta: { label: 'Explore services', href: '/en/services' },
    },
    duo: {
      first: img('planning-laptop', 'A hand writing planning notes on paper next to a laptop'),
      second: img('laptop-top-view', 'Top view of a laptop, a coffee cup and pencils on a wooden desk'),
      firstTag: 'Plan first',
      secondTag: 'Then build',
      link: { label: 'See our process', href: '#process' },
    },
    approach: {
      title: 'Fewer surprises, more clarity',
      image: img('checklist-notebook', 'A hand ticking off items on a checklist in a notebook'),
      tag: 'Checklist-driven',
      items: [
        {
          _key: 'root-cause',
          icon: 'wrench',
          title: 'Practical, sensible fixes for the problems you run into',
          text: 'Something going wrong on your site, a slowdown, or a new idea on your mind? We look at it together and take the steps that make your work easier, without adding complexity.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'Still by your side after launch',
          text: "We don't hand over and disappear. We show you how to update your pages and products with ease, and we stay a partner you can ask whenever a question comes up.",
        },
      ],
      cta: { label: "Let's talk", href: '/en/contact' },
    },
    servicesSection: {
      title: 'Services',
      text: "Every project needs something different. We go with whatever is simplest and makes the most sense for you.",
    },
    process: {
      title: 'How we work',
      text: 'Three phases, all in writing. At the end of each one you see what is done, and we move on together.',
      steps: [
        {
          _key: 's1',
          title: "Let's meet and define the need",
          text: 'We talk about your idea and the kind of site you have in mind, then map out the right route for you.',
          deliverables: ['Written proposal', 'Timeline', 'Out-of-scope list'],
        },
        {
          _key: 's2',
          title: "Let's shape it together",
          text: 'While we design and build the pages, we stay in close touch and move each step forward with your approval.',
          deliverables: ['Live preview link', 'Regular progress notes', 'Speed and accessibility check'],
        },
        {
          _key: 's3',
          title: "Let's launch and hand it over",
          text: "Once the site is live, we show you how to use the admin panel. After that, we're still here for anything on your mind.",
          deliverables: ['Launch checklist', 'Admin training', 'User guide'],
        },
      ],
    },
    stats: {
      items: [
        { _key: 'reply', value: 24, suffix: 'h', label: 'Our first-reply time' },
        { _key: 'lighthouse', value: 100, label: 'The Lighthouse score we aim for' },
        { _key: 'phases', value: 3, label: 'Phases, all in writing' },
        { _key: 'contact', value: 1, label: 'Point of contact, start to finish' },
      ],
    },
    closing: {
      title: 'Have a project in mind? Come, let\'s take a look together.',
      text: "Whether it's an idea for a new website or support for your current one, write to us briefly and we'll decide together how we can help.",
      image: img('laptop-dark-desk', 'An open laptop on a dark wooden desk next to a white chair'),
      tag: 'Open for new projects',
      cta: { label: 'Get in touch', href: '/en/contact' },
    },
  },
];
