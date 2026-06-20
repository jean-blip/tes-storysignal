import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase  = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async function setIsPaid(email: string, paid: boolean) {
    await supabase
      .from("storysignal_users")
      .update({ is_paid: paid })
      .eq("email", email);
  }
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  const secret    = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = secret
      ? stripe.webhooks.constructEvent(body, signature, secret)
      : JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  async function emailFromSub(sub: Stripe.Subscription): Promise<string | null> {
    if (sub.metadata?.email) return sub.metadata.email;
    if (typeof sub.customer === "string") {
      const customer = await stripe.customers.retrieve(sub.customer) as Stripe.Customer;
      return customer.email ?? null;
    }
    return null;
  }

  const sub = event.data.object as Stripe.Subscription;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const active = ["active", "trialing"].includes(sub.status);
      const email  = await emailFromSub(sub);
      if (email) await setIsPaid(email, active);
      break;
    }
    case "customer.subscription.deleted": {
      const email = await emailFromSub(sub);
      if (email) await setIsPaid(email, false);
      break;
    }
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email   = session.customer_email ?? session.metadata?.email ?? null;
      if (email) await setIsPaid(email, true);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
