import { Router, raw } from "express";
import { stripe } from "../services/stripe";
import { supabase } from "../services/supabase";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/auth";

export const paymentRoutes = Router();

// Create checkout session for contest entry ($10)
paymentRoutes.post(
  "/create-checkout",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { contest_id } = req.body;

    // Check if user already entered this contest
    const { data: existing } = await supabase
      .from("contest_entries")
      .select("id")
      .eq("contest_id", contest_id)
      .eq("user_id", req.userId!)
      .single();

    if (existing) {
      res.status(400).json({ error: "You have already entered this contest" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Ultimate Streak - Monthly Entry" },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: req.userId!,
        contest_id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/contest/${contest_id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/contest/${contest_id}?payment=cancelled`,
    });

    res.json({ url: session.url });
  }
);

// Stripe webhook
paymentRoutes.post(
  "/webhook",
  raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const contestId = session.metadata?.contest_id;

      if (userId && contestId) {
        // Create contest entry
        await supabase.from("contest_entries").insert({
          contest_id: contestId,
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          stripe_payment_intent_id: session.payment_intent as string,
        });

        // Update prize pool
        await supabase.rpc("increment_prize_pool", {
          p_contest_id: contestId,
          p_amount: 1000,
        });
      }
    }

    res.json({ received: true });
  }
);
