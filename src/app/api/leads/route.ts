import { NextRequest } from "next/server";

/**
 * POST /api/leads
 * Captures lead data from the email form.
 *
 * In production, this would store to Supabase/Firebase.
 * For the MVP, we log and return success.
 *
 * Rate limiting: simple IP-based (in-memory for MVP).
 * Abuse protection: honeypot field check.
 */

const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const limiter = rateLimit.get(ip);

    if (limiter) {
      if (now - limiter.timestamp < RATE_LIMIT_WINDOW) {
        if (limiter.count >= RATE_LIMIT_MAX) {
          return Response.json(
            { error: "Rate limit exceeded. Please try again later." },
            { status: 429 }
          );
        }
        limiter.count++;
      } else {
        rateLimit.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }

    const body = await request.json();

    const { email, company, role, teamSize, auditId, totalSavings, credexEligible, _honeypot } =
      body;

    // Honeypot check — if this hidden field is filled, it's a bot
    if (_honeypot) {
      // Return success silently to not alert the bot
      return Response.json({ success: true });
    }

    // Validate email
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    // In production: store to Supabase
    // const { data, error } = await supabase.from('leads').insert({ ... });

    // For MVP: log the lead
    console.log("[Lead Captured]", {
      email,
      company: company || null,
      role: role || null,
      teamSize: teamSize || null,
      auditId,
      totalSavings,
      credexEligible,
      timestamp: new Date().toISOString(),
      ip,
    });

    // In production: send transactional email via Resend/Postmark
    // await resend.emails.send({ ... });

    return Response.json({
      success: true,
      message: "Lead captured successfully",
    });
  } catch {
    return Response.json(
      { error: "Failed to capture lead" },
      { status: 500 }
    );
  }
}
