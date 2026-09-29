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
      title: 'Her proje farklı bir ihtiyaçla başlar',
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
      title: 'Süreç',
      text: 'Fikirden yayına kadar her adımı birlikte atalım. Nerede olduğumuzu her zaman bilin.',
      steps: [
        {
          _key: 's1',
          title: 'Tanışalım ve ihtiyacı belirleyelim',
          text: 'Aklınızdaki fikri, nasıl bir site hayal ettiğinizi konuşalım, sizin için en doğru yol haritasını birlikte çıkaralım.',
          deliverables: ['Yazılı teklif', 'İş takvimi', 'Kapsam dışı kalemler'],
        },
        {
          _key: 's2',
          title: 'Birlikte şekillendirelim',
          text: 'Tasarımı ve sayfaları hazırlarken sürekli iletişimde kalalım, her adımı sizin onayınızla ilerletelim.',
          deliverables: ['Canlı önizleme bağlantısı', 'Düzenli ilerleme notları', 'Hız ve erişilebilirlik kontrolü'],
        },
        {
          _key: 's3',
          title: 'Yayına alalım ve devredelim',
          text: 'Sitenizi açalım, paneli nasıl kullanacağınızı birlikte görelim. Sonrasında aklınıza takılan her şey için yine buradayız.',
          deliverables: ['Yayın kontrol listesi', 'Panel tanıtımı', 'Yayın sonrası destek'],
        },
      ],
    },
    highlight: {
      value: 24,
      suffix: 'sa',
      title: 'Mesajınıza aynı gün dönelim',
      text: 'Yazdığınızda karşınıza bir form cevabı değil, işi yapacak kişi çıksın. İlk yanıtı 24 saat içinde verelim, gerisini birlikte planlayalım.',
      items: [
        { _key: 'h1', icon: 'user', title: 'Tek muhatap', text: 'Baştan sona aynı kişiyle konuşun.' },
        { _key: 'h2', icon: 'key', title: 'Hesaplar sizde', text: 'Alan adı ve hosting sizin adınıza açılsın.' },
        { _key: 'h3', icon: 'refresh', title: 'Önce yedek', text: 'Her güncellemeden önce yedek alalım.' },
        { _key: 'h4', icon: 'gauge', title: 'Hızlı sayfalar', text: 'Lighthouse puanında 90 ve üzerini hedefleyelim.' },
        { _key: 'h5', icon: 'phone', title: 'Önce telefon', text: 'Her sayfa önce telefonda düzgün çalışsın.' },
        { _key: 'h6', icon: 'eye', title: 'Canlı önizleme', text: 'İlerlemeyi her an kendi gözünüzle görün.' },
        { _key: 'h7', icon: 'search', title: 'Temel SEO', text: 'Google sitenizi ilk günden doğru okusun.' },
        { _key: 'h8', icon: 'chat', title: 'Yayından sonra da', text: 'Sorularınız için hep buradayız.' },
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
      title: 'Every project starts with a different need',
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
      title: 'Process',
      text: "Let's take every step together, from idea to launch. You always know where things stand.",
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
          deliverables: ['Launch checklist', 'Admin walkthrough', 'Support after launch'],
        },
      ],
    },
    highlight: {
      value: 24,
      suffix: 'h',
      title: "We'll get back to you the same day",
      text: "When you write, you hear from the person who will do the work, not a form reply. We reply within 24 hours and plan the rest together.",
      items: [
        { _key: 'h1', icon: 'user', title: 'One point of contact', text: 'Talk to the same person from start to finish.' },
        { _key: 'h2', icon: 'key', title: 'Accounts stay yours', text: 'Domain and hosting are opened in your name.' },
        { _key: 'h3', icon: 'refresh', title: 'Backup first', text: 'A backup before every update.' },
        { _key: 'h4', icon: 'gauge', title: 'Fast pages', text: 'We aim for a Lighthouse score of 90 and above.' },
        { _key: 'h5', icon: 'phone', title: 'Phone first', text: 'Every page works properly on a phone first.' },
        { _key: 'h6', icon: 'eye', title: 'Live preview', text: 'See progress with your own eyes, any time.' },
        { _key: 'h7', icon: 'search', title: 'SEO basics', text: 'Google reads your site correctly from day one.' },
        { _key: 'h8', icon: 'chat', title: 'After launch too', text: "We're here whenever a question comes up." },
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
