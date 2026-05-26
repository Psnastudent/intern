import { NextRequest } from "next/server";
import type { AuditResult } from "@/lib/audit-engine";

/**
 * POST /api/summary
 * Generates an AI-powered personalized summary of the audit.
 * Falls back to a template if the API key is not configured or the API fails.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const auditResult: AuditResult = body.auditResult;

    if (!auditResult) {
      return Response.json({ error: "Missing audit result" }, { status: 400 });
    }

    // Try to use OpenAI API if key is available
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const prompt = buildPrompt(auditResult);
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a financial analyst specializing in SaaS spend optimization. Write a concise, actionable executive summary (100 words max) for a startup's AI tool audit. Be specific with numbers. Be professional but approachable. Do not use markdown formatting.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              max_tokens: 200,
              temperature: 0.7,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const summary = data.choices?.[0]?.message?.content;
          if (summary) {
            return Response.json({ summary, source: "ai" });
          }
        }
      } catch {
        // Fall through to template
      }
    }

    // Fallback: generate a template summary
    const summary = generateTemplateSummary(auditResult);
    return Response.json({ summary, source: "template" });
  } catch {
    return Response.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

function buildPrompt(result: AuditResult): string {
  const toolSummaries = result.toolResults
    .map((t) => {
      const recs = t.recommendations
        .filter((r) => r.type !== "optimal")
        .map(
          (r) =>
            `- ${r.action}: saves $${r.monthlySavings.toFixed(0)}/mo. ${r.reason}`
        )
        .join("\n");

      return `Tool: ${t.toolName} (${t.currentPlan}, ${t.seats} seats, $${t.currentMonthlySpend}/mo)
Status: ${t.status}
Savings: $${t.totalMonthlySavings.toFixed(0)}/mo
Recommendations:
${recs || "- Already optimal"}`;
    })
    .join("\n\n");

  return `Audit for a ${result.input.teamSize}-person team focused on ${result.input.primaryUseCase}.

Current monthly AI spend: $${result.totalCurrentMonthly.toFixed(0)}
Potential monthly savings: $${result.totalMonthlySavings.toFixed(0)}
Potential annual savings: $${result.totalAnnualSavings.toFixed(0)}

${toolSummaries}

${result.credexEligible ? "This team qualifies for Credex discounted credits (>$500/mo savings)." : ""}

Write a ~100 word executive summary highlighting the key findings and top recommendation.`;
}

function generateTemplateSummary(result: AuditResult): string {
  const tools = result.toolResults.map((t) => t.toolName).join(", ");
  const topSaving = result.toolResults
    .filter((t) => t.totalMonthlySavings > 0)
    .sort((a, b) => b.totalMonthlySavings - a.totalMonthlySavings)[0];

  let summary = `Your team of ${result.input.teamSize} is spending $${result.totalCurrentMonthly.toFixed(0)}/month across ${result.toolResults.length} AI tools (${tools}).`;

  if (result.totalMonthlySavings > 0) {
    summary += ` Our analysis identified $${result.totalMonthlySavings.toFixed(0)}/month ($${result.totalAnnualSavings.toFixed(0)}/year) in potential savings.`;
    if (topSaving) {
      summary += ` The biggest opportunity is your ${topSaving.toolName} subscription, where ${topSaving.recommendations[0]?.action || "a plan change"} could save $${topSaving.totalMonthlySavings.toFixed(0)}/month alone.`;
    }
  } else {
    summary += ` Your current stack is well-optimized — you're spending efficiently for your ${result.input.primaryUseCase} use case.`;
  }

  if (result.credexEligible) {
    summary += ` With savings exceeding $500/month, you qualify for additional discounts through Credex's AI credit program.`;
  }

  return summary;
}
