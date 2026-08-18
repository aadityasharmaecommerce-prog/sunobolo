import { useEffect } from 'react';
import { APP } from '@/constants';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Lightweight SEO helper: sets title, description, Open Graph and canonical.
 * `slug` becomes the canonical path (e.g. "/spoken-english").
 */
export function usePageMeta(title: string, description?: string, slug?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
    }
    setMeta('property', 'og:title', title);
    if (slug) {
      setCanonical(`${APP.baseUrl}/${slug.replace(/^\//, '')}`);
    }
  }, [title, description, slug]);
}
