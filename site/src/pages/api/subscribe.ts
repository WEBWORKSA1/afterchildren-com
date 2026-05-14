// /api/subscribe — server-side proxy to Beehiiv subscribe API
//
// Why a proxy instead of direct form POST:
// - Keeps the Beehiiv API key out of the client bundle
// - Returns structured JSON so the form can show inline success/error states
// - Honeypot rejection happens server-side (bots can't bypass it by disabling JS)
// - Source attribution (which page they subscribed from) gets passed as a custom field
//
// Beehiiv API reference: https://developers.beehiiv.com/docs/api/subscriptions

import type { APIRoute } from 'astro';

export const prerender = false; // This route must run server-side

const BEEHIIV_API_BASE = 'https://api.beehiiv.com/v2';

interface SubscribePayload {
  email?: string;
  source?: string;
  website?: string; // Honeypot field — should always be empty
}

interface BeehiivSubscribeResponse {
  data?: {
    id: string;
    email: string;
    status: string;
    created: number;
  };
  errors?: Array<{ status: number; code: string; title: string; detail?: string }>;
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

export const POST: APIRoute = async ({ request }) => {
  // 1. Parse the payload defensively
  let payload: SubscribePayload;
  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return json({ ok: false, message: 'Invalid request body.' }, 400);
  }

  const email = (payload.email ?? '').trim().toLowerCase();
  const source = (payload.source ?? 'unknown').slice(0, 100); // cap length
  const honeypot = (payload.website ?? '').trim();

  // 2. Honeypot check — bots fill this field, humans never see it
  // Return a fake success so the bot thinks it worked and stops retrying
  if (honeypot.length > 0) {
    return json({ ok: true, message: 'Subscribed.' });
  }

  // 3. Email validation
  if (!email || !isValidEmail(email)) {
    return json({ ok: false, message: 'Please enter a valid email address.' }, 400);
  }

  // 4. Check env vars are wired up
  const apiKey = import.meta.env.BEEHIIV_API_KEY;
  const publicationId = import.meta.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    // Don't tell the user the integration is misconfigured — they didn't do anything wrong.
    // But do log it server-side so we know to fix it.
    console.error('[subscribe] BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID missing from env');
    return json(
      { ok: false, message: 'Subscription is temporarily unavailable. Try again shortly.' },
      503,
    );
  }

  // 5. Submit to Beehiiv
  try {
    const beehiivRes = await fetch(
      `${BEEHIIV_API_BASE}/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: source,
          utm_medium: 'organic',
          utm_campaign: 'sunday-letter',
          referring_site: 'afterchildren.com',
          custom_fields: [
            { name: 'signup_source', value: source },
          ],
        }),
      },
    );

    const data = (await beehiivRes.json().catch(() => ({}))) as BeehiivSubscribeResponse;

    if (beehiivRes.ok) {
      return json({ ok: true, message: 'Subscribed.' });
    }

    // Beehiiv returns 4xx for already-subscribed and other recoverable cases.
    // Treat "already subscribed" as a soft success — the user gets a friendly message
    // instead of an alarming error.
    const errCode = data.errors?.[0]?.code ?? '';
    const errTitle = data.errors?.[0]?.title ?? '';
    const alreadySubscribed =
      errCode === 'subscription_already_exists' ||
      /already.*(subscribed|exists)/i.test(errTitle);

    if (alreadySubscribed) {
      return json({
        ok: true,
        message: 'You\u2019re already on the list. The next Sunday Letter is on its way.',
      });
    }

    console.error('[subscribe] Beehiiv error', beehiivRes.status, data);
    return json(
      { ok: false, message: 'Something went wrong on our end. Try again in a moment.' },
      502,
    );
  } catch (err) {
    console.error('[subscribe] Network error to Beehiiv', err);
    return json(
      { ok: false, message: 'Network error. Try again in a moment.' },
      502,
    );
  }
};

// Reject other methods cleanly
export const GET: APIRoute = () => json({ ok: false, message: 'Method not allowed.' }, 405);
