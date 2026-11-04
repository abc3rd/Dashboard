// Reject app identity/authentication data rather than stripping parameters and
// silently changing signed checkout links or payment attribution.
const PRIVATE_KEY = /^(?:(?:user|customer|account|device)(?:id|name|email)|uid|email|emailaddress|firstname|lastname|fullname|phone|phonenumber|address|dob|password|secret|authorization|auth|accesstoken|refreshtoken|idtoken|authtoken|bearertoken|token|jwt|session|sid|sessionid|sessionidentifier|sessionkey|sessiontoken|appsessionid|appuserid)$/i;
const PRIVATE_VALUE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|\bBearer\s+/i;
const CHECKOUT_KEYS = new Set(['checkoutid', 'checkoutsessionid', 'checkouttoken', 'externaltransactiontoken']);
const PRIVACY_ERROR = 'This link contains personal or sign-in information and was blocked. Use a clean website address or contact support.';

export function isExternalUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value, window.location.origin);
    return url.origin !== window.location.origin || !['https:', 'http:'].includes(url.protocol);
  } catch {
    return true; // Malformed destinations must not bypass the interceptor.
  }
}

export function getExternalDestination(value, purpose = 'website') {
  if (typeof value !== 'string' || !value.trim()) throw new Error('This link has no valid destination.');
  const url = new URL(value.trim(), window.location.origin);
  if (['mailto:', 'tel:', 'sms:'].includes(url.protocol)) {
    if (url.search || url.hash) throw new Error('For your privacy, personal messages cannot be sent in link parameters. Use the contact form to copy your message instead.');
    return url.href;
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('This link was blocked. External websites must use HTTPS without embedded credentials.');
  }
  let decoded = url.href;
  for (let pass = 0; pass < 3; pass++) {
    let next;
    try { next = decodeURIComponent(decoded); } catch { break; }
    decoded = next;
    if (PRIVATE_VALUE.test(decoded)) throw new Error(PRIVACY_ERROR);
    // Inspect query, fragment and encoded/nested query parameters as well.
    for (const match of decoded.matchAll(/(?:[?&#;])([^=?&#;]+)=/g)) {
      const key = match[1].replace(/[^a-z0-9]/gi, '');
      const parameterValue = decoded.slice(match.index + match[0].length).split(/[?&#;]/, 1)[0];
      if (PRIVATE_KEY.test(key)) throw new Error(PRIVACY_ERROR);
      if (CHECKOUT_KEYS.has(key.toLowerCase())) {
        // Provider-issued opaque checkout/attribution handles are not app auth
        // tokens. Permit them only for the server-created checkout flow.
        if (purpose !== 'checkout' || !/^[A-Za-z0-9._~+\/=\-]{16,2048}$/.test(parameterValue)) {
          throw new Error(PRIVACY_ERROR);
        }
      }
    }
  }
  // Preserve the complete approved URL. Never append the app's current query,
  // user ID, auth token or session to an outgoing destination.
  return url.href;
}