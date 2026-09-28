/**
 * Minimal Sanity GROQ client (no SDK): runs at build time only.
 * Enabled when SANITY_PROJECT_ID is set; otherwise the local typed content is used.
 */
const API_VERSION = 'v2025-02-19';

export interface SanityConfig {
  projectId: string;
  dataset: string;
}

export function sanityConfig(): SanityConfig | null {
  // CONTENT_SOURCE=local forces the bundled seed content (used by CI for deterministic tests).
  if (import.meta.env['CONTENT_SOURCE'] === 'local') return null;
  const projectId = import.meta.env['SANITY_PROJECT_ID'] as string | undefined;
  if (!projectId) return null;
  if (!/^[a-z0-9]+$/.test(projectId)) throw new Error('Invalid SANITY_PROJECT_ID');
  const dataset = (import.meta.env['SANITY_DATASET'] as string | undefined) ?? 'production';
  return { projectId, dataset };
}

export async function groq(query: string, params: Record<string, string> = {}): Promise<unknown> {
  const cfg = sanityConfig();
  if (!cfg) throw new Error('Sanity is not configured');
  const url = new URL(`https://${cfg.projectId}.apicdn.sanity.io/${API_VERSION}/data/query/${cfg.dataset}`);
  url.searchParams.set('query', query);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  const json = (await res.json()) as { result?: unknown };
  return json.result;
}
