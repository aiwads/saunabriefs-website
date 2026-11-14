# Sauna Briefs — Launch Guide

Everything you need to go from "site built" to "taking real orders." Do the steps in order. Anything marked **(Claude)** I can do for you once you've done the step before it.

---

## 1. Stripe account (do this first)

1. Sign up at **stripe.com**. You can use test mode right away. Business and bank verification can wait until launch.
2. Make sure the **Test mode** toggle (top right) is on.
3. Go to **Developers → API keys** and copy the **Secret key** (starts with `sk_test_`).
4. Send it to Claude, or paste it into a file named `.env.local` in the `website` folder:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_TAX_ENABLED=false
   NEXT_PUBLIC_SITE_URL=https://saunabriefs.com
   ```
   Never commit this file or post the key publicly. `.env.local` is already ignored by git.

## 2. Create the product in Stripe **(Claude)**

```
npx tsx --env-file=.env.local scripts/setup-stripe.ts
```
This creates **Sauna Briefs Kit** with one $45 price per size (S, M, L, XL), each starting at **stock 0**. It's safe to run again because it never duplicates anything.

## 3. Set your stock (and how to restock later)

In the Stripe dashboard:
**Product catalog → Sauna Briefs Kit → click a price (e.g. "Size M") → Metadata → edit `stock`** → type the number you have, e.g. `40` → Save.

- Do this for each size. A size at `0` shows **Sold out** on the site.
- Every paid order lowers the number automatically.
- To restock, just type the new total.
- Only whole numbers work. Anything else (like `forty`) counts as 0.

## 4. Turn on receipt emails

**Settings → Customer emails → turn on "Successful payments."** Customers get a Stripe receipt as soon as they pay.

## 5. Sales tax

Prices are set up so tax is **added on top of $45** where it applies.
1. In Stripe: **Settings → Tax**. Set your origin address and add a registration for each state where you're required to collect (usually your home state to start).
2. Set `STRIPE_TAX_ENABLED=true` in Vercel (step 6).

Ask an accountant which states you need to register in. The setup above is just the switch.

## 6. Vercel (hosting)

1. Sign up at **vercel.com** with your GitHub account.
2. **Add New → Project → import `aiwads/saunabriefs-website`.** **(Claude can do the rest via the Vercel CLI once you're logged in.)**
3. **Settings → Environment Variables**: add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (from step 7), `STRIPE_TAX_ENABLED`, and `NEXT_PUBLIC_SITE_URL`.

## 7. Webhook (this is what lowers stock after each order)

In Stripe: **Developers → Webhooks → Add endpoint**
- URL: `https://saunabriefs.com/api/webhooks/stripe` (or the Vercel preview URL while testing)
- Events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`
- Copy the **Signing secret** (`whsec_...`) into Vercel as `STRIPE_WEBHOOK_SECRET`, then redeploy.

## 8. Point your domain (Porkbun → Vercel)

1. In Vercel: **Project → Settings → Domains → add `saunabriefs.com` and `www.saunabriefs.com`.** Vercel shows the exact records to add.
2. In Porkbun: **Domain Management → saunabriefs.com → DNS**. Add **only** what Vercel shows, typically:
   - an **A** record for the root (`@` / blank host) pointing to Vercel's IP
   - a **CNAME** for `www` pointing to Vercel's target
3. **Don't change nameservers**, and **don't touch the MX or email-forwarding records.** Those are what make hello@saunabriefs.com work.
4. Delete any old A/CNAME records for `@` or `www` that point to Porkbun parking pages.
5. Vercel switches to "Valid configuration" within a few minutes to an hour.

## 9. Before going live, finish the content

- **Size chart:** measure the briefs and edit `lib/size-chart.ts`. Replace the placeholder numbers, then set `SIZE_CHART_IS_PLACEHOLDER = false`.
- **Check copy marked `OWNER: confirm`:**
  - how long the ice pack lasts and washing instructions (`app/components/Faq.tsx`)
  - processing time (`app/shipping/page.tsx`)
- **Read through** the Returns, Shipping, Privacy and Terms pages. They're plain drafts, not legal advice.

## 10. Go live

1. Finish Stripe's business verification and attach your **business bank account**.
2. In Stripe, switch to **Live mode** and create a live secret key (`sk_live_`, or `rk_live_` for a restricted key — "Full access except sensitive operations" is enough).
3. Run the setup script once with the live key (live mode has its own products), then set real stock counts (step 3) in live mode.
4. Add the live webhook (step 7, in live mode) and put the live key and live webhook secret into Vercel's **Production** env vars. Redeploy.
5. **Place one real order** with your own card. Check that you land on the thank-you page, get the receipt, and see stock drop by 1. Then refund it in Stripe and add 1 back to stock.

## Day-to-day

- **New order:** Stripe sends an email, and the order (size, address) shows under **Payments**. Size is in the payment's metadata and line item.
- **Ship it:** buy a label on Pirate Ship (USPS Ground Advantage), pack, drop off.
- **Exchange or refund:** refund in Stripe → Payments → Refund. If the item comes back unworn, add it back to stock.
