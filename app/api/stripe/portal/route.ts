import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { email } = await req.json();
  const origin = req.headers.get("origin") ?? "https://storysignal.app";

  // Find the Stripe customer by email
  const customers = await stripe.customers.list({ email, limit: 1 });
  const customer  = customers.data[0];

  if (!customer) {
    return NextResponse.json({ error: "No subscription found for this account." }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${origin}/plan`,
  });

  return NextResponse.json({ url: session.url });
}
