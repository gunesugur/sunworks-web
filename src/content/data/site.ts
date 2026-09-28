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
    tagline: 'WordPress ve Shopify için küçük, tek kişilik bir web stüdyosu',
    email: 'hello@sunworks.studio',
    city: 'Bursa',
    socials,
    map: { ...map, label: 'Bursa, Türkiye' },
    newsletter: {
      title: 'Bülten',
      text: 'Yeni yazılar için listeye yazılın. Gönderimlere henüz başlamadım; başladığımda yalnızca yeni yazıları duyuran kısa e-postalar gelecek.',
    },
    footerNote: "Bursa'dan, Ocak 2026'dan beri serbest çalışıyorum.",
    seo: {
      title: 'SUN | WORKS — WordPress ve Shopify web stüdyosu, Bursa',
      description:
        'WordPress kurumsal site, Shopify mağaza kurulumu, teknik destek ve eğitim. Bursa merkezli, tek kişilik küçük bir web stüdyosu.',
    },
  },
  {
    _id: 'siteSettings-en',
    _type: 'siteSettings',
    language: 'en',
    translationKey: 'siteSettings',
    siteName: 'SUN | WORKS',
    tagline: 'A small, solo-led web studio for WordPress and Shopify',
    email: 'hello@sunworks.studio',
    city: 'Bursa',
    socials,
    map: { ...map, label: 'Bursa, Türkiye' },
    newsletter: {
      title: 'Newsletter',
      text: "Join the list for new posts. I haven't started sending yet; when I do, you'll only get short emails announcing new posts.",
    },
    footerNote: 'Freelancing from Bursa since January 2026.',
    seo: {
      title: 'SUN | WORKS — WordPress and Shopify web studio, Bursa',
      description:
        'WordPress business websites, Shopify store setup, technical support and training. A small, solo-led web studio based in Bursa, Türkiye.',
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
          { label: 'Bursa, Türkiye', href: '/iletisim' },
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
          { label: 'Bursa, Türkiye', href: '/en/contact' },
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
      title: 'WordPress ve Shopify için özenli web işçiliği',
      note: "Bursa'dan, 2026'dan beri bağımsız çalışıyorum.",
      image: img('hero-desk', 'Aydınlık bir masada kod editörü açık bir dizüstü bilgisayar, yanında bir fincan ve masa lambası'),
      smallImage: img('hands-typing', 'Dizüstü bilgisayarın klavyesinde yazı yazan eller'),
      tags: ['WordPress', 'Shopify', 'Bakım', 'Teknik destek', 'Eğitim'],
    },
    tools: { title: 'Birlikte çalıştığım platformlar ve araçlar', items: tools },
    intro: {
      title: 'Tek muhatap, açık bir süreç',
      text: 'Kurulumdan teslim sonrası eğitime kadar işi baştan sona aynı kişiyle yürütürsünüz. Neyin yapılacağını, neyin kapsam dışında kaldığını en başta birlikte netleştiririz.',
      cta: { label: 'Hizmetlere bakın', href: '/hizmetler' },
    },
    duo: {
      first: img('planning-laptop', 'Dizüstü bilgisayarın yanında kâğıda plan notları alan bir el'),
      second: img('laptop-top-view', 'Ahşap masa üzerinde yukarıdan görünen dizüstü bilgisayar, kahve ve kalemler'),
      firstTag: 'Önce plan',
      secondTag: 'Sonra kurulum',
      link: { label: 'Nasıl çalıştığımı görün', href: '#process' },
    },
    approach: {
      title: 'Daha az sürpriz, daha fazla netlik',
      image: img('checklist-notebook', 'Defterdeki kontrol listesine işaret koyan bir el'),
      tag: 'Kontrol listesiyle',
      items: [
        {
          _key: 'root-cause',
          icon: 'wrench',
          title: 'Sorunun kaynağına inerim',
          text: 'Tema, eklenti, önbellek ya da özel kod kaynaklı sorunları adım adım ayıklarım; gerektiğinde sağlayıcının destek ekibiyle yazışmayı da üstlenirim.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'Teslimden sonra yalnız kalmazsınız',
          text: 'Yayından sonra içerik, ürün ve sayfa güncellemelerini kendiniz yapabilmeniz için kısa bir eğitim verir, yazılı notlar hazırlarım.',
        },
      ],
      cta: { label: 'Proje konuşalım', href: '/iletisim' },
    },
    servicesSection: {
      title: 'Neler yapıyorum',
      text: 'Küçük işletmeler ve bireysel girişimler için, gerçekten yaptığım ve deneyimim olan işler.',
    },
    process: {
      title: 'Nasıl çalışıyorum',
      text: 'Her proje aynı dört adımla ilerler; her adımın sonunda ne yapıldığını açıkça görürsünüz.',
      steps: [
        {
          _key: 's1',
          title: 'Tanışma',
          text: 'İhtiyacı, mevcut siteyi ve bütçeyi konuşuruz. İş bana uygun değilse bunu da açıkça söylerim.',
        },
        {
          _key: 's2',
          title: 'Kapsam ve plan',
          text: 'Yapılacak işleri, takvimi ve kapsam dışında kalanları yazılı olarak netleştiririz.',
        },
        {
          _key: 's3',
          title: 'Uygulama',
          text: 'Kurulum, ayar ve düzeltmeleri bir test kopyasında ya da yedek alarak yaparım; ilerlemeyi sizinle paylaşırım.',
        },
        {
          _key: 's4',
          title: 'Teslim ve eğitim',
          text: 'Siteyi yayına alırız; kısa bir eğitimle yönetimi size devreder, notları paylaşırım.',
        },
      ],
    },
    closing: {
      title: 'Sitenizi birlikte yoluna koyalım',
      image: img('laptop-dark-desk', 'Koyu ahşap masada açık duran dizüstü bilgisayar ve beyaz bir sandalye'),
      tag: 'Bursa · uzaktan',
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
      title: 'Careful web work for WordPress and Shopify',
      note: 'Working independently from Bursa since 2026.',
      image: img('hero-desk', 'A laptop with a code editor open on a bright desk, next to a mug and a desk lamp'),
      smallImage: img('hands-typing', 'Hands typing on a laptop keyboard'),
      tags: ['WordPress', 'Shopify', 'Maintenance', 'Tech support', 'Training'],
    },
    tools: { title: 'Platforms and tools I work with', items: tools },
    intro: {
      title: 'One point of contact, a clear process',
      text: 'From setup to post-launch training, you work with the same person throughout. We agree up front on what is in scope and what is not.',
      cta: { label: 'See services', href: '/en/services' },
    },
    duo: {
      first: img('planning-laptop', 'A hand writing planning notes on paper next to a laptop'),
      second: img('laptop-top-view', 'Top view of a laptop, a coffee cup and pencils on a wooden desk'),
      firstTag: 'Plan first',
      secondTag: 'Then build',
      link: { label: 'See how I work', href: '#process' },
    },
    approach: {
      title: 'Fewer surprises, more clarity',
      image: img('checklist-notebook', 'A hand ticking off items on a checklist in a notebook'),
      tag: 'Checklist-driven',
      items: [
        {
          _key: 'root-cause',
          icon: 'wrench',
          title: 'I look for the root cause',
          text: 'I work through theme, plugin, cache and custom-code issues step by step, and handle the back-and-forth with vendor support teams when needed.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'You are not left alone after launch',
          text: 'After launch I run a short training session and write up notes, so you can update content, products and pages yourself.',
        },
      ],
      cta: { label: "Let's talk", href: '/en/contact' },
    },
    servicesSection: {
      title: 'What I do',
      text: 'Practical web work for small businesses and independent projects — only things I actually do and have experience with.',
    },
    process: {
      title: 'How I work',
      text: 'Every project follows the same four steps, and you see what was done at the end of each one.',
      steps: [
        {
          _key: 's1',
          title: 'Intro call',
          text: 'We talk through your needs, your current site and your budget. If I am not the right fit, I will say so.',
        },
        {
          _key: 's2',
          title: 'Scope and plan',
          text: 'We agree in writing on the tasks, the timeline and what is out of scope.',
        },
        {
          _key: 's3',
          title: 'Build',
          text: 'Setup, configuration and fixes happen on a staging copy or after a backup, and I share progress along the way.',
        },
        {
          _key: 's4',
          title: 'Handover and training',
          text: 'We launch, I walk you through managing the site in a short session and send you written notes.',
        },
      ],
    },
    closing: {
      title: "Let's get your site in shape together",
      image: img('laptop-dark-desk', 'An open laptop on a dark wooden desk next to a white chair'),
      tag: 'Bursa · remote',
      cta: { label: 'Get in touch', href: '/en/contact' },
    },
  },
];
