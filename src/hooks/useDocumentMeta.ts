import { useEffect } from 'react';

export interface DocumentMetaOptions {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  noindex?: boolean;
}

export function useDocumentMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  noindex,
}: DocumentMetaOptions): void {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : null;

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    let ogTitleMeta = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle || title) {
      if (!ogTitleMeta) {
        ogTitleMeta = document.createElement('meta');
        ogTitleMeta.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleMeta);
      }
      ogTitleMeta.setAttribute('content', ogTitle || title);
    }

    let ogDescMeta = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDescription || description) {
      if (!ogDescMeta) {
        ogDescMeta = document.createElement('meta');
        ogDescMeta.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescMeta);
      }
      ogDescMeta.setAttribute('content', ogDescription || description || '');
    }

    let robotsMeta: HTMLMetaElement | null = null;
    if (noindex) {
      robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    }

    return () => {
      document.title = prevTitle;
      if (prevDesc && metaDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
      if (noindex && robotsMeta && robotsMeta.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta);
      }
    };
  }, [title, description, ogTitle, ogDescription, noindex]);
}
