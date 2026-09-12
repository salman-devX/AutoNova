const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifies a Turnstile token server-side. NEVER trust a frontend-only check —
 * this call is mandatory before accepting registration/login/booking/contact submissions.
 */
export async function verifyTurnstileToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error('TURNSTILE_SECRET_KEY is not configured. Set it in your .env file.');
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.append('remoteip', remoteIp);

  const res = await fetch(VERIFY_URL, { method: 'POST', body });
  const result = await res.json();
  return result; // { success: boolean, 'error-codes': [...] }
}
