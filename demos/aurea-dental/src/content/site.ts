/**
 * AUREA Dental — single source of copy & editable values.
 * Section components only consume this module; nothing user-facing is hard-coded in markup.
 */
import type { ImageKey } from '../lib/images';

export interface NavLink {
  label: string;
  href: string;
}
export interface Stat {
  value: string;
  label: string;
  /** false = placeholder figure, must not be presented as fact until the clinic verifies it */
  verified: boolean;
}
export interface Benefit {
  index: string;
  title: string;
  copy: string;
}
export interface Service {
  id: string;
  index: string;
  name: string;
  description: string;
  image: ImageKey;
  imageAlt: string;
  cta: NavLink;
}
export interface JourneyStep {
  index: string;
  title: string;
  caption: string;
  image: ImageKey;
  imageAlt: string;
}
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image: ImageKey;
  imageAlt: string;
}
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const site = {
  name: 'AUREA Dental',
  wordmark: 'AUREA DENTAL',
  url: 'https://aurea-dental.0ugurgunes0.workers.dev',
  locale: 'en',
  meta: {
    title: 'AUREA Dental — Precision and comfort, crafted around your smile',
    description:
      'Personalized dental care in Bursa combining modern diagnostics, experienced clinicians and a calmer patient experience.',
  },
  skipLink: 'Skip to content',

  header: {
    /** desktop capsule (V3): four destinations only */
    nav: [
      { label: 'Services', href: '#services' },
      { label: 'Process', href: '#journey' },
      { label: 'Our Team', href: '#team' },
      { label: 'FAQ', href: '#faq' },
    ] satisfies readonly NavLink[],
    /** mobile menu: capsule items + the secondary destinations */
    menu: [
      { label: 'Services', href: '#services' },
      { label: 'Process', href: '#journey' },
      { label: 'Our Team', href: '#team' },
      { label: 'About', href: '#about' },
      { label: 'Technology', href: '#technology' },
      { label: 'Results', href: '#results' },
      { label: 'FAQ', href: '#faq' },
    ] satisfies readonly NavLink[],
    cta: { label: 'Book a consultation', href: '#booking' } satisfies NavLink,
    menuOpen: 'Menu',
    menuClose: 'Close',
    menuLabel: 'Site menu',
  },

  hero: {
    titleLines: ['Precision and comfort,', 'crafted around your smile.'],
    copy: 'Personalized dental care combining modern diagnostics, experienced clinicians and a calmer patient experience.',
    primary: { label: 'Book a consultation', href: '#booking' } satisfies NavLink,
    secondary: { label: 'Explore treatments', href: '#services' } satisfies NavLink,
    image: 'hero-operatory' as ImageKey,
    imageAlt: 'A calm, daylit treatment room at AUREA Dental: patient chair, overhead light and a garden view.',
  },

  statement: {
    label: '02 / The clinic',
    // semantic phrases — each one inks from --text-ink-start to --text-primary as the reader scrolls (inkPhrases)
    phrases: [
      'We combine thoughtful dentistry,',
      'modern technology',
      'and genuine care',
      'to make every visit',
      'feel clearer, calmer',
      'and more predictable.',
    ],
    image: 'clinic-detail' as ImageKey,
    imageAlt: 'Dental handpieces resting on the treatment unit, ready for the next patient.',
    // CMS-editable PLACEHOLDERS — unverified (verified: false). Do not publish as fact.
    stats: [
      { value: '4,800+', label: 'Patients treated', verified: false },
      { value: '12 yrs', label: 'Clinical experience', verified: false },
      { value: '98%', label: 'Patient satisfaction', verified: false },
    ] satisfies readonly Stat[],
  },

  benefits: {
    label: '03 / Why patients choose AUREA',
    titleLines: ['Care that feels clear', 'at every step.'],
    intro: 'Six things we hold ourselves to, on every visit.',
    image: 'benefits-clinic' as ImageKey,
    imageAlt: '',
    items: [
      {
        index: '001',
        title: 'Certified specialists',
        copy: 'Orthodontics, implantology, restorative care and oral surgery — each led by a dedicated specialist.',
      },
      {
        index: '002',
        title: 'Pain-aware care',
        copy: 'Modern anaesthesia, gentle technique and unhurried appointments keep discomfort to a minimum.',
      },
      {
        index: '003',
        title: 'Digital diagnostics',
        copy: 'Intraoral scanning and low-dose 3D imaging let us see precisely before we plan anything.',
      },
      {
        index: '004',
        title: 'Clear treatment planning',
        copy: 'A written plan with steps, timing and itemised costs before anything starts. No surprises along the way.',
      },
      {
        index: '005',
        title: 'Flexible appointments',
        copy: 'Early, late and Saturday slots, with coordinated visits for patients travelling to Bursa.',
      },
      {
        index: '006',
        title: 'Long-term aftercare',
        copy: 'Scheduled reviews, clear aftercare and a team that stays reachable long after treatment ends.',
      },
    ] satisfies readonly Benefit[],
  },

  services: {
    label: '04 / Treatments',
    titleLines: ['All your dental needs,', 'under one roof.'],
    intro:
      'From routine checkups to full smile restoration, our specialists work together through one coordinated diagnostic and treatment process.',
    items: [
      {
        id: 'whitening',
        index: '01',
        name: 'Teeth Whitening',
        description: 'Professional, enamel-safe whitening planned around your natural shade and sensitivity.',
        image: 'service-whitening',
        imageAlt: 'A single natural-looking tooth model on a warm neutral surface.',
        cta: { label: 'Ask about whitening', href: '#booking' },
      },
      {
        id: 'implants',
        index: '02',
        name: 'Dental Implants',
        description: 'Guided implant placement planned in 3D, restored with crowns matched to your smile.',
        image: 'service-implant',
        imageAlt: 'A dental implant: titanium post with a ceramic crown.',
        cta: { label: 'Ask about implants', href: '#booking' },
      },
      {
        id: 'aligners',
        index: '03',
        name: 'Braces & Aligners',
        description: 'Clear aligners and modern braces with a digital preview of your movement plan.',
        image: 'service-aligners',
        imageAlt: 'A clear aligner tray.',
        cta: { label: 'Ask about aligners', href: '#booking' },
      },
      {
        id: 'cavity',
        index: '04',
        name: 'Cavity Treatment',
        description: 'Minimally invasive fillings that preserve healthy tooth structure wherever possible.',
        image: 'service-cavity',
        imageAlt: 'A molar crown model showing the biting surface.',
        cta: { label: 'Book a check-up', href: '#booking' },
      },
      {
        id: 'children',
        index: '05',
        name: "Children's Dentistry",
        description: 'Calm, unhurried visits that help children feel at ease — and build good habits early.',
        image: 'service-children',
        imageAlt: 'A small, smooth molar model.',
        cta: { label: 'Book a family visit', href: '#booking' },
      },
      {
        id: 'surgery',
        index: '06',
        name: 'Oral Surgery',
        description: 'Extractions and surgical procedures performed with precise planning and careful aftercare.',
        image: 'service-surgery',
        imageAlt: 'An extracted tooth model with its roots.',
        cta: { label: 'Ask about oral surgery', href: '#booking' },
      },
      {
        id: 'perio',
        index: '07',
        name: 'Periodontal Care',
        description: 'Gum health assessment, deep cleaning and maintenance to protect teeth for the long term.',
        image: 'service-periodontal',
        imageAlt: 'A cross-section model of a tooth in gum and bone.',
        cta: { label: 'Book a gum assessment', href: '#booking' },
      },
      {
        id: 'smile-design',
        index: '08',
        name: 'Smile Design',
        description: 'A considered, digitally previewed plan that balances aesthetics, function and your face.',
        image: 'service-smile-design',
        imageAlt: 'A thin porcelain veneer.',
        cta: { label: 'Plan your smile', href: '#booking' },
      },
    ] satisfies readonly Service[],
  },

  journey: {
    label: '05 / Your treatment journey',
    titleLines: ['From first call', 'to confident smile.'],
    /** prefix for step numbers ("Step 01") — screen readers + the stage counter */
    stepLabel: 'Step',
    /** small label above the right-hand step list */
    listLabel: 'Steps',
    steps: [
      {
        index: '01',
        title: 'Book consultation',
        caption: 'A relaxed first conversation about your goals, history and any concerns — in person or online.',
        image: 'journey-01',
        imageAlt: 'Plaster model of a lower dental arch.',
      },
      {
        index: '02',
        title: 'Digital diagnosis',
        caption: 'Intraoral scans and 3D imaging give us an exact picture of your teeth, bite and bone.',
        image: 'journey-02',
        imageAlt: 'Dental arch model with a digital scan overlay.',
      },
      {
        index: '03',
        title: 'Treatment planning',
        caption: 'We walk you through options, timelines and costs in one clear written plan.',
        image: 'journey-03',
        imageAlt: 'Dental arch model with one tooth marked for treatment.',
      },
      {
        index: '04',
        title: 'Treatment',
        caption: 'Carefully paced appointments with the specialist best suited to each step.',
        image: 'journey-04',
        imageAlt: 'Dental arch model fitted with a clear aligner.',
      },
      {
        index: '05',
        title: 'Aftercare',
        caption: 'Follow-up reviews, maintenance guidance and a team that stays in touch.',
        image: 'journey-05',
        imageAlt: 'Finished dental arch model after treatment.',
      },
    ] satisfies readonly JourneyStep[],
  },

  doctors: {
    label: '06 / Our team',
    /** claim, upper-left on the portrait stage (3 short lines) */
    titleLines: ['AUREA is the team', 'you trust with', 'your smile.'],
    selectorLabel: 'Choose a specialist',
    /** object-position of each portrait's face (placeholders & real photos): avatar crop + mobile crop */
    focus: { elif: '50% 36%', emre: '52% 38%', selin: '47% 40%', can: '56% 36%' } as Record<string, string>,
    items: [
      {
        id: 'elif',
        name: 'Dr. Elif Kaya',
        specialty: 'Orthodontics',
        bio: 'Plans aligner and brace treatment digitally, with a focus on stable, natural-looking results.',
        image: 'doctor-01',
        imageAlt: 'Portrait of Dr. Elif Kaya in the clinic.',
      },
      {
        id: 'emre',
        name: 'Dr. Emre Arslan',
        specialty: 'Implantology',
        bio: 'Leads guided implant surgery, from 3D planning through to the final restoration.',
        image: 'doctor-02',
        imageAlt: 'Portrait of Dr. Emre Arslan in the clinic.',
      },
      {
        id: 'selin',
        name: 'Dr. Selin Aydın',
        specialty: 'Restorative Dentistry',
        bio: 'Restores function and appearance with conservative, carefully matched ceramic work.',
        image: 'doctor-03',
        imageAlt: 'Portrait of Dr. Selin Aydın in the clinic.',
      },
      {
        id: 'can',
        name: 'Dr. Can Demir',
        specialty: 'Oral Surgery',
        bio: 'Performs extractions and surgical procedures with an emphasis on comfort and recovery.',
        image: 'doctor-04',
        imageAlt: 'Portrait of Dr. Can Demir in the clinic.',
      },
    ] satisfies readonly Doctor[],
  },

  results: {
    label: '07 / Results',
    titleLines: ['Real results,', 'real people.'],
    intro: 'Every result starts with a plan you can see. Drag the divider to compare the same smile before and after treatment.',
    slider: {
      before: 'result-before' as ImageKey,
      after: 'result-after' as ImageKey,
      beforeAlt: 'Smile before treatment.',
      afterAlt: 'Smile after treatment.',
      beforeLabel: 'Before',
      afterLabel: 'After',
      ariaLabel: 'Before and after comparison',
      hint: 'Drag or use the arrow keys to compare',
      valueText: '{before}% before, {after}% after',
    },
    /**
     * PLACEHOLDER testimonial (placeholder: true) — not a real patient statement. Replace with a consented,
     * verified quote before launch; rendered with data-placeholder so QA can find it. No stars / counts / awards.
     */
    testimonial: {
      placeholder: true,
      quote: 'I stopped hiding my teeth in photos.',
      body: 'They explained every step before we started and never rushed me. Six months later I smile without thinking about it.',
      // Placeholder identity — real patient details are only published with written consent.
      patient: 'Patient, 34',
      treatment: 'Aligners & whitening',
      note: 'Name withheld for privacy.',
      label: 'Patient story',
    },
  },

  faq: {
    label: 'FAQ',
    titleLines: ['Common', 'questions.'],
    intro: 'If your question is not here, our patient coordinators are happy to help by phone or email.',
    cta: { label: 'Ask our team directly', href: '#booking' } satisfies NavLink,
    items: [
      {
        id: 'consultation',
        question: 'Is the first consultation complimentary?',
        answer:
          'Yes. Your first consultation, including an examination and a conversation about your goals, is free of charge. If imaging is needed, we explain the cost beforehand.',
      },
      {
        id: 'international',
        question: 'Do you accept international patients?',
        answer:
          'We do. A coordinator helps plan appointments around your travel dates, shares your treatment plan in English and stays in contact after you return home.',
      },
      {
        id: 'implants',
        question: 'How does the implant process work?',
        answer:
          'After a 3D scan we plan the implant position digitally. Placement is usually a single short procedure; the final crown follows once the implant has integrated, typically after two to four months.',
      },
      {
        id: 'plan',
        question: 'What is included in the treatment plan?',
        answer:
          'Each plan lists the recommended treatment, alternatives, the number of visits, expected timelines and itemised costs — in writing, before anything begins.',
      },
      {
        id: 'duration',
        question: 'How long do most procedures take?',
        answer:
          'Check-ups and cleanings take 30–45 minutes, fillings around an hour. Longer treatments are split into comfortable appointments, and we tell you in advance how long each will be.',
      },
      {
        id: 'sedation',
        question: 'Can treatment be performed under sedation?',
        answer:
          'Yes. For anxious patients or longer procedures we offer conscious sedation, administered and monitored by a qualified team. We discuss whether it suits you at consultation.',
      },
      {
        id: 'prepare',
        question: 'How should I prepare for my appointment?',
        answer:
          'Bring a list of any medication and previous dental records if you have them. Eat normally unless we advise otherwise, and arrive a few minutes early to settle in.',
      },
    ] satisfies readonly FaqItem[],
  },

  booking: {
    label: '08 / Booking',
    titleLines: ['Ready for your best smile?', 'Book a consultation.'],
    intro: 'Try the consultation form with sample details. This demo does not send requests or book appointments.',
    image: 'booking-patient' as ImageKey,
    imageAlt: 'A smiling patient resting her cheek on her hand in a bright treatment room.',
    fields: {
      name: { label: 'Name', placeholder: 'Your full name', autocomplete: 'name' },
      phone: { label: 'Phone', placeholder: '+90', autocomplete: 'tel' },
      email: { label: 'Email', placeholder: 'you@example.com', autocomplete: 'email' },
      message: { label: 'Message', placeholder: 'Anything we should know?' },
    },
    interestLegend: 'Treatment interest',
    chips: ['Consultation', 'Whitening', 'Implants', 'Aligners', 'General dentistry'],
    submit: 'Send request',
    privacy: 'Demo only. Please use sample details; nothing is sent or saved by this form.',
    success: 'The form validation worked. No details were sent and no appointment was booked.',
    successTitle: 'Demo completed.',
    again: 'Try again',
    sending: 'Sending…',
    optional: 'Optional',
    honeypot: 'Leave this field empty',
    errors: {
      summary: 'Please check the highlighted fields.',
      sending: 'Your request could not be sent. Please try again; your details are still in the form.',
      name: 'Please enter your name.',
      phone: 'Please enter a phone number we can reach you on.',
      email: 'Please enter a valid email address.',
    },
  },

  footer: {
    tagline: 'Dental care with clarity.',
    blurb: 'Specialist dentistry in Bursa: modern diagnostics, clear plans and a calmer way to be treated.',
    navTitle: 'Navigate',
    nav: [
      { label: 'About', href: '#about' },
      { label: 'Technology', href: '#technology' },
      { label: 'Services', href: '#services' },
      { label: 'Process', href: '#journey' },
      { label: 'Our Team', href: '#team' },
      { label: 'Results', href: '#results' },
      { label: 'FAQ', href: '#faq' },
    ] satisfies readonly NavLink[],
    servicesTitle: 'Treatments',
    services: [
      { label: 'Teeth whitening', href: '#services' },
      { label: 'Dental implants', href: '#services' },
      { label: 'Braces & aligners', href: '#services' },
      { label: "Children's dentistry", href: '#services' },
      { label: 'Smile design', href: '#services' },
    ] satisfies readonly NavLink[],
    socialTitle: 'Follow',
    hours: {
      title: 'Opening hours',
      rows: [
        { days: 'Mon–Fri', time: '09:00–19:00' },
        { days: 'Sat', time: '10:00–16:00' },
        { days: 'Sun', time: 'Closed' },
      ],
    },
    address: { title: 'Visit', lines: ['Nilüfer, Fethiye Mh.', 'Bursa 16140, Türkiye'] },
    contact: {
      title: 'Contact',
      phone: { label: '+90 224 000 00 00', href: 'tel:+902240000000' },
      email: { label: 'hello@aurea-dental.example', href: 'mailto:hello@aurea-dental.example' },
    },
    social: [
      { label: 'Instagram', href: 'https://instagram.com/' },
      { label: 'LinkedIn', href: 'https://linkedin.com/' },
    ] satisfies readonly NavLink[],
    legal: [
      { label: 'Privacy', href: '/privacy/' },
      { label: 'Cookies', href: '/cookies/' },
      { label: 'Legal', href: '/legal/' },
    ] satisfies readonly NavLink[],
    copyright: '© 2026 AUREA Dental Clinic',
    backToTop: 'Back to top',
  },
} as const;

export type Site = typeof site;
