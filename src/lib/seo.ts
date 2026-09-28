export interface Crumb {
  label: string;
  href: string;
}

export function breadcrumbLd(site: URL, crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: new URL(c.href, site).href,
    })),
  };
}
