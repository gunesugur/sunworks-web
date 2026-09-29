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
      text: 'Yeni bir yazı yayımladığımızda kısa bir e-posta göndeririz. Başka bir şey değil.',
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
      text: 'A short email when we publish a new article. Nothing else.',
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

const tools = ['WordPress', 'Shopify', 'Figma', 'Claude', 'Cloudflare', 'Google Search Console', 'Google Analytics', 'GitHub', 'cPanel', 'Plesk'];

export const home: HomePage[] = [
  {
    _id: 'homePage-tr',
    _type: 'homePage',
    language: 'tr',
    translationKey: 'homePage',
    seo: {},
    hero: {
      title: 'Tasarımda kalmayan, çalışan web siteleri',
      note: 'Arayüzden arkasındaki sisteme kadar tasarlar, kurar ve bağlarız.',
      image: img('hero-desk', 'Aydınlık bir masada kod editörü açık bir dizüstü bilgisayar, yanında bir fincan ve masa lambası'),
      smallImage: img('hands-typing', 'Dizüstü bilgisayarın klavyesinde yazı yazan eller'),
      tags: ['WordPress', 'Shopify', 'AI destekli geliştirme', 'Teknik destek', 'Bakım'],
    },
    tools: { title: 'Çalıştığımız platformlar ve araçlar', items: tools },
    intro: {
      title: 'Her proje farklı bir sorunla başlar',
      text: 'Bu yüzden şablonla başlamayız. Önce neyin yapılacağını, ne zaman teslim edileceğini ve neyin kapsam dışında kaldığını yazıya dökeriz. Projeyi baştan sona aynı ekip yürütür. Sorularınızı işi yapan kişi yanıtlar.',
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
          title: 'Sorunu kaynağında çözeriz',
          text: 'Tema, eklenti, önbellek ya da sunucu kaynaklı hatalarda belirtiye değil nedene bakarız. Gerekirse hosting ve eklenti sağlayıcılarıyla yazışmayı da biz yürütürüz.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'Yayından sonra da buradayız',
          text: 'Teslimde kısa bir eğitim verir, adım adım notlar bırakırız. İçeriği, ürünleri ve sayfaları kendiniz güncelleyebilirsiniz.',
        },
      ],
      cta: { label: 'Proje konuşalım', href: '/iletisim' },
    },
    servicesSection: {
      title: 'Hizmetler',
      text: 'Bir platform işi iyi yapıyorsa onu kullanırız. Yetmediği yerde geliştiririz.',
    },
    process: {
      title: 'Nasıl çalışıyoruz',
      text: 'Üç aşama, hepsi yazılı. Her aşamanın sonunda neyin bittiğini görür, bir sonrakine birlikte geçeriz.',
      steps: [
        {
          _key: 's1',
          title: 'Keşif ve kapsam',
          text: 'Hedefinizi, mevcut altyapınızı ve teknik kısıtları birlikte inceleriz. Kapsamı, takvimi ve bütçeyi tek bir yazılı teklifte toplarız.',
          deliverables: ['Yazılı teklif', 'İş takvimi', 'Kapsam dışı kalemler'],
        },
        {
          _key: 's2',
          title: 'Tasarım ve geliştirme',
          text: 'Onaylanan kapsamı bir test ortamında kurarız. İlerlemeyi çalışan bir önizleme bağlantısından izler, geri bildirimlerinizi aşama aşama uygularız.',
          deliverables: ['Canlı önizleme bağlantısı', 'Düzenli ilerleme notları', 'Hız ve erişilebilirlik kontrolü'],
        },
        {
          _key: 's3',
          title: 'Yayın ve devir',
          text: 'Yedek alıp siteyi yayına alırız, ilk günlerde yakından izleriz. Yönetimi kısa bir eğitimle size devreder, yazılı bir kılavuz bırakırız.',
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
      title: 'Bir projeniz mi var? Konuşalım.',
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
      title: 'Websites that work beyond the mockup',
      note: 'We design, build and connect everything from the interface to the system behind it.',
      image: img('hero-desk', 'A laptop with a code editor open on a bright desk, next to a mug and a desk lamp'),
      smallImage: img('hands-typing', 'Hands typing on a laptop keyboard'),
      tags: ['WordPress', 'Shopify', 'AI-assisted development', 'Tech support', 'Maintenance'],
    },
    tools: { title: 'Platforms and tools we work with', items: tools },
    intro: {
      title: 'Every project starts with a different problem',
      text: "So we don't begin with a template. First we write down what will be done, when it will be delivered and what is out of scope. The same team runs the project from start to finish, and the person doing the work answers your questions.",
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
          title: 'We fix problems at the source',
          text: 'With theme, plugin, cache or server issues, we look for the cause, not the symptom. When needed, we handle the conversation with hosting and plugin vendors.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'Still here after launch',
          text: 'At handover we run a hands-on training session and leave step-by-step notes, so you can update content, products and pages yourself.',
        },
      ],
      cta: { label: "Let's talk", href: '/en/contact' },
    },
    servicesSection: {
      title: 'Services',
      text: 'If an existing platform does the job well, we use it. Where it falls short, we build.',
    },
    process: {
      title: 'How we work',
      text: 'Three phases, all in writing. At the end of each one you see what is done, and we move on together.',
      steps: [
        {
          _key: 's1',
          title: 'Discovery and scope',
          text: 'We review your goals, current setup and technical constraints together, then write a proposal that puts scope, timeline and budget in a single document.',
          deliverables: ['Written proposal', 'Timeline', 'Out-of-scope list'],
        },
        {
          _key: 's2',
          title: 'Design and build',
          text: 'The agreed scope is built on a staging environment. You follow progress on a working preview link, and we apply your feedback phase by phase.',
          deliverables: ['Live preview link', 'Regular progress notes', 'Speed and accessibility check'],
        },
        {
          _key: 's3',
          title: 'Launch and handover',
          text: 'We take a backup, launch the site and watch it closely in the first days. A short training session hands management over to you, along with a written guide.',
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
      title: "Working on something? Let's talk.",
      image: img('laptop-dark-desk', 'An open laptop on a dark wooden desk next to a white chair'),
      tag: 'Open for new projects',
      cta: { label: 'Get in touch', href: '/en/contact' },
    },
  },
];
