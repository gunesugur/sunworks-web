import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { contactForm, handleForm } from '@/server/forms';
import { fail } from '@/server/http';

export const prerender = false;

export const POST: APIRoute = ({ request, locals }) =>
  handleForm(contactForm, request, env, { waitUntil: (p) => locals.cfContext?.waitUntil(p) });

export const ALL: APIRoute = () => fail(405, 'method');
