// Detects whether the app is running inside the Android Trusted Web Activity (TWA)
// distributed via Google Play. The TWA's startUrl is configured to "/?platform=android"
// (see twa-manifest.json), so the flag is captured on first launch and persisted so it
// survives client-side route changes that drop the query param.
const STORAGE_KEY = 'ucp_platform';

export function isAndroidTWA() {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('platform') === 'android') {
      localStorage.setItem(STORAGE_KEY, 'android');
      return true;
    }
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    if (referrer && referrer.startsWith('android-app://')) {
      localStorage.setItem(STORAGE_KEY, 'android');
      return true;
    }
    return localStorage.getItem(STORAGE_KEY) === 'android';
  } catch {
    return false;
  }
}