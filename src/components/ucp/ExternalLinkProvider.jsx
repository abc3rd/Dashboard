import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import ExternalLinkModal from '@/components/ucp/ExternalLinkModal';
import useExternalLinkInterceptor from '@/components/ucp/useExternalLinkInterceptor';
import { getExternalDestination, isExternalUrl } from '@/components/ucp/externalLinkPolicy';
import { isAndroidTWA } from '@/lib/platform';

const ExternalLinkContext = createContext(null);
export { isExternalUrl };

export function ExternalLinkProvider({ children }) {
  const [pending, setPending] = useState(null);
  const requestRef = useRef(null);
  const openerRef = useRef(null);
  const location = useLocation();
  const handleCancel = useCallback(() => { requestRef.current = null; setPending(null); }, []);
  useEffect(() => { handleCancel(); }, [location.key, handleCancel]);
  const openExternalLink = useCallback((value, { purpose = 'website', newTab = false } = {}) => {
    if (requestRef.current) return false; // Do not swap a destination already shown.
    try {
      const url = getExternalDestination(value, purpose);
      if (purpose === 'checkout' && isAndroidTWA()) {
        toast.error('External purchases are not available in this Android build.');
        return false;
      }
      openerRef.current = document.activeElement;
      requestRef.current = Object.freeze({ url, purpose, newTab });
      setPending(requestRef.current);
      return true;
    } catch (error) { toast.error(error.message); return false; }
  }, []);
  const handleConfirm = useCallback(() => {
    const request = requestRef.current;
    if (!request) return;
    handleCancel(); // Consume confirmation once, including double taps.
    // A detached anchor does not re-enter document click interception. It is
    // created only here, after confirmation, with exactly the displayed URL.
    const anchor = document.createElement('a');
    anchor.href = request.url;
    anchor.target = request.newTab ? '_blank' : '_self';
    anchor.rel = 'noopener noreferrer';
    anchor.referrerPolicy = 'no-referrer';
    anchor.click();
  }, [handleCancel]);
  useExternalLinkInterceptor(openExternalLink);
  return (
    <ExternalLinkContext.Provider value={{ openExternalLink, isExternalUrl }}>
      {children}
      <ExternalLinkModal open={!!pending} url={pending?.url} purpose={pending?.purpose} onConfirm={handleConfirm} onCancel={handleCancel} onCloseAutoFocus={(event) => { event.preventDefault(); openerRef.current?.focus(); }} />
    </ExternalLinkContext.Provider>
  );
}

export function useExternalLink() {
  const ctx = useContext(ExternalLinkContext);
  if (!ctx) throw new Error('useExternalLink must be used within ExternalLinkProvider');
  return ctx;
}