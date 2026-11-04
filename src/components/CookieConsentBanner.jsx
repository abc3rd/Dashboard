import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'dd_cookie_consent';
const CATEGORIES = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'];

// Push a Consent Mode v2 command. Uses the real gtag if a tag loaded, otherwise
// pushes to dataLayer so a later-loaded tag still picks up the consent signal.
function consent(command, values) {
  window.dataLayer = window.dataLayer || [];
  (window.gtag || function () { window.dataLayer.push(arguments); })('consent', command, values);
}

const ALL_DENIED = Object.fromEntries(CATEGORIES.map((k) => [k, 'denied']));

function readChoice() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function writeChoice(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* ignore */ }
}

// Reopen the banner from the footer "Cookie Settings" link.
export function openCookieSettings() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event('dd-open-cookie-settings'));
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    consent('default', { ...ALL_DENIED, wait_for_update: 500 });
    const saved = readChoice();
    if (saved === 'granted') {
      consent('update', Object.fromEntries(CATEGORIES.map((k) => [k, 'granted'])));
    } else if (saved === 'denied') {
      consent('update', ALL_DENIED);
    } else {
      setVisible(true);
    }
    const handler = () => setVisible(true);
    window.addEventListener('dd-open-cookie-settings', handler);
    return () => window.removeEventListener('dd-open-cookie-settings', handler);
  }, []);

  const decide = (value) => {
    writeChoice(value);
    setVisible(false);
    consent('update', Object.fromEntries(CATEGORIES.map((k) => [k, value === 'granted' ? 'granted' : 'denied'])));
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="hidden sm:flex w-10 h-10 rounded-lg bg-brand/10 items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-brand" />
          </div>
          <p className="text-sm text-muted-foreground">
            We use local storage to keep you signed in and operate the Service. With your
            consent, we also use analytics storage to improve reliability. See our{' '}
            <a href="/PrivacyPolicy" className="text-brand hover:underline">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            className="min-h-[44px] flex-1 sm:flex-none"
            onClick={() => decide('denied')}
          >
            Decline
          </Button>
          <Button
            className="min-h-[44px] flex-1 sm:flex-none bg-brand hover:bg-brand-dark"
            onClick={() => decide('granted')}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}