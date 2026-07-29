# Android Build (Bubblewrap TWA)

This project is packaged for Android as a **Trusted Web Activity (TWA)** using
Google's [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap). The TWA
wraps the deployed PWA, so no native code is added to the React/Vite app.

## Why TWA (not Capacitor / Play Billing)
- The app is a Vite/React PWA; a TWA reuses the deployed site with no native bridge.
- Omega Access is sold via Base44 Payments (Wix). Google Play requires Play Billing
  for digital goods consumed in-app, and the Play Billing Library is incompatible
  with this WebView/TWA architecture. The TWA therefore offers **no in-app purchase
  flow** — the `startUrl` includes `?platform=android`, which the app detects
  (`src/lib/platform.js`) to hide the Upgrade CTAs and direct users to the website.
  Entitlement is account-based (`Subscription` entity), so a web purchase unlocks
  Omega Access in the Android app on the next sign-in.

## Prerequisites
- Node.js 18+
- JDK 17
- Android SDK (install via Android Studio, or let Bubblewrap prompt to install it)

## One-time setup
1. **Deploy the app** (Base44) and note its HTTPS URL, e.g.
   `https://app.ucprouter.com`. The site must serve `public/manifest.json` and the
   icon at the paths below.
2. **Add a 512×512 PNG launcher icon** at `public/icon-512.png` (Bubblewrap requires
   a raster icon; the SVG alone is not accepted for the Android launcher). Also add
   `public/icon-192.png` (192×192) for density buckets if desired.
3. **Edit `twa-manifest.json`** and replace every occurrence of `app.ucprouter.com`
   with your real deployed domain:
   - `host`
   - `iconUrl`
   - `maskableIconUrl`
   - `webManifestUrl`
4. **Generate the Android project** from the web manifest:
   ```bash
   npx @bubblewrap/cli init --manifest https://app.ucprouter.com/manifest.json
   ```
   Bubblewrap will ask for a package id, app name, and signing key — the values in
   `twa-manifest.json` are the intended answers. After `init`, copy this repo's
   `twa-manifest.json` over the generated one to enforce the `?platform=android`
   startUrl and package id, then apply it:
   ```bash
   npx @bubblewrap/cli updateconfig
   ```

## Build the release bundle
```bash
npx @bubblewrap/cli build
```
This produces `app-release-signed.aab` (Android App Bundle) in the generated project
folder. Upload that `.aab` to Google Play Console.

## Re-builds
Bump `appVersionCode` / `appVersionName` in `twa-manifest.json` for each release,
then re-run `npx @bubblewrap/cli updateconfig && npx @bubblewrap/cli build`.

## Digital Asset Links (verification)
For the TWA to open without a browser URL bar, the deployed site must serve
`/.well-known/assetlinks.json` listing the app's signing certificate SHA-256.
Bubblewrap prints the expected `assetlinks.json` content at the end of `build`;
host that file on the deployed domain.