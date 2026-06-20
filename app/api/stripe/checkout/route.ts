import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { plan, email } = await req.json() as { plan: "monthly" | "annual"; email?: string };

  const priceId = plan === "annual"
    ? process.env.STRIPE_PRICE_ANNUAL
    : process.env.STRIPE_PRICE_MONTHLY;

  if (!priceId) {
    return NextResponse.json({ error: "Price not configured." }, { status: 500 });
  }

  const origin = req.headers.get("origin") ?? "https://storysignal.app";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/?upgraded=1`,
    cancel_url:  `${origin}/plan`,
    metadata: { email: email ?? "" },
  });

  return NextResponse.json({ url: session.url });
}
