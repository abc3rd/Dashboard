# Android Build (Bubblewrap TWA)

This project is packaged for Android as a **Trusted Web Activity (TWA)** using
Google's [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap). The TWA
wraps the deployed PWA, so no native code is added to the React/Vite app.

## External Content Links Program: implementation boundary

This repository contains the React/Vite website and a Bubblewrap configuration,
not a React Native, Flutter or generated Android application. There is no
`Linking.openURL()`, `url_launcher`, native BillingClient or native navigation
bridge to replace here. Native integration is possible in the Android project;
it is not provided by this web-only TWA configuration.

The website uses `ExternalLinkProvider` and `ExternalLinkModal` for confirmed
outgoing navigation, including modified and middle clicks. It shows the complete
approved destination and never forwards the current page's query or app auth
credentials. Known personal/authentication parameters are blocked rather than
silently stripped. Opaque provider checkout handles are permitted only for the
server-created checkout flow. A no-referrer policy prevents page query data from
leaking in the Referer header. Platform login and MCP OAuth redirects remain
platform-managed authentication flows, not purchase/content linkouts.

Web purchase buttons and the checkout departure modal display refund terms,
customer support and unauthorized-charge dispute instructions. Contact-form
messages are copied for the user to paste into their email app, rather than
putting personal data in a mailto query. These changes do not alter the hosted
Base44 Payments checkout page. Its merchant support/refund disclosures must also
be configured and verified at the payment provider; the checkout API used here
does not expose fields for injecting custom controls next to its payment button.

Android purchase linkouts remain disabled, including copy-link workarounds.
A custom web modal alone does **not** complete Google's program integration or
resolve a Play review. Before enabling Android purchases, the actual generated
Android project and secure reporting backend need all of the following:

- App enrollment and approval in the External Content Links Program.
- Play Billing Library 8.2.1 or higher and billing-program initialization for
  `EXTERNAL_CONTENT_LINK`.
- Google's billing-program eligibility check, limiting offers to eligible users
  in the US and its territories; fail closed on unsupported/unavailable results.
- The required external transaction token, Google's information screen and
  `launchExternalLink` flow. Launch only on the supported confirmed result.
- Secure server-side correlation of the opaque attribution token with the
  checkout. Do not substitute an app user ID, authentication token or fake token.
- Current external transaction reporting, including trials/zero-value purchases,
  and applicable service-fee requirements. Keep provider confirmation and access
  grants server-side; a browser return is not proof of payment.
- Native interception for any WebView/Intent navigation that can bypass the web
  handler. Do not expose an arbitrary JavaScript-to-native URL launcher.

No native bridge, reporting integration, approval flag or program enrollment is
simulated by the web changes. Native and hosted-checkout work remains outstanding.

Authoritative requirements:
- https://developer.android.com/google/play/billing/externalcontentlinks/integration
- https://support.google.com/googleplay/android-developer/answer/16470497

The TWA start URL includes `?platform=android` so the website can keep purchase
options unavailable in this build. Already-active account access remains usable.

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