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
    whatsapp: '905550000000',
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
    whatsapp: '905550000000',
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
      note: 'Tasarım, kurulum ve bakım tek ekipten; muhatabınız hep aynı.',
      image: img('hero-desk', 'Aydınlık bir masada kod editörü açık bir dizüstü bilgisayar, yanında bir fincan ve masa lambası'),
      smallImage: img('hands-typing', 'Dizüstü bilgisayarın klavyesinde yazı yazan eller'),
      tags: ['WordPress', 'Shopify', 'Bakım', 'Teknik destek', 'Eğitim'],
    },
    tools: { title: 'Çalıştığımız platformlar ve araçlar', items: tools },
    intro: {
      title: 'Önce kapsam, sonra kod',
      text: 'Her işe; neyin yapılacağını, ne zaman teslim edileceğini ve neyin kapsam dışında kaldığını yazıya dökerek başlarız. Projeyi baştan sona aynı ekip yürütür, sorularınızı işi yapan kişi yanıtlar.',
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
          text: 'Tema, eklenti, önbellek ya da sunucu kaynaklı hataları belirtiye değil nedene odaklanarak ayıklarız. Gerektiğinde barındırma ve eklenti sağlayıcılarıyla yazışmayı da biz yürütürüz.',
        },
        {
          _key: 'handover',
          icon: 'book',
          title: 'Yayından sonra da yanınızdayız',
          text: 'Teslimle birlikte içerik, ürün ve sayfaları kendiniz güncelleyebilmeniz için uygulamalı bir eğitim verir, adım adım kullanım notları bırakırız.',
        },
      ],
      cta: { label: 'Proje konuşalım', href: '/iletisim' },
    },
    servicesSection: {
      title: 'Hizmetler',
      text: 'Kurumsal WordPress sitelerinden Shopify mağazalarına; kurulum, geliştirme ve sürekli bakım.',
    },
    process: {
      title: 'Nasıl çalışıyoruz',
      text: 'Üç aşamalı, şeffaf bir süreç. Her aşamanın sonunda neyin tamamlandığını görür, bir sonrakine birlikte geçeriz.',
      steps: [
        {
          _key: 's1',
          title: 'Keşif ve kapsam',
          text: 'Hedeflerinizi, mevcut altyapınızı ve teknik kısıtları birlikte inceleriz. Kapsamı, takvimi ve bütçeyi tek belgede toplayan yazılı bir teklif hazırlarız.',
          deliverables: ['Yazılı teklif', 'İş takvimi', 'Kapsam dışı kalemler'],
        },
        {
          _key: 's2',
          title: 'Tasarım ve geliştirme',
          text: 'Onaylanan kapsamı bir test ortamında hayata geçiririz. İlerlemeyi çalışan bir önizleme bağlantısından takip eder, geri bildirimlerinizi aşama aşama uygularız.',
          deliverables: ['Canlı önizleme bağlantısı', 'Düzenli ilerleme notları', 'Hız ve erişilebilirlik kontrolü'],
        },
        {
          _key: 's3',
          title: 'Yayın ve devir',
          text: 'Yedek alarak siteyi yayına alır, ilk günlerde yakından izleriz. Yönetimi kısa bir eğitimle size devreder, yazılı bir kullanım kılavuzu bırakırız.',
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
      note: 'Design, build and care from one team — and one point of contact.',
      image: img('hero-desk', 'A laptop with a code editor open on a bright desk, next to a mug and a desk lamp'),
      smallImage: img('hands-typing', 'Hands typing on a laptop keyboard'),
      tags: ['WordPress', 'Shopify', 'Maintenance', 'Tech support', 'Training'],
    },
    tools: { title: 'Platforms and tools we work with', items: tools },
    intro: {
      title: 'Scope first, then code',
      text: 'Every project starts with a written brief: what will be done, when it will be delivered and what is out of scope. The same team runs it from start to finish, and the person doing the work answers your questions.',
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
          text: 'Theme, plugin, cache or server issues are traced to their cause rather than patched at the symptom. When needed, we handle the conversation with hosting and plugin vendors.',
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
      text: 'From business sites on WordPress to Shopify stores: setup, development and ongoing care.',
    },
    process: {
      title: 'How we work',
      text: 'A transparent process in three phases. At the end of each one you see what is done, and we move on together.',
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
      title: "Let's talk about your next project",
      image: img('laptop-dark-desk', 'An open laptop on a dark wooden desk next to a white chair'),
      tag: 'Open for new projects',
      cta: { label: 'Get in touch', href: '/en/contact' },
    },
  },
];
