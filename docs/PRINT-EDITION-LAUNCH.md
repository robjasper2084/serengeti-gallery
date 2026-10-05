# Detroit, Life & Light print launch

The 21 uploaded files are copied unchanged and SHA-256 verified. Credits and
dimensions are recorded in `public/assets/exhibitions/life-and-light/credits.json`.
These web copies are exhibition references, not approved print masters.
No AI image generation or paid media credits were used.

Six draft listings: Winter River Light, Red Sun over Detroit, Beneath the Clouds,
Blossoms and a Companion, Lightning over Detroit, and Yellow Current.
Descriptive titles are gallery labels. Artist credit for Yellow Current and Night
Rider is pending. Confirm credit and sale provenance before selling those works.

USD prices: 5×7 $25; 8×10 $45; 11×14 $85; 16×20 $165; signed 16×20 $300;
framed 16×20 $375. Preserve each composition with borders, rather than cropping
to paper aspect ratios. Confirm signing, frame specification, paper, print proof,
production cost, shipping coverage and return terms with the actual printer.
Do not upscale these social copies and call them archival print masters.

## Activate orders

1. Reconnect the merchant Stripe account. No credentials are present in this
   static website, and the current connector requires reauthentication.
2. Obtain and approve suitable full-resolution masters and a physical proof for
   each offered size. Confirm all applicable artist credits and sale provenance.
3. Choose a printer and arrange fulfillment, shipping destinations/rates, lead
   times, returns and support. Configure applicable taxes after confirming the
   merchant's registrations. Do not promise archival materials without a printer
   specification and approved proof.
4. Create a one-time Stripe Payment Link for each approved artwork/edition using
   merchant-controlled prices, shipping address collection and approved shipping
   rates. Restrict quantities to the actual edition inventory where applicable.
   Do not put secret or restricted API keys in this repository or browser code.
5. Configure a server-side fulfillment receiver with Stripe signature validation
   and durable idempotency by Checkout Session ID. Handle both
   `checkout.session.completed` and `checkout.session.async_payment_succeeded`,
   and fulfill only when `payment_status` is `paid`. Record delivery/refund states.
   GitHub Pages cannot host this receiver. A success page never triggers shipping.
6. Verify prices, taxes, shipping and webhook delivery in a separate Stripe
   sandbox, then enable only the approved live links in `public/print-checkout.json`.
   The browser accepts only live HTTPS `buy.stripe.com` links. This allowlist is
   a fail-closed display gate, not a substitute for merchant configuration.
7. Test a real checkout handoff without placing an unauthorized purchase, verify
   every edition and fulfillment setting, then publish the readiness update.

Example configuration for ONE approved edition (replace the example URL; do not
enable the flags until the corresponding work has been completed):

```json
{
  "currency": "USD",
  "fulfillment": {"ready": true, "shippingReady": true, "webhookReady": true},
  "editions": {
    "life-light-winter-river-light:small": {
      "sourceApproved": true,
      "proofApproved": true,
      "saleApproved": true,
      "checkoutUrl": "https://buy.stripe.com/REPLACEWITHLIVELINK"
    }
  }
}
```

All flags currently remain false. The published listings clearly say they are
in preparation and accept no payments.

Primary setup references: https://docs.stripe.com/payment-links and
https://docs.stripe.com/checkout/fulfillment.
