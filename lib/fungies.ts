/**
 * Fungies.io API client setup.
 * Fungies is a global Merchant of Record handling checkout, payments, and subscriptions.
 */

export const FUNGIES_PUBLIC_KEY = process.env.FUNGIES_PUBLIC_KEY!
export const FUNGIES_SECRET_KEY = process.env.FUNGIES_SECRET_KEY!
export const FUNGIES_WEBHOOK_SECRET = process.env.FUNGIES_WEBHOOK_SECRET!

export const FUNGIES_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@fungies/js@latest"

/**
 * Plan IDs in Fungies. Replace these with your actual Fungies product/plan IDs.
 * These are used to build checkout URLs.
 */
export const FUNGIES_PLAN_IDS = {
  monthly: process.env.FUNGIES_MONTHLY_PLAN_ID ?? "",
  annual: process.env.FUNGIES_ANNUAL_PLAN_ID ?? "",
} as const

export type FungiesPlan = "monthly" | "annual"

/**
 * Builds a Fungies checkout URL with email prefill and userId custom field.
 *
 * @param plan - "monthly" or "annual"
 * @param email - user's email for prefill
 * @param userId - Supabase user ID, passed as a custom field so the webhook can identify the user
 * @returns the full checkout URL
 */
export function buildCheckoutUrl(plan: FungiesPlan, email: string, userId: string): string {
  const productId = FUNGIES_PLAN_IDS[plan]
  if (!productId) {
    throw new Error(`Fungies plan ID not configured for plan: ${plan}`)
  }

  const base = `https://checkout.fungies.io/p/${productId}`
  const params = new URLSearchParams({
    "fngs-user-email": email,
    "fngs-user-id": userId,
  })

  return `${base}?${params.toString()}`
}

/**
 * Verifies the Fungies webhook signature using the secret key.
 *
 * Fungies signs webhooks with the secret key. The signature is typically
 * sent in the `x-fungies-signature` header. We compare it against an
 * HMAC-SHA256 digest of the raw body.
 *
 * @param body - raw request body as string
 * @param signature - signature from the `x-fungies-signature` header
 * @returns true if the signature is valid
 */
export function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !FUNGIES_WEBHOOK_SECRET) {
    return false
  }

  try {
    const encoder = new TextEncoder()
    const key = encoder.encode(FUNGIES_WEBHOOK_SECRET)

    // Use Web Crypto API (available in the Edge runtime)
    return crypto.subtle
      .importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
      .then((cryptoKey) =>
        crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body)),
      )
      .then((sig) => {
        const expected = Array.from(new Uint8Array(sig))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
        return expected === signature
      })
  } catch {
    return false
  }
}

/**
 * Determines the billing interval from the webhook payload.
 * Fungies payloads may include an `interval` or `billing_cycle` field.
 *
 * @returns "monthly" or "annual", defaulting to "monthly"
 */
export function detectInterval(payload: Record<string, unknown>): FungiesPlan {
  const interval =
    (payload.interval as string | undefined) ??
    (payload.billing_cycle as string | undefined) ??
    (payload.plan_interval as string | undefined) ??
    "monthly"

  const lower = interval.toLowerCase()
  if (lower.includes("year") || lower.includes("annual")) {
    return "annual"
  }
  return "monthly"
}

/**
 * Calculates the renewal end date based on the plan interval.
 *
 * @param plan - "monthly" or "annual"
 * @param from - starting date (defaults to now)
 * @returns ISO string of the renewal end date
 */
export function calculateRenewalEnd(plan: FungiesPlan, from: Date = new Date()): string {
  const end = new Date(from)
  if (plan === "annual") {
    end.setDate(end.getDate() + 365)
  } else {
    end.setDate(end.getDate() + 30)
  }
  return end.toISOString()
}

/**
 * Calculates the trial end date (3 days from now).
 * The trial end date is also the first billing date.
 */
export function calculateTrialEnd(from: Date = new Date()): string {
  const end = new Date(from)
  end.setDate(end.getDate() + 3)
  return end.toISOString()
}
