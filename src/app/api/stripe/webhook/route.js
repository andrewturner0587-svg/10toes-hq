import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function POST(req) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = await createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata?.supabase_uid;
    if (uid) {
      await supabase.from("profiles").update({
        stripe_subscription_id: session.subscription,
        subscription_status: "active",
      }).eq("id", uid);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", sub.customer)
      .single();
    if (profile) {
      await supabase.from("profiles").update({
        subscription_status: sub.status === "active" ? "active" : "inactive",
      }).eq("id", profile.id);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", sub.customer)
      .single();
    if (profile) {
      await supabase.from("profiles").update({ subscription_status: "canceled" }).eq("id", profile.id);
    }
  }

  return new Response("ok", { status: 200 });
}
