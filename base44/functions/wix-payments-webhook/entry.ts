import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';
import jwt from 'npm:jsonwebtoken@9.0.2';

// ============================================
// WIX PAYMENTS WEBHOOK HANDLER
// ============================================
// Verifies the Wix JWT, then activates / deactivates Subscription records.
// Activation is asynchronous: subscriptionInfo.id is only available here.

const WEBHOOK_PUBLIC_KEY = Deno.env.get("WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");

Deno.serve(async (req) => {
  try {
    if (!WEBHOOK_PUBLIC_KEY) {
      console.error("wix-payments-webhook: missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");
      return new Response("Missing public key", { status: 500 });
    }

    const requestBody = await req.text();

    // Step 1: verify JWT signature — fail closed if invalid
    let rawPayload: any;
    try {
      rawPayload = jwt.verify(requestBody, WEBHOOK_PUBLIC_KEY, { algorithms: ["RS256"] });
    } catch (e) {
      console.error("wix-payments-webhook: signature verification failed:", e.message);
      return new Response("Invalid signature", { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    // Step 2: parse double-nested JSON
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    if (event.eventType === "wix.ecom.v1.order_approved") {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;

      // Collect any subscription IDs from line items (lifetime purchases have none)
      let subscriptionId: string | null = null;
      for (const lineItem of order.lineItems || []) {
        if (lineItem.subscriptionInfo && lineItem.subscriptionInfo.id) {
          subscriptionId = lineItem.subscriptionInfo.id;
          break;
        }
      }

      // Find the pending subscription by checkout_id and activate it (idempotent)
      try {
        const pending = await base44.asServiceRole.entities.Subscription.filter({ checkout_id: checkoutId });
        for (const sub of pending) {
          if (sub.status === "active") continue; // idempotent
          await base44.asServiceRole.entities.Subscription.update(sub.id, {
            status: "active",
            subscription_id: subscriptionId || sub.subscription_id,
          });
        }
      } catch (e) {
        console.error("wix-payments-webhook: order_approved handler failed:", e.message);
      }
    } else if (
      event.eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_canceled" ||
      event.eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_expired"
    ) {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = subscriptionContract.id;
      const newStatus = event.eventType.includes("canceled") ? "canceled" : "ended";

      // Match by stored subscription_id and update status
      try {
        const subs = await base44.asServiceRole.entities.Subscription.filter({ subscription_id: subscriptionId });
        for (const sub of subs) {
          await base44.asServiceRole.entities.Subscription.update(sub.id, { status: newStatus });
        }
      } catch (e) {
        console.error("wix-payments-webhook: subscription status handler failed:", e.message);
      }
    } else {
      // Unknown event type — acknowledge and ignore
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("wix-payments-webhook error:", error.message);
    return new Response("Error", { status: 500 });
  }
});