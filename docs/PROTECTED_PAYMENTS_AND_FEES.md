# Protected payments, fees, and payout release

This document describes the implemented platform workflow, not regulated escrow or banking services. AgriculNet records a provider-backed payment as held and applies marketplace release rules before the seller payout is marked released.

## Platform fee

Version marginal-xaf-v1 is paid by the seller and calculated against the order base amount:

- minimum fee: XAF 2,000;
- first XAF 50,000: 5.00%;
- next XAF 200,000: 5.25%;
- next XAF 750,000: 5.50%;
- next XAF 4,000,000: 5.75%;
- remainder above XAF 5,000,000: 6.00%.

Each band is marginal, not a single rate applied to the entire order. The backend rounds once to whole XAF and stores the version, gross amount, tier breakdown, platform fee, fee bearer, and seller net amount with the order.

## Receipt and release

A buyer sees Have you received your order? only after delivery. Yes, I received it records the authenticated owning buyer and timestamp idempotently. Report a problem routes to support/dispute handling.

Release requires all of the following:

1. provider-confirmed funds are held;
2. the matching order is delivered or completed;
3. the owning buyer confirmed receipt;
4. the seller account is active;
5. the seller's authoritative identity review is verified;
6. no open, under-review, or escalated dispute exists;
7. the payment was not already released or refunded;
8. payment and order identities, amount, and currency still match.

An unverified active seller may list, communicate, receive an order, and allow the buyer to pay, but payout remains held. A later verification makes the payment eligible without asking the buyer to confirm receipt again. Admin release remains an audited operation requiring a written reason and explicit confirmation; it does not bypass the database eligibility rules.

Legal, provider, and finance teams should review production wording and settlement obligations before live launch.
