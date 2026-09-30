/**
 * Image registry: key → build-time image import. Real photography replaces the placeholder JPGs
 * in src/assets/images/ under the same file names; nothing else changes.
 */
import type { ImageMetadata } from 'astro';
import heroClinic from '../assets/images/hero-clinic.jpg';
import detailMaterial from '../assets/images/detail-material.jpg';
import clinicWide from '../assets/images/clinic-wide.jpg';
import svcWhitening from '../assets/images/svc-whitening.jpg';
import svcImplants from '../assets/images/svc-implants.jpg';
import svcAligners from '../assets/images/svc-aligners.jpg';
import svcCavity from '../assets/images/svc-cavity.jpg';
import svcChildren from '../assets/images/svc-children.jpg';
import svcSurgery from '../assets/images/svc-surgery.jpg';
import svcPerio from '../assets/images/svc-perio.jpg';
import svcSmileDesign from '../assets/images/svc-smile-design.jpg';
import journey1 from '../assets/images/journey-1.jpg';
import journey2 from '../assets/images/journey-2.jpg';
import journey3 from '../assets/images/journey-3.jpg';
import journey4 from '../assets/images/journey-4.jpg';
import journey5 from '../assets/images/journey-5.jpg';
import doctorElif from '../assets/images/doctor-elif.jpg';
import doctorEmre from '../assets/images/doctor-emre.jpg';
import doctorSelin from '../assets/images/doctor-selin.jpg';
import doctorCan from '../assets/images/doctor-can.jpg';
import resultAfter from '../assets/images/result-after.jpg';
import resultBefore from '../assets/images/result-before.jpg';
import bookingPortrait from '../assets/images/booking-portrait.jpg';

export const images = {
  'hero-clinic': heroClinic,
  'detail-material': detailMaterial,
  'clinic-wide': clinicWide,
  'svc-whitening': svcWhitening,
  'svc-implants': svcImplants,
  'svc-aligners': svcAligners,
  'svc-cavity': svcCavity,
  'svc-children': svcChildren,
  'svc-surgery': svcSurgery,
  'svc-perio': svcPerio,
  'svc-smile-design': svcSmileDesign,
  'journey-1': journey1,
  'journey-2': journey2,
  'journey-3': journey3,
  'journey-4': journey4,
  'journey-5': journey5,
  'doctor-elif': doctorElif,
  'doctor-emre': doctorEmre,
  'doctor-selin': doctorSelin,
  'doctor-can': doctorCan,
  'result-after': resultAfter,
  'result-before': resultBefore,
  'booking-portrait': bookingPortrait,
} satisfies Record<string, ImageMetadata>;

export type ImageKey = keyof typeof images;
