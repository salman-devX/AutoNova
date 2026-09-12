import { Resend } from 'resend';

let client = null;

export function getResendClient() {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured. Set it in your .env file.');
    }
    client = new Resend(apiKey);
  }
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || 'AutoHubX <notifications@autohubx.app>';
