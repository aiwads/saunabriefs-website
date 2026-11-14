# Sauna Briefs Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Sauna Briefs waitlist landing page into a working store: pick a size, pay via Stripe Checkout, stock per size decrements automatically, policies and FAQ in place, deployable to Vercel.

**Architecture:** The homepage stays a client-rendered page. A new `BuySection` fetches live stock from `GET /api/stock` and posts `{size, quantity}` to `POST /api/checkout`, which re-checks stock and returns a Stripe-hosted Checkout URL. A Stripe webhook (`POST /api/webhooks/stripe`) decrements stock on paid orders. Stock lives in **Stripe Price metadata** (`stock`), one Price per size under a single Product, so the owner restocks in the Stripe dashboard with no code and no database.

**Tech Stack:** Next.js 16.2 (App Router), React 19, `stripe` (Node SDK), Vitest + Testing Library + jsdom, `tsx` for the setup script. Plain CSS in `app/globals.css`.

**Spec:** `docs/superpowers/specs/2026-11-13-sauna-briefs-store-design.md`

## Global Constraints

- Next.js 16.2 has breaking changes. Before writing route handlers or pages, read `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` and `.../03-api-reference/03-file-conventions/page.md`. `searchParams` in pages is a `Promise`.
- Price: **$45** (`4500` cents, USD), shown as "$45". **Free US shipping.** Sales tax is **added on top**: Prices use `tax_behavior: "exclusive"`.
- Sizes are exactly `S`, `M`, `L`, `XL`. Color: black only.
- Box contents copy: "1 × Sauna Briefs", "2 × Slim ice packs", "1 × Ice pack cooler".
- Shipping: **US only** (`allowed_countries: ["US"]`).
- Contact email everywhere: **hello@saunabriefs.com**.
- Brand tokens (already in `globals.css` as CSS vars): bg `#0D0D0B`, text `#EDEAE0`, accent `#5B8FA8`, muted `#7A7A6E`, surface `#141412`. Font Inter. Reuse existing vars, and don't add new colors.
- Tone: direct, confident, science-backed, not squeamish.
- No waitlist anywhere: the strings "waitlist", "Early Access", "20% off", and "Notify Me" must not appear in `app/`.
- No custom card form; payment happens only on Stripe-hosted Checkout.
- Secrets come only from env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_TAX_ENABLED` ("true"/unset). Never commit keys. Add `.env.local.example`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Quantity exceeds remaining stock for a size** (M has 2 left, buyer picks 3). The UI caps the quantity at the remaining stock, and the server returns 409 with a readable message. Test: Task 3 (`rejects quantity above stock`), Task 5 (`caps quantity at stock`).
2. **Stripe redelivers the same webhook event.** Stock must decrement exactly once. Test: Task 4 (`does not decrement twice for same payment`).
3. **The owner types messy stock metadata in the dashboard** (`" 40 "`, `"forty"`, blank, negative). Trimmed integers parse; anything else counts as 0 (sold out); stock never goes below 0. Test: Task 2 (`parseStock`), Task 4 (`clamps at zero`).
4. **Stock can't be loaded** (network error, or keys missing in a preview). The buy section still renders with all sizes selectable and shows no crash; the server stays the real gate. Test: Task 5 (`renders when stock fetch fails`).
5. **Buyer double-clicks Buy or cancels at Stripe.** Only one checkout request is in flight (the button is disabled while pending), and cancel returns to `/#shop` with stock untouched. Test: Task 5 (`disables button while pending`), Task 3 (`cancel_url points to #shop`).

---

## File Structure

```
lib/catalog.ts            # SIZES, Size type, PRICE_CENTS, MAX_QTY, BOX_CONTENTS, lookupKey()
lib/stripe.ts             # getStripe(): Stripe singleton from env
lib/stock.ts              # parseStock, getStockBySize, decrementStock (Stripe Price metadata)
lib/checkout.ts           # validateCheckoutRequest, buildCheckoutParams (pure)
lib/webhook.ts            # handleStripeEvent (injected stripe client, testable)
lib/size-chart.ts         # SIZE_CHART data + SIZE_CHART_IS_PLACEHOLDER
app/api/stock/route.ts    # GET → { stock: Record<Size, number> | null }
app/api/checkout/route.ts # POST → { url } | { error }
app/api/webhooks/stripe/route.ts
app/components/BuySection.tsx, SizeChart.tsx, StickyBuyBar.tsx, Faq.tsx, Footer.tsx, PolicyPage.tsx
app/page.tsx              # modified: remove waitlist, wire new sections
app/thank-you/page.tsx, app/returns/page.tsx, app/shipping/page.tsx, app/privacy/page.tsx, app/terms/page.tsx
scripts/setup-stripe.ts   # one-time, idempotent: creates Product + 4 Prices
tests/**/*.test.ts(x)
docs/LAUNCH.md            # owner-facing: Stripe, Vercel, Porkbun DNS, restock, go-live
```

---

### Task 1: Test tooling + catalog constants

**Files:**
- Modify: `package.json` (add deps + `"test": "vitest run"`)
- Create: `vitest.config.ts`, `lib/catalog.ts`, `tests/lib/catalog.test.ts`, `.env.local.example`

**Interfaces:**
- Produces: `SIZES = ["S","M","L","XL"] as const`; `type Size = typeof SIZES[number]`; `isSize(x: unknown): x is Size`; `PRICE_CENTS = 4500`; `MAX_QTY = 5`; `BOX_CONTENTS: string[]` (the three strings from Global Constraints); `lookupKey(size: Size): string` → `"sauna-briefs-kit-<size lowercased>"`; `formatPrice(cents: number): string` → `"$45"` for 4500, `"$90"` for 9000.

- [ ] **Step 1:** Install: `npm i stripe` and `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event tsx`. Add a `vitest.config.ts` with the react plugin, `environment: "jsdom"`, and an `@/` alias to the project root if the tsconfig uses one.
- [ ] **Step 2: Write the failing test** `tests/lib/catalog.test.ts`:
```ts
expect(SIZES).toEqual(["S","M","L","XL"]);
expect(isSize("M")).toBe(true); expect(isSize("XXL")).toBe(false); expect(isSize(3)).toBe(false);
expect(lookupKey("XL")).toBe("sauna-briefs-kit-xl");
expect(formatPrice(4500)).toBe("$45"); expect(formatPrice(9000)).toBe("$90");
```
- [ ] **Step 3:** Run `npm test`. Expected: FAIL (module not found).
- [ ] **Step 4:** Implement `lib/catalog.ts`. Create `.env.local.example` with `STRIPE_SECRET_KEY=sk_test_...`, `STRIPE_WEBHOOK_SECRET=whsec_...`, and `STRIPE_TAX_ENABLED=false`. Confirm `.env*.local` is gitignored.
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit `chore: add vitest and catalog constants`.

### Task 2: Stock in Stripe Price metadata + setup script

**Files:**
- Create: `lib/stripe.ts`, `lib/stock.ts`, `scripts/setup-stripe.ts`, `tests/lib/stock.test.ts`

**Interfaces:**
- Consumes: `SIZES`, `Size`, `lookupKey`, `PRICE_CENTS` (Task 1).
- Produces:
  - `getStripe(): Stripe` throws `Error("STRIPE_SECRET_KEY missing")` if unset. Use the SDK's default API version.
  - `parseStock(raw: string | undefined): number` trims the input and returns it for a non-negative integer string, else `0`.
  - `type PriceInfo = { priceId: string; stock: number }`
  - `getStockBySize(stripe: Stripe): Promise<Record<Size, PriceInfo>>` calls `stripe.prices.list({ lookup_keys: SIZES.map(lookupKey), active: true })`. A size with no Price gets `{ priceId: "", stock: 0 }`.
  - `decrementStock(stripe: Stripe, priceId: string, qty: number): Promise<number>` retrieves the Price, computes `max(0, parseStock(meta.stock) - qty)`, writes it back with `prices.update(priceId, { metadata: { stock: String(n) } })`, and returns `n`.

- [ ] **Step 1: Write failing tests** (mock the Stripe client as a plain object with `prices.list/retrieve/update` as `vi.fn()`):
  - `parseStock`: `"40"→40`, `" 40 "→40`, `"forty"→0`, `""→0`, `undefined→0`, `"-3"→0`, `"2.5"→0`.
  - `getStockBySize` maps list results by `lookup_key` and reads `metadata.stock`, and a missing size returns `{priceId:"",stock:0}`.
  - `decrementStock` with stock "3" and qty 2 → update called with `{metadata:{stock:"1"}}`, returns 1. **`clamps at zero`**: stock "1", qty 2 → `"0"`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `lib/stripe.ts` and `lib/stock.ts`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Implement `scripts/setup-stripe.ts` (run with `npx tsx --env-file=.env.local scripts/setup-stripe.ts`). It finds or creates the Product "Sauna Briefs Kit" (description: box contents, `metadata.sku_family="sauna-briefs-kit"`). For each size, it creates a Price only if that `lookup_key` doesn't exist yet: `unit_amount: 4500, currency: "usd", tax_behavior: "exclusive", lookup_key, nickname: "Size <S>", metadata: { size, stock: "0" }`. It prints the resulting priceIds and stock. Running it twice must create nothing new.
- [ ] **Step 6:** If test keys are available, run the script twice and confirm the second run reports "exists" for all 4. If not, note in the commit that it's unverified against live Stripe.
- [ ] **Step 7:** Commit `feat: stripe stock helpers and setup script`.

### Task 3: Checkout API

**Files:**
- Create: `lib/checkout.ts`, `app/api/checkout/route.ts`, `app/api/stock/route.ts`, `tests/lib/checkout.test.ts`

**Interfaces:**
- Consumes: `isSize`, `MAX_QTY`, `getStripe`, `getStockBySize` (Tasks 1–2).
- Produces:
  - `validateCheckoutRequest(body: unknown): { ok: true; size: Size; quantity: number } | { ok: false; error: string }` accepts only an integer quantity from 1 to `MAX_QTY`.
  - `buildCheckoutParams(a: { priceId: string; size: Size; quantity: number; origin: string; taxEnabled: boolean }): Stripe.Checkout.SessionCreateParams`
  - `POST /api/checkout` with body `{ size, quantity }` → `200 { url }` | `400 { error }` (bad input) | `409 { error: "Only N left in size M." }` or `"Size M is sold out."` | `500 { error: "Checkout is unavailable right now. Please try again." }`.
  - `GET /api/stock` → `200 { stock: Record<Size, number> }`, or `200 { stock: null }` if Stripe errors. Not cached (route handlers aren't by default; don't add `force-static`).

- [ ] **Step 1: Write failing tests** for the pure functions:
  - validate: `{size:"M",quantity:1}` ok, `{size:"XXL",quantity:1}` error, `{size:"M",quantity:0}` error, `{size:"M",quantity:6}` error, `{size:"M",quantity:1.5}` error, `null` error.
  - build: `mode==="payment"`, `line_items` is `[{price: priceId, quantity}]`, `shipping_address_collection.allowed_countries` equals `["US"]`, there is one shipping option with `fixed_amount.amount===0`, `currency "usd"`, display_name `"Free US shipping"`, `tax_behavior "exclusive"`, `automatic_tax.enabled===taxEnabled`, success_url is `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`, **`cancel_url points to #shop`**: `${origin}/#shop`, `metadata.size===size`, `payment_intent_data.metadata` equals `{size, quantity: String(quantity)}`.
  - **`rejects quantity above stock`**: extract `checkStock(info: PriceInfo, size: Size, quantity: number): string | null` into `lib/checkout.ts`. Stock 2 and qty 3 returns `"Only 2 left in size M."`. Stock 0 returns `"Size M is sold out."`. Stock 5 and qty 3 returns `null`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `lib/checkout.ts`, then the two route handlers. The checkout route takes origin from `request.nextUrl.origin` and `taxEnabled` from `process.env.STRIPE_TAX_ENABLED === "true"`, and logs Stripe errors with `console.error`.
- [ ] **Step 4:** Run `npm test` and `npx tsc --noEmit`. Expected: PASS, no type errors.
- [ ] **Step 5:** If test keys exist, run `npm run dev` and `curl -XPOST localhost:3000/api/checkout -d '{"size":"M","quantity":1}' -H 'content-type: application/json'`. A sold-out M (stock 0) should return 409. After setting stock 5 in the dashboard, it should return a `checkout.stripe.com` URL.
- [ ] **Step 6:** Commit `feat: checkout and stock API routes`.

### Task 4: Webhook decrements stock

**Files:**
- Create: `lib/webhook.ts`, `app/api/webhooks/stripe/route.ts`, `tests/lib/webhook.test.ts`

**Interfaces:**
- Consumes: `decrementStock` (Task 2).
- Produces: `handleStripeEvent(event: Stripe.Event, stripe: Stripe): Promise<"decremented" | "already-processed" | "ignored">`

Behavior: act only on `checkout.session.completed` with `payment_status === "paid"`, and on `checkout.session.async_payment_succeeded`. Everything else returns `"ignored"`. Retrieve the session's line items (`stripe.checkout.sessions.listLineItems(session.id)`) and the PaymentIntent. If `paymentIntent.metadata.stock_decremented === "true"`, return `"already-processed"`. Otherwise, call `decrementStock(priceId, quantity)` for each line item, then `paymentIntents.update(id, { metadata: { stock_decremented: "true" } })` and return `"decremented"`.

- [ ] **Step 1: Write failing tests** with a mocked stripe object:
  - paid completed session with M qty 2 → `decrementStock` path called once (assert `prices.update` called with stock reduced by 2), PI metadata set, returns `"decremented"`.
  - `payment_status: "unpaid"` → `"ignored"`, no updates.
  - **`does not decrement twice for same payment`**: PI metadata already `stock_decremented:"true"` → `"already-processed"`, `prices.update` not called.
  - `payment_intent.succeeded` event type → `"ignored"`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `lib/webhook.ts`, then the route. The route reads the raw body with `await request.text()` and verifies it with `stripe.webhooks.constructEvent(body, request.headers.get("stripe-signature"), STRIPE_WEBHOOK_SECRET)`. A bad signature returns 400. A handler error is logged and returns 500, so Stripe retries. Success returns `200 {received:true}`.
- [ ] **Step 4:** Run `npm test` and `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 5:** If test keys exist: run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, complete a test checkout with card `4242 4242 4242 4242`, and confirm in the dashboard that the size's stock dropped by the quantity. Run `stripe events resend <evt_id>` and confirm the stock did not drop again.
- [ ] **Step 6:** Commit `feat: stripe webhook decrements stock idempotently`.

### Task 5: Buy section + size chart

**Files:**
- Create: `lib/size-chart.ts`, `app/components/BuySection.tsx`, `app/components/SizeChart.tsx`, `tests/components/BuySection.test.tsx`
- Modify: `app/globals.css` (replace the `.product-*` rules that the new markup no longer uses, and add `.buy-*`, `.size-*` rules plus mobile stacking under the existing breakpoint)

**Interfaces:**
- Consumes: `SIZES`, `Size`, `PRICE_CENTS`, `MAX_QTY`, `BOX_CONTENTS`, `formatPrice`. Endpoints `GET /api/stock`, `POST /api/checkout` (Task 3).
- Produces: `<BuySection />` rendered at the element `id="shop"` (anchor target for nav, hero, sticky bar). `SIZE_CHART: { size: Size; waistIn: string; hipIn: string }[]` and `SIZE_CHART_IS_PLACEHOLDER = true`. `<SizeChart open onClose />` is a modal reusing the existing `.modal-overlay`/`.modal` styles.

Layout per the approved mockup (`.superpowers/brainstorm/73450-1794621120/content/buy-section.html`). The left side shows the main image and three thumbnails (`product-hero-v4.png`, `product-hero-v2.png`, `product-gel.png`), and clicking a thumbnail swaps the main image. The right side has, in order:
- the label "Sauna Briefs™ · Black"
- the heading "Built For / The Heat." with the second line in the accent color
- "$45" and "Free US shipping"
- a "What's in the box" list
- a "Size" row with a "Size chart" link
- the 4 size buttons
- a quantity stepper and a button reading "Buy Now — {formatPrice(PRICE_CENTS*qty)}"
- the small line "+ tax where applicable"
- the trust line: Free US shipping · Free size exchanges, 30 days · Secure checkout by Stripe. "Free size exchanges" links to `/returns`.

No size is preselected. Clicking Buy with no size shows the inline message "Pick a size first."

While a placeholder is shown, the size chart modal shows a muted note: "Measurements coming soon — email hello@saunabriefs.com for sizing help."

- [ ] **Step 1: Write failing tests** (mock `fetch`):
  - `renders when stock fetch fails`: `fetch` for `/api/stock` rejects. All 4 size buttons are enabled, and the buy button exists.
  - stock `{S:5,M:5,L:0,XL:5}`: the L button is disabled with `aria-disabled` and its label includes "sold out".
  - all sizes 0: the buy button reads "Sold out" and is disabled.
  - `caps quantity at stock`: stock M=2. Select M and click + three times. The quantity shows 2.
  - the buy button text updates to "Buy Now — $90" at qty 2.
  - clicking Buy with no size shows "Pick a size first." and doesn't call `/api/checkout`.
  - `disables button while pending`: select M and click Buy twice quickly. `/api/checkout` is called once.
  - a 409 response `{error:"Only 1 left in size M."}` shows that text inline.
  - a 200 `{url}` sets `window.location.href` to url (spy or stub `window.location.assign`; use `assign` in the implementation for testability).
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `lib/size-chart.ts` (placeholder inches, e.g. S 28–30, M 31–33, L 34–36, XL 37–39, each with a `// PLACEHOLDER — owner to measure` comment), `SizeChart.tsx`, `BuySection.tsx` (`"use client"`; use `next/image` like the current product block), and the CSS.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: buy section with size picker, stock states, size chart`.

### Task 6: Homepage rewiring — remove waitlist, add FAQ, footer, sticky buy bar

**Files:**
- Modify: `app/page.tsx`, `app/globals.css`
- Create: `app/components/Faq.tsx`, `app/components/Footer.tsx`, `app/components/StickyBuyBar.tsx`, `tests/components/page.test.tsx`

**Interfaces:**
- Consumes: `<BuySection />` (Task 5), `formatPrice`, `PRICE_CENTS`.
- Produces: `<Footer />` (also used by Task 7 pages). Section ids: `#science` (problem section), `#shop`, `#faq`.

Changes:
- **Nav:** "Science" → `<a href="#science">`, "How It Works" → `<a href="#faq">`, and the button becomes `<a href="#shop">Shop — $45</a>`.
- **Hero right:** replace the label, form, and fine print. The description stays (keep "The Original Sauna Briefs™ — with a built-in ice pack pouch. Sauna as long as you want, without cooking your testosterone or fertility."), followed by `<a href="#shop">Shop now</a>` styled like the old button and the fine print "$45 · Free US shipping".
- Delete the modal, the email sticky bar, the `localStorage` logic, and their CSS. Keep the ticker and problem section unchanged, except for the `id="science"`.
- **StickyBuyBar:** keep the existing scroll logic (visible once the hero bottom is above mid-viewport) and the dismiss ✕. The content becomes "Sauna Briefs — $45 · Free US shipping" plus `<a href="#shop">Buy</a>`.
- **Faq:** a `<details>` accordion with these questions: What size should I get? (point to the size chart; mention exchanges) · How do I use it? (freeze both packs; one in the pouch before you go in, the spare stays in the cooler) · How long does the ice pack last? (write a cautious answer such as "most of a typical session", and mark it `{/* OWNER: confirm */}`) · How do I wash it? (cold machine wash, hang dry; owner to confirm) · Where do you ship / how fast? (US only, free, ships within 2 business days) · What's your return policy? (summary + link `/returns`). Copy follows the brand tone.
- **Footer:** the wordmark, links to `/returns`, `/shipping`, `/privacy`, `/terms`, `mailto:hello@saunabriefs.com`, and "© 2026 Sauna Briefs".

- [ ] **Step 1: Write failing test** `tests/components/page.test.tsx`: render `<Home />` (mock `fetch` and `next/image` as needed). Assert the text contains none of `/waitlist/i`, `/early access/i`, `/20% off/i`, `/notify me/i`, and does contain "Shop now". Assert `#shop` and `#faq` exist and the footer has a link to `/returns`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement the changes.
- [ ] **Step 4:** Run `npm test`, then `grep -riE "waitlist|early access|20% off|notify me" app/`. Expected: tests pass and grep returns nothing.
- [ ] **Step 5:** Run `npm run dev`, then check desktop at 1440px and mobile at 390px in the browser: hero CTA scrolls to the buy section, the sticky bar appears after the hero, nothing scrolls horizontally, and the FAQ opens and closes. Take screenshots for the owner.
- [ ] **Step 6:** Commit `feat: replace waitlist with shop CTAs, add FAQ, footer, sticky buy bar`.

### Task 7: Thank-you and policy pages

**Files:**
- Create: `app/components/PolicyPage.tsx`, `app/thank-you/page.tsx`, `app/returns/page.tsx`, `app/shipping/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `tests/pages/thank-you.test.tsx`

**Interfaces:**
- Consumes: `getStripe` (Task 2), `<Footer />` (Task 6).
- Produces: `<PolicyPage title: string; updated: string; children />`, a simple nav back to `/`, a content column, and `<Footer />`. Each page exports `metadata` with a title like "Returns & Exchanges — Sauna Briefs".

**Thank-you** (server component): `searchParams: Promise<{ session_id?: string }>`. If a `session_id` is present, try `stripe.checkout.sessions.retrieve(id)` and show "Order confirmed" with the customer email ("Receipt sent to …"). On any error or missing id, show the same page without the email (never a 500). Then the copy: what happens next (ships within 2 business days via USPS, with tracking by email), freeze the ice packs before your first session, and questions go to hello@saunabriefs.com. Add a link back home.

**Returns** (exact policy from the spec):
- free size exchange within 30 days for unworn briefs with tags attached; email hello@saunabriefs.com; the customer pays return shipping and we ship the replacement free
- no refunds on worn briefs (hygiene)
- defective or damaged on arrival: free replacement, photo required, no return needed
- unopened kit within 30 days: full refund minus return shipping

**Shipping:** US only, free, USPS, ships within 2 business days, tracking emailed. Mark the processing time `{/* OWNER: confirm */}`.

**Privacy / Terms:** plain, small-store drafts. Payments are processed by Stripe and we never see or store card numbers. We collect name, email, and shipping address to fulfil orders. We don't sell data. Contact email. Terms: US sales only, prices in USD with tax added where applicable, policy links, and a product-use note (not a medical device; consult a doctor about fertility concerns). Top of each: "Last updated November 13, 2026".

- [ ] **Step 1: Write failing tests**: call the thank-you page component with `searchParams: Promise.resolve({})` and render the result. It shows "Order confirmed" and "hello@saunabriefs.com". With a mocked `getStripe` whose retrieve rejects, it still renders without throwing. With retrieve resolving `{customer_details:{email:"a@b.com"}}`, it shows "a@b.com".
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement all pages.
- [ ] **Step 4:** Run `npm test`, `npx tsc --noEmit`, and `npm run build`. Expected: all pass, and the build lists `/thank-you`, `/returns`, `/shipping`, `/privacy`, `/terms`.
- [ ] **Step 5:** Commit `feat: thank-you and policy pages`.

### Task 8: Image weight, metadata, launch docs

**Files:**
- Modify: `app/layout.tsx` (metadata), `app/page.tsx` and `BuySection.tsx` (image paths if they change)
- Create: `docs/LAUNCH.md`
- Replace in `public/`: downscaled copies of the large images

**Interfaces:** none new.

- [ ] **Step 1:** Downscale the source images with `sips`. Make `winner.png` 2560px wide, and the product images at most 1600px on the long edge, saved as high-quality JPG under new names (`hero.jpg`, `product-main.jpg`, `product-alt.jpg`, `product-gel.jpg`). Update the references, then delete the unused large PNGs (`product-2.png`, `product-hero.png`, `product-hero-v3.png`, the old `winner.png`). Next.js `Image` still optimizes these at request time.
- [ ] **Step 2:** Update `layout.tsx` metadata: title "Sauna Briefs — All The Heat. None Of The Damage." and description "Sauna briefs with a built-in ice pack pouch. Protect your fertility and testosterone in the heat. $45, free US shipping." Set the Open Graph image to `hero.jpg`.
- [ ] **Step 3:** Write `docs/LAUNCH.md` for the owner in plain language, covering:
  - Stripe signup and where test keys live
  - running the setup script
  - **how to restock**: Stripe dashboard → Product catalog → Sauna Briefs Kit → the size's price → Metadata → edit `stock`
  - turning on receipt emails
  - turning on Stripe Tax, then setting `STRIPE_TAX_ENABLED=true` in Vercel
  - Vercel: import the GitHub repo and set the env vars
  - adding the webhook endpoint `https://<domain>/api/webhooks/stripe` with the events `checkout.session.completed` and `checkout.session.async_payment_succeeded`
  - **Porkbun DNS**: add the A record for `@` and the CNAME for `www` that Vercel's Domains screen shows. Do **not** change nameservers, and do not touch the MX or email-forwarding records, so hello@ keeps working.
  - going live: live keys, a live webhook, the setup script run with live keys, real stock counts
  - the size chart file to edit, `lib/size-chart.ts`, with `SIZE_CHART_IS_PLACEHOLDER = false`
  - the copy marked `OWNER: confirm`
  - a final real order, then refund it
- [ ] **Step 4:** Run `npm test` and `npm run build`. Expected: both pass. Check the page in the browser: images look sharp, and `du -sh public` is well under 10 MB.
- [ ] **Step 5:** Commit `chore: optimize images, metadata, launch guide`.

### Task 9: Deploy to Vercel (needs owner accounts)

Blocked until the owner has a Vercel account connected to GitHub and has provided Stripe test keys.

- [ ] **Step 1:** Push the branch, then `npx vercel link` (owner logs in once if prompted) and `npx vercel env add` for the three env vars (test values) in Preview and Production.
- [ ] **Step 2:** `npx vercel deploy` (preview). Register a **test-mode** webhook in Stripe for `<preview-url>/api/webhooks/stripe` and add its secret to the env.
- [ ] **Step 3:** On the preview, run one end-to-end test order with card 4242. Expected: you land on `/thank-you` showing the email, and that size's stock drops by 1 in Stripe.
- [ ] **Step 4:** Report the preview URL to the owner and point them to `docs/LAUNCH.md` for the domain and go-live steps.
