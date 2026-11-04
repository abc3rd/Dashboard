import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ExternalLinkWarningDialog from './ExternalLinkWarningDialog';

const ExternalLinkContext = createContext(null);

// A URL counts as "external" (leaving the app) if it targets a different origin
// or opens another app via a scheme like mailto:/tel:/sms:.
export function isExternalUrl(url) {
  if (!url) return false;
  const trimmed = url.trim();
  if (/^(mailto:|tel:|sms:)/i.test(trimmed)) return true;
  try {
    const u = new URL(trimmed, window.location.origin);
    return u.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function ExternalLinkProvider({ children }) {
  const [pending, setPending] = useState(null);

  // Programmatic entry point: show the disclosure dialog for an external URL.
  const openExternalLink = useCallback((url) => {
    if (!url) return;
    setPending({ url });
  }, []);

  const handleConfirm = useCallback(() => {
    const url = pending?.url;
    setPending(null);
    if (url) window.location.href = url;
  }, [pending]);

  const handleCancel = useCallback(() => setPending(null), []);

  // Global delegated interceptor: any click on an <a> whose href leaves the app
  // is stopped and routed through the disclosure dialog. This covers mailto
  // anchors and external http(s) links without wiring each one by hand.
  // Internal links (react-router <Link>, same-origin paths, #hash) pass through.
  useEffect(() => {
    const handler = (e) => {
      if (e.defaultPrevented) return;
      // Allow modified/middle clicks to use native behavior (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = e.target.closest && e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!isExternalUrl(href)) return;
      e.preventDefault();
      openExternalLink(href);
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [openExternalLink]);

  return (
    <ExternalLinkContext.Provider value={{ openExternalLink, isExternalUrl }}>
      {children}
      <ExternalLinkWarningDialog
        open={!!pending}
        url={pending?.url}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ExternalLinkContext.Provider>
  );
}

export function useExternalLink() {
  const ctx = useContext(ExternalLinkContext);
  if (!ctx) {
    throw new Error('useExternalLink must be used within ExternalLinkProvider');
  }
  return ctx;
}