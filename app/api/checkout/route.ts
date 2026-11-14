import type { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getStockBySize } from "@/lib/stock";
import { validateCheckoutRequest, checkStock, buildCheckoutParams } from "@/lib/checkout";

const UNAVAILABLE = "Checkout is unavailable right now. Please try again.";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const req = validateCheckoutRequest(body);
  if (!req.ok) return Response.json({ error: req.error }, { status: 400 });

  try {
    const stripe = getStripe();
    const info = (await getStockBySize(stripe))[req.size];
    const stockError = checkStock(info, req.size, req.quantity);
    if (stockError) return Response.json({ error: stockError }, { status: 409 });

    const session = await stripe.checkout.sessions.create(
      buildCheckoutParams({
        priceId: info.priceId,
        size: req.size,
        quantity: req.quantity,
        origin: request.nextUrl.origin,
        taxEnabled: process.env.STRIPE_TAX_ENABLED === "true",
      }),
    );
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("checkout failed", err);
    return Response.json({ error: UNAVAILABLE }, { status: 500 });
  }
}
