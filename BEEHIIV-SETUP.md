# Beehiiv Setup Runbook

The code-side of the newsletter integration is fully shipped. To make it live, you need to complete these manual steps. Total time: about 20 minutes.

---

## Phase 1 — Create the Beehiiv account (5 minutes)

1. Go to **https://www.beehiiv.com** and sign up. Use `editor@afterchildren.com` if it's configured, otherwise your personal email — you can change the sender address later.
2. When prompted to name your publication: **"The Sunday Letter"** (or whatever you prefer — this is what shows up in the email "From" name).
3. Set the publication URL slug to `afterchildren` so the Beehiiv hosted version is `afterchildren.beehiiv.com` (this is mostly internal — readers will subscribe via the site).
4. Select the **Launch plan** for now ($0/month, up to 2,500 subscribers). You can upgrade later. The free plan does include the API access you need.

## Phase 2 — Get the credentials (3 minutes)

1. **Get your API key:**
   - Go to **Settings → Integrations → API**
   - Click **"Create New API Key"**
   - Name it: `afterchildren-vercel`
   - Copy the key (it starts with `bh_`). You will see it only once — paste it somewhere safe immediately.

2. **Get your Publication ID:**
   - The publication ID is in the URL when you're inside your publication dashboard. It looks like `pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
   - Easiest place to find it: **Settings → Publication** — the ID is shown near the top of the page.

## Phase 3 — Wire it to Vercel (2 minutes)

1. Go to **https://vercel.com/dashboard** → AfterChildren project → **Settings → Environment Variables**
2. Add these two variables (apply to Production, Preview, AND Development):

   | Name | Value |
   |---|---|
   | `BEEHIIV_API_KEY` | paste the `bh_...` key |
   | `BEEHIIV_PUBLICATION_ID` | paste the `pub_...` ID |

3. **Redeploy.** Vercel does not re-read env vars on existing deployments. Click **Deployments → ... → Redeploy** on the latest deployment to pick up the new variables.

## Phase 4 — Set up the welcome email (5 minutes)

The `/api/subscribe` route already passes `send_welcome_email: true`. You just need to configure the welcome content in Beehiiv:

1. In Beehiiv: **Automations → Create Automation**
2. Choose trigger: **"Subscription created"**
3. Add action: **Send email**
4. Paste the welcome email content from `WELCOME-EMAIL.md` (in this repo at `/content/email/WELCOME-EMAIL.md`) — see file for the full 5-email sequence with timing.
5. **Email 1** is the immediate welcome. Set timing to "0 days after trigger."
6. **Emails 2–5** are the welcome sequence. Add them as additional actions in the same automation with the timing offsets listed in WELCOME-EMAIL.md.
7. Activate the automation.

## Phase 5 — Test the integration (2 minutes)

1. Open `https://[your-vercel-preview]/sunday-letter` (or any pillar page — they all have the newsletter component).
2. Subscribe with a real email you control (your own).
3. You should see "You're in. Check your inbox for the welcome letter." inline within ~2 seconds.
4. Check your inbox. The first welcome email should arrive within 60 seconds.
5. Back in Beehiiv: **Subscribers** — your test subscriber should appear with `signup_source` set to the page you subscribed from (`sunday-letter-page`, `pillar-money`, etc.).

If any step fails, check the Vercel deployment logs at **Deployments → [latest] → Functions → /api/subscribe** for the actual error. The most common failure is forgetting to redeploy after adding env vars.

---

## Operational notes

### Source attribution

Every Newsletter component instance on the site passes a `source` prop. This flows through to Beehiiv as `utm_source` and a custom field called `signup_source`. The values currently in use:

- `sunday-letter-page` — top of the dedicated landing page
- `sunday-letter-page-bottom` — bottom of the same page
- (Inline newsletter on manifestos and pillars defaults to `unknown` for now — see "Future improvements" below.)

In Beehiiv, you can create segments by source to see which placement converts best. Useful for deciding where to put additional CTAs.

### Honeypot

The form has an invisible "website" field. Bots fill it; humans don't see it. The API silently accepts honeypot submissions with a fake-success response — bots think they succeeded and stop retrying. Real bot rejection rates will show up as a delta between API-route invocations and actual subscriber count.

### "Already subscribed" handling

If someone tries to subscribe with an email already on the list, Beehiiv returns an error. The API translates that to a friendly success message ("You're already on the list. The next Sunday Letter is on its way."). They are not double-subscribed; they are not bothered.

### Welcome email deliverability

Beehiiv handles all sending infrastructure. You do not need to configure DKIM, SPF, or DMARC for the welcome email to work — they sign as Beehiiv's domain.

**However**, you should eventually configure custom domain sending so emails arrive from `editor@afterchildren.com` instead of `news@beehiiv.com`. This requires DNS records in your domain provider (instructions in Beehiiv: **Settings → Email → Custom Sending Domain**). Recommended within the first 30 days; not blocking the launch.

---

## Future improvements (deferred)

These are intentionally not built yet — they can be added once the integration is live and we know what we actually need:

1. **Add `source` attribution to inline Newsletter components.** Currently the inline component in the Article layout and pillar pages doesn't pass a source. To improve segmentation, each instance should pass `source="article-{slug}"` or `source="pillar-{name}"`. Low priority — current Beehiiv segments still work, just with less granularity.
2. **Per-pillar lead magnets.** Each pillar could offer a different opt-in incentive (e.g., "/legal" offers a free PDF checklist of the five essential documents). Worth building after the first 200 subscribers — when you know what people actually want.
3. **Double opt-in.** Beehiiv supports it; we currently use single opt-in for higher conversion. Switch later if spam complaints exceed 0.1%.
4. **Replace Vercel adapter env-var prompts during local dev.** If you do local Astro dev, set `.env` with the same variables. The integration falls back gracefully (returns 503) if either is missing.
