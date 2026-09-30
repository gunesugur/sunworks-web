/**
 * Image registry: key → build-time import of the AUREA asset pack (src/assets/aurea/, WebP masters).
 * Astro <Picture> re-encodes them to responsive AVIF/WebP at build time (see docs/AUREA_ASSET_MAP.md for
 * slot, ratio and object-position per breakpoint). Masters were edge-trimmed (white/dark strips removed,
 * ratio preserved); results/before + after share one identical crop so they stay registered.
 */
import type { ImageMetadata } from 'astro';
import heroOperatory from '../assets/aurea/hero-operatory.webp';
import clinicDetail from '../assets/aurea/clinic-detail.webp';
import benefitsClinic from '../assets/aurea/benefits-clinic.webp';
import bookingPatient from '../assets/aurea/booking-patient.webp';
import serviceWhitening from '../assets/aurea/services/whitening.webp';
import serviceImplant from '../assets/aurea/services/implant.webp';
import serviceAligners from '../assets/aurea/services/aligners.webp';
import serviceCavity from '../assets/aurea/services/cavity.webp';
import serviceChildren from '../assets/aurea/services/children.webp';
import serviceSurgery from '../assets/aurea/services/surgery.webp';
import servicePeriodontal from '../assets/aurea/services/periodontal.webp';
import serviceSmileDesign from '../assets/aurea/services/smile-design.webp';
import journey01 from '../assets/aurea/journey/01.webp';
import journey02 from '../assets/aurea/journey/02.webp';
import journey03 from '../assets/aurea/journey/03.webp';
import journey04 from '../assets/aurea/journey/04.webp';
import journey05 from '../assets/aurea/journey/05.webp';
import doctor01 from '../assets/aurea/doctors/01.webp';
import doctor02 from '../assets/aurea/doctors/02.webp';
import doctor03 from '../assets/aurea/doctors/03.webp';
import doctor04 from '../assets/aurea/doctors/04.webp';
import resultBefore from '../assets/aurea/results/before.webp';
import resultAfter from '../assets/aurea/results/after.webp';

export const images = {
  'hero-operatory': heroOperatory, // 21:9
  'clinic-detail': clinicDetail, // 1:1
  'benefits-clinic': benefitsClinic, // 21:9
  'booking-patient': bookingPatient, // 16:9
  'service-whitening': serviceWhitening, // 1:1
  'service-implant': serviceImplant,
  'service-aligners': serviceAligners,
  'service-cavity': serviceCavity,
  'service-children': serviceChildren,
  'service-surgery': serviceSurgery,
  'service-periodontal': servicePeriodontal,
  'service-smile-design': serviceSmileDesign,
  'journey-01': journey01, // 1:1
  'journey-02': journey02,
  'journey-03': journey03,
  'journey-04': journey04,
  'journey-05': journey05,
  'doctor-01': doctor01, // 4:5
  'doctor-02': doctor02,
  'doctor-03': doctor03,
  'doctor-04': doctor04,
  'result-before': resultBefore, // 1:1, registered with result-after
  'result-after': resultAfter,
} satisfies Record<string, ImageMetadata>;

export type ImageKey = keyof typeof images;
