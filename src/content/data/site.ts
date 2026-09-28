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
    tagline: 'WordPress ve Shopify odaklı butik web stüdyosu',
    email: 'hello@sunworks.studio',
    city: 'Bursa',
    socials,
    map: { ...map, label: 'Bursa, Türkiye' },
    newsletter: {
      title: 'Bülten',
      text: 'Yeni yazılarımızdan haberdar olmak için listemize katılın. Yalnızca yeni bir içerik yayımladığımızda kısa bir e-posta göndeririz.',
    },
    footerNote: 'WordPress ve Shopify için tasarım, kurulum ve bakım.',
    seo: {
      title: 'SUN | WORKS — WordPress ve Shopify web stüdyosu',
      description:
        'WordPress kurumsal site, Shopify mağaza kurulumu, teknik destek ve eğitim hizmetleri sunan butik web stüdyosu.',
    },
  },
  {
    _id: 'siteSettings-en',
    _type: 'siteSettings',
    language: 'en',
    translationKey: 'siteSettings',
    siteName: 'SUN | WORKS',
    tagline: 'A boutique web studio focused on WordPress and Shopify',
    email: 'hello@sunworks.studio',
    city: 'Bursa',
    socials,
    map: { ...map, label: 'Bursa, Türkiye' },
    newsletter: {
      title: 'Newsletter',
      text: 'Join our list to hear about new articles. We only send a short email when we publish something new.',
    },
    footerNote: 'Design, setup and maintenance for WordPress and Shopify.',
    seo: {
      title: 'SUN | WORKS — WordPress and Shopify web studio',
      description:
        'A boutique web studio offering WordPress business websites, Shopify store setup, technical support and training.',
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
          { label: 'WordPress kurumsal site', href: '/hizmetler/wordpress-kurumsal-site' },
          { label: 'Shopify mağaza kurulumu', href: '/hizmetler/shopify-magaza-kurulumu' },
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
          { label: 'WordPress websites', href: '/en/services/wordpress-business-website' },
          { label: 'Shopify store setup', href: '/en/services/shopify-store-setup' },
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

const tools = ['WordPress', 'WooCommerce', 'Shopify', 'Figma', 'cPanel', 'Plesk', 'HTML & CSS'];

export const home: HomePage[] = [
  {
    _id: 'homePage-tr',
    _type: 'homePage',
    language: 'tr',
    translationKey: 'homePage',
    seo: {},
    hero: {
      title: 'WordPress ve Shopify için butik web stüdyosu',
      note: 'Tasarım, kurulum, bakım ve eğitim tek çatı altında.',
      image: img('hero-desk', 'Aydınlık bir masada kod editörü açık bir dizüstü bilgisayar, yanında bir fincan ve masa lambası'),
      smallImage: img('hands-typing', 'Dizüstü bilgisayarın klavyesinde yazı yazan eller'),
      tags: ['WordPress', 'Shopify', 'Bakım', 'Teknik destek', 'Eğitim'],
    },
    tools: { title: 'Çalıştığımız platformlar ve araçlar', items: tools },
    intro: {
      title: 'Tek muhatap, net bir süreç',
      text: 'Projenizi başından sonuna aynı ekip yürütür. Neyin yapılacağını, neyin kapsam dışında kaldığını işe başlamadan yazılı olarak netleştiririz.',
      cta: { label: 'Hizmetlere bakın', href: '/hizmetler' },
    },
    duo: {
      first: img('planning-laptop', 'Dizüstü bilgisayarın yanında kâğıda plan notları alan bir el'),
      second: img('laptop-top-view', 'Ahşap masa üzerinde yukarıdan görünen dizüstü bilgisayar, kahve ve kalemler'),
      firstTag: 'Önce plan',
      secondTag: 'Sonra kurulum',
      link: { label: 'Nasıl çalıştığımızı görün', href: '#process' },
    },
    approach: {
      title: 'Daha az sürpriz, daha fazla netlik',
      image: img('checklist-notebook', 'Defterdeki kontrol listesine işaret koyan bir el'),
      tag: 'Kontrol listesiyle',
      items: [
        {
          _key: 'root-cause',
          icon: 'wrench',
          title: 'Sorunun kaynağına ineriz',
          text: 'Tema, eklenti, önbellek ya da özel kod kaynaklı sorunları adım adım ayıklarız; gerektiğinde sağlayıcının destek ekibiyle yazışmayı da biz üstleniriz.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'Teslimden sonra yalnız kalmazsınız',
          text: 'Yayından sonra içerik, ürün ve sayfa güncellemelerini kendiniz yapabilmeniz için kısa bir eğitim verir, yazılı notlar hazırlarız.',
        },
      ],
      cta: { label: 'Proje konuşalım', href: '/iletisim' },
    },
    servicesSection: {
      title: 'Hizmetlerimiz',
      text: 'İşletmeler ve markalar için web sitesi kurulumu, e-ticaret ve teknik destek.',
    },
    process: {
      title: 'Nasıl çalışıyoruz',
      text: 'Her proje aynı dört adımla ilerler; her adımın sonunda ne yapıldığını açıkça görürsünüz.',
      steps: [
        {
          _key: 's1',
          title: 'Tanışma',
          text: 'İhtiyacınızı, mevcut sitenizi ve bütçenizi konuşuruz. İş bize uygun değilse bunu da açıkça söyleriz.',
        },
        {
          _key: 's2',
          title: 'Kapsam ve plan',
          text: 'Yapılacak işleri, takvimi ve kapsam dışında kalanları yazılı olarak netleştiririz.',
        },
        {
          _key: 's3',
          title: 'Uygulama',
          text: 'Kurulum, ayar ve düzeltmeleri bir test kopyasında ya da yedek alarak yaparız; ilerlemeyi düzenli olarak paylaşırız.',
        },
        {
          _key: 's4',
          title: 'Teslim ve eğitim',
          text: 'Siteyi yayına alırız; kısa bir eğitimle yönetimi size devreder, yazılı notları paylaşırız.',
        },
      ],
    },
    closing: {
      title: 'Bir sonraki projenizi konuşalım',
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
      title: 'A boutique web studio for WordPress and Shopify',
      note: 'Design, setup, maintenance and training under one roof.',
      image: img('hero-desk', 'A laptop with a code editor open on a bright desk, next to a mug and a desk lamp'),
      smallImage: img('hands-typing', 'Hands typing on a laptop keyboard'),
      tags: ['WordPress', 'Shopify', 'Maintenance', 'Tech support', 'Training'],
    },
    tools: { title: 'Platforms and tools we work with', items: tools },
    intro: {
      title: 'One point of contact, a clear process',
      text: 'The same team runs your project from start to finish. Before any work begins, we agree in writing on what is in scope and what is not.',
      cta: { label: 'See services', href: '/en/services' },
    },
    duo: {
      first: img('planning-laptop', 'A hand writing planning notes on paper next to a laptop'),
      second: img('laptop-top-view', 'Top view of a laptop, a coffee cup and pencils on a wooden desk'),
      firstTag: 'Plan first',
      secondTag: 'Then build',
      link: { label: 'See how we work', href: '#process' },
    },
    approach: {
      title: 'Fewer surprises, more clarity',
      image: img('checklist-notebook', 'A hand ticking off items on a checklist in a notebook'),
      tag: 'Checklist-driven',
      items: [
        {
          _key: 'root-cause',
          icon: 'wrench',
          title: 'We find the root cause',
          text: 'We work through theme, plugin, cache and custom-code issues step by step, and handle the back-and-forth with vendor support teams when needed.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'You are not on your own after launch',
          text: 'After launch we run a short training session and write up notes, so you can update content, products and pages yourself.',
        },
      ],
      cta: { label: "Let's talk", href: '/en/contact' },
    },
    servicesSection: {
      title: 'Our services',
      text: 'Websites, e-commerce and technical support for businesses and brands.',
    },
    process: {
      title: 'How we work',
      text: 'Every project follows the same four steps, and you see what was done at the end of each one.',
      steps: [
        {
          _key: 's1',
          title: 'Intro call',
          text: 'We talk through your needs, your current site and your budget. If we are not the right fit, we will say so.',
        },
        {
          _key: 's2',
          title: 'Scope and plan',
          text: 'We agree in writing on the tasks, the timeline and what is out of scope.',
        },
        {
          _key: 's3',
          title: 'Build',
          text: 'Setup, configuration and fixes happen on a staging copy or after a backup, and we share progress along the way.',
        },
        {
          _key: 's4',
          title: 'Handover and training',
          text: 'We launch, walk you through managing the site in a short session and send written notes.',
        },
      ],
    },
    closing: {
      title: "Let's talk about your next project",
      image: img('laptop-dark-desk', 'An open laptop on a dark wooden desk next to a white chair'),
      tag: 'Open for new projects',
      cta: { label: 'Get in touch', href: '/en/contact' },
    },
  },
];
