// Detects whether the app is running inside the Android Trusted Web Activity (TWA)
// distributed via Google Play. The TWA's startUrl is configured to "/?platform=android"
// (see twa-manifest.json), so the flag is captured on first launch and persisted so it
// survives client-side route changes that drop the query param.
const STORAGE_KEY = 'ucp_platform';

function remember() {
  try {
    localStorage.setItem(STORAGE_KEY, 'android');
  } catch {
    // storage unavailable — detection still returns true for this session
  }
}

export function isAndroidTWA() {
  if (typeof window === 'undefined') return false;
  try {
    // 1. Explicit signal from the TWA startUrl (/?platform=android).
    const params = new URLSearchParams(window.location.search);
    if (params.get('platform') === 'android') {
      remember();
      return true;
    }

    // 2. Android app referrer, present on the shell's first navigation.
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    if (referrer && referrer.startsWith('android-app://')) {
      remember();
      return true;
    }

    // 3. Installed Android app shell (Trusted Web Activity / WebAPK): it runs in an
    //    app display mode, so the browser chrome is gone. This catches launches where
    //    the ?platform param and the referrer were lost to a redirect.
    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isAppShell =
      (typeof window.matchMedia === 'function' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          window.matchMedia('(display-mode: fullscreen)').matches)) ||
      window.navigator.standalone === true;
    if (isAndroid && isAppShell) {
      remember();
      return true;
    }

    // 4. Previously detected on this device.
    return localStorage.getItem(STORAGE_KEY) === 'android';
  } catch {
    return false;
  }
}