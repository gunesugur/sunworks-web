import type { APIRoute } from 'astro';
import { rssFeed } from '@/lib/rss';

export const GET: APIRoute = (ctx) => rssFeed('de', ctx.site);
