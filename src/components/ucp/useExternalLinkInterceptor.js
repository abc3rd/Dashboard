import { useEffect } from 'react';
import { isExternalUrl } from '@/components/ucp/externalLinkPolicy';

export default function useExternalLinkInterceptor(openExternalLink) {
  useEffect(() => {
    const intercept = (event) => {
      const anchor = event.target?.closest?.('a[href]');
      if (!anchor || !isExternalUrl(anchor.getAttribute('href'))) return;
      // Include modified clicks, middle clicks and the context menu: none may
      // launch an external destination before confirmation.
      if (event.type === 'auxclick' && event.button !== 1) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.type === 'dragstart') return;
      openExternalLink(anchor.getAttribute('href'), {
        purpose: 'website',
        newTab: anchor.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1,
      });
    };
    const events = ['click', 'auxclick', 'contextmenu', 'dragstart'];
    events.forEach((name) => document.addEventListener(name, intercept, true));
    return () => events.forEach((name) => document.removeEventListener(name, intercept, true));
  }, [openExternalLink]);
}