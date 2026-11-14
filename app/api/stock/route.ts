import { getStripe } from "@/lib/stripe";
import { getStockBySize } from "@/lib/stock";
import { SIZES, type Size } from "@/lib/catalog";

// Not cached: route handlers run per request by default in Next 16.
export async function GET() {
  try {
    const bySize = await getStockBySize(getStripe());
    const stock = Object.fromEntries(SIZES.map((s) => [s, bySize[s].stock])) as Record<Size, number>;
    return Response.json({ stock });
  } catch (err) {
    console.error("stock lookup failed", err);
    return Response.json({ stock: null });
  }
}
