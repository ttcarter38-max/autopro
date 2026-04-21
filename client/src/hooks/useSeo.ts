import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

const DEFAULTS = {
  siteName: 'AutoPro',
  description:
    'AutoPro is a curated, invitation-only marketplace and escrow service for cars, RVs, boats, motorcycles, and tractors. Verified listings. Inspection-backed. Funds held safe until delivery.',
  image: '/og-default.jpg',
};

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  if (!value) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSeo({ title, description, image, url, type = 'website' }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes(DEFAULTS.siteName)
      ? title
      : `${title} | ${DEFAULTS.siteName}`;
    const desc = description || DEFAULTS.description;
    const absoluteUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const absoluteImage =
      image && image.startsWith('http')
        ? image
        : typeof window !== 'undefined'
        ? window.location.origin + (image || DEFAULTS.image)
        : image || DEFAULTS.image;

    document.title = fullTitle;

    setMeta('name', 'description', desc);
    setMeta('property', 'og:site_name', DEFAULTS.siteName);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', absoluteImage);
    if (absoluteUrl) setMeta('property', 'og:url', absoluteUrl);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', absoluteImage);

    if (absoluteUrl) setLink('canonical', absoluteUrl);
  }, [title, description, image, url, type]);
}
