import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

// ============================================
// CREATE CHECKOUT — Base44 Payments (Wix)
// ============================================
// Creates a Wix Checkout session for an Omega Access plan purchase and
// persists a "pending" Subscription record linked to the logged-in user.
// The order_approved webhook flips it to "active".

const WIX_API_KEY = Deno.env.get("WIX_PAYMENTS_API_KEY");
const WIX_SITE_ID = Deno.env.get("WIX_PAYMENTS_SITE_ID");

interface PlanDef {
  name: string;
  price: string;
  subscription: {
    subscriptionSettings: {
      frequency: "MONTH" | "YEAR";
      freeTrialPeriod?: { frequency: "DAY"; interval: number };
    };
    title: string;
    description: string;
  } | null;
}

const PLANS: Record<string, PlanDef> = {
  monthly: {
    name: "Omega Access — Monthly",
    price: "9.99",
    subscription: {
      subscriptionSettings: { frequency: "MONTH" },
      title: "Omega Access Monthly",
      description: "Unlimited AI routing, premium models, batch & custom presets — billed monthly",
    },
  },
  annual: {
    name: "Omega Access — Annual",
    price: "89.99",
    subscription: {
      subscriptionSettings: {
        frequency: "YEAR",
        freeTrialPeriod: { frequency: "DAY", interval: 14 },
      },
      title: "Omega Access Annual",
      description: "Unlimited AI routing — yearly billing with a 14-day free trial",
    },
  },
  lifetime: {
    name: "Omega Access — Lifetime",
    price: "199.99",
    subscription: null,
  },
};

Deno.serve(async (req) => {
  try {
    if (!WIX_API_KEY || !WIX_SITE_ID) {
      console.error("create-checkout: missing WIX_PAYMENTS_API_KEY or WIX_PAYMENTS_SITE_ID");
      return Response.json({ error: "Payments are not configured." }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);

    // Identify the logged-in user (app requires login to upgrade)
    let user: any = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      user = null;
    }
    if (!user || !user.email) {
      return Response.json({ error: "Please log in to upgrade to Omega Access." }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const plan = body.plan;
    if (!plan || !PLANS[plan]) {
      return Response.json({ error: "Invalid plan. Choose monthly, annual, or lifetime." }, { status: 400 });
    }

    const planDef = PLANS[plan];
    const origin = req.headers.get("Origin") || req.headers.get("origin") || "";
    if (!origin) {
      return Response.json({ error: "Could not determine app origin." }, { status: 400 });
    }

    const item: any = {
      name: planDef.name,
      quantity: 1,
      price: planDef.price,
    };
    if (planDef.subscription) {
      item.subscriptionInfo = planDef.subscription;
    }

    const checkoutRes = await fetch(
      "https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": WIX_API_KEY,
          "wix-site-id": WIX_SITE_ID,
        },
        body: JSON.stringify({
          cart: { items: [item], customerInfo: { email: user.email } },
          callbackUrls: {
            postFlowUrl: `${origin}/`,
            thankYouPageUrl: `${origin}/ThankYou`,
          },
        }),
      }
    );

    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok) {
      const msg =
        checkoutData?.details?.applicationError?.description ||
        checkoutData?.message ||
        "Failed to create checkout session.";
      console.error("create-checkout: Wix error", JSON.stringify(checkoutData));
      return Response.json({ error: msg }, { status: 400 });
    }

    const checkoutSession = checkoutData.checkoutSession;

    // Persist a pending subscription record linked to the logged-in user via checkout_id.
    // The webhook correlates by order.checkoutId === checkoutSession.id.
    try {
      await base44.asServiceRole.entities.Subscription.create({
        user_email: user.email,
        checkout_id: checkoutSession.id,
        plan,
        status: "pending",
      });
    } catch (e) {
      console.error("create-checkout: failed to persist pending subscription:", e.message);
    }

    return Response.json({
      redirectUrl: checkoutSession.redirectUrl,
      checkoutId: checkoutSession.id,
    });
  } catch (error) {
    console.error("create-checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});