# Sauna Briefs — Turn the Waitlist Site Into a Store

**Date:** 2026-11-13
**Status:** Draft for owner approval (builder-check questions answered)

## Intent

Sauna Briefs has finished product in hand. The site at `sauna-briefs/website/` (Next.js 16, deployed nowhere yet) is a pre-launch waitlist page. The goal is to start selling now: a visitor lands, understands the problem, picks a size, pays, and gets a kit shipped to them. The owner fulfils orders himself.

**Success:** a real person on saunabriefs.com can buy a kit with a card or Apple/Google Pay, the owner sees the order (with size and address) in Stripe, and stock per size goes down by itself.

## The product (single SKU family)

- **Sauna Briefs kit, $45, free US shipping.**
- Contents: **1 × Sauna Briefs, 2 × slim ice packs, 1 × ice pack cooler.**
- One color: **black**. Sizes: **S, M, L, XL**.
- Unit cost is about $10.25, which leaves roughly $25 per order after shipping, Stripe fees, and packaging. That margin is why shipping is free.

## Goals

1. Buy flow: size picker → quantity → Stripe-hosted Checkout → thank-you page on our site.
2. Per-size stock count that decrements automatically on paid orders; a size at 0 shows as sold out and cannot be bought.
3. US-only shipping, collected in Checkout.
4. Clear policies: returns/exchanges, shipping, privacy, terms.
5. Site live on the owner's domain (registered at Porkbun) via Vercel.

## Non-goals

- No waitlist, email capture, or newsletter (owner has no waitlist members; remove all of it).
- No cart/multi-product system, accounts, or customer login.
- No international shipping (later: a Stripe setting).
- No discount codes at launch (Stripe promo codes can be switched on later with no code change if `allow_promotion_codes` is enabled; builder may enable it).
- No admin UI. The owner uses the Stripe dashboard.
- No visual redesign. Brand colors, type, hero, ticker, and problem section stay as they are.

## Anti-goals (would be a failure even if it "works")

- Selling a size that is out of stock in any routine case.
- The owner needing to touch code to see orders or restock.
- Checkout that looks off-brand or untrustworthy (stick to Stripe-hosted Checkout; do not build a custom card form).
- Leftover waitlist copy ("20% off at launch", "Notify me", "Early access") anywhere on the site.

## Page changes (approved via mockup)

Current page order: nav → hero → ticker → problem + 3 stats → product block → waitlist modal + sticky email bar.

1. **Nav:** "Waitlist" button → **"Shop — $45"**, scrolling to the buy section. "Science" and "How It Works" links are currently dead `<span>`s; make them anchors to the problem section and FAQ (builder's call).
2. **Hero:** headline unchanged ("All The Heat. / None Of The Damage."). Replace the email form and "Early Access / 20% off" copy on the right with a short product line + **"Shop now"** button + "Free US shipping".
3. **Ticker, problem section:** unchanged.
4. **Buy section** (replaces the current "Notify Me at Launch" product block), as in the approved mockup:
   - Left: main image + thumbnails (use `product-hero-v4.png`, `product-hero-v2.png`, `product-gel.png`; builder may pick which are strongest and should compress/resize the very large PNGs).
   - Right: label "Sauna Briefs™ · Black", heading "Built For / The Heat.", **$45 · Free US shipping** (current page wrongly says $49), "What's in the box" list, size buttons S/M/L/XL with a **Size chart** link, quantity stepper, **Buy Now — $45** button (price updates with quantity), trust line: Free US shipping · Free size exchanges, 30 days · Secure checkout by Stripe.
   - Sold-out size: struck through, disabled. All sizes out → button reads "Sold out".
   - Must work well on mobile (stacked).
5. **FAQ section (new):** sizing, how to use the ice pack/cooler (freeze packs, slip into pouch before sauna), care/washing, shipping times, returns. Builder drafts copy in the brand tone (direct, confident, not squeamish); owner reviews.
6. **Footer (new):** links to Returns & Exchanges, Shipping, Privacy, Terms; contact **hello@saunabriefs.com**; ©.
7. **Remove:** waitlist modal, sticky email bar, all `localStorage` waitlist logic. **Replace** the sticky bar with a sticky "Buy — $45" bar that appears after the hero and scrolls to the buy section.

## Size chart

Owner does not have measurements yet and will measure himself. Build the size chart (modal or small section) driven by one data object so he can fill numbers in later. Ship with clearly marked placeholder values; launch should not happen until real numbers are in (add to launch checklist).

## Checkout & orders (decided)

- **Payments:** Stripe, using **Stripe-hosted Checkout** (redirect). Owner is **creating the Stripe account now** and will provide **test-mode keys**, so checkout, webhook, and stock are tested against real Stripe test mode (no mocking of the critical path). Live keys at launch. Owner is also opening a separate business bank account for payouts (needed only before first payout; doesn't block the build).
- One Stripe Product per size (or one Product with four Prices; builder's call), $45 each.
- Checkout collects shipping address (**US only**), email, and shows **free shipping** as a shipping rate.
- Apple Pay / Google Pay via Stripe's defaults.
- **Sales tax is added on top of $45** (owner decision). Create Prices with `tax_behavior: "exclusive"`. Site shows "$45"; where Stripe Tax applies, tax is added at checkout. Wire `automatic_tax` so it can be enabled; turning on Stripe Tax registrations is a launch-checklist item. Optionally a small "+ tax where applicable" note near the Buy button (builder's call).
- Success → `/thank-you` page on our site (order confirmation copy, what happens next, contact email). Cancel → back to the buy section.
- Stripe sends receipt emails (enable in dashboard).
- Owner fulfils by hand: sees orders in Stripe, buys labels via Pirate Ship.

## Inventory (decided: automatic per-size counter)

- Each size has a stock count. On `checkout.session.completed` (paid), a Stripe webhook decrements the purchased size by the quantity bought.
- The buy section reads current stock to render sold-out states; the server re-checks stock when creating a Checkout session and refuses if insufficient.
- Owner must be able to restock **without code**. My call: store the count in Stripe Product/Price **metadata** (e.g. `stock=40`), editable in the Stripe dashboard. This avoids adding a database. Builder may choose a different store if there's a strong reason, but restocking must remain a no-code action.
- Accepted risk: two people checking out the last unit at the same moment could oversell by one. At this volume that's fine; the owner would refund or wait to ship.
- Webhook must be idempotent (don't double-decrement on Stripe retries).

## Policies (decided)

**Returns & Exchanges** (own page, linked in footer and near Buy button):
- Free size exchange within 30 days for unworn briefs with tags. Customer emails hello@saunabriefs.com and pays return shipping; Sauna Briefs ships the replacement free.
- No refunds on worn briefs (hygiene).
- Defective/damaged on arrival: free replacement, photo required, no return needed.
- Unopened kit within 30 days: full refund minus return shipping.

**Shipping:** US only, free, ships via USPS (builder writes a reasonable processing time, e.g. "ships within 2 business days", marked for owner review).

**Privacy & Terms:** builder drafts plain, standard small-store pages (Stripe processes payment; we store no card data; contact email). Owner reviews. Not legal advice.

## Hosting & domain

- Deploy on **Vercel** from the existing GitHub repo `aiwads/saunabriefs-website`.
- Point the owner's Porkbun domain to Vercel by **adding A/CNAME records at Porkbun only; do NOT move nameservers.** hello@saunabriefs.com already works (likely via Porkbun's email/forwarding); existing MX records must be left untouched. Give the owner step-by-step instructions.
- Owner will create a free Vercel account and connect GitHub. After that, the builder can link the project, set env vars, deploy previews, and register the test webhook against a deployed URL (or use the Stripe CLI locally).
- Stripe keys and webhook secret as Vercel environment variables (test values first, live at launch).

## Constraints

- Next.js 16.2 with breaking changes from older versions. Read `node_modules/next/dist/docs/` before writing code (per repo `AGENTS.md`).
- Keep existing styling approach (`app/globals.css` with brand tokens: bg `#0D0D0B`, cream `#EDEAE0`, glacier blue `#5B8FA8`, muted `#7A7A6E`, surface `#141412`; Inter).
- Very large images in `public/` (`winner.png` 14 MB, `product-2.png` 10 MB); keep page weight sensible.

## Launch checklist (owner actions)

1. Create Stripe account now (test keys to builder); before launch, complete business verification and attach the business bank account.
2. Enable Stripe Tax registrations for the states where required (prices already tax-exclusive).
3. Set real stock counts per size in Stripe.
4. Measure and enter the size chart.
5. Review FAQ, shipping, privacy, and terms copy.
6. Switch Vercel env vars to live Stripe keys; register the live webhook.
7. Point Porkbun DNS at Vercel.
8. Place one real order end-to-end and refund it.

## Left to the builder

Component structure, how stock is fetched/cached, image choices and optimization, exact FAQ/policy wording (for owner review), whether the size chart is a modal or inline, nav anchor targets, test strategy.
