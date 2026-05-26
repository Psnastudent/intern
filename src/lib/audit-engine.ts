/**
 * Audit Engine — Rule-Based AI Spend Optimizer
 *
 * This is the core business logic. It evaluates each tool a user is paying for
 * and produces defensible, finance-rational recommendations.
 *
 * Design decisions:
 * - All logic is hardcoded/rule-based (not AI) — knowing when NOT to use AI is key.
 * - Every recommendation traces back to real pricing data.
 * - Recommendations are conservative — we never fabricate savings.
 */

import {
  getToolById,
  type ToolInfo,
  type PlanInfo,
  type UseCase,
} from "./pricing-data";

/* ─── Input types ─────────────────────────────────────────────── */
export interface ToolEntry {
  toolId: string;
  planName: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  primaryUseCase: UseCase;
}

/* ─── Output types ────────────────────────────────────────────── */
export type RecommendationType =
  | "downgrade"
  | "switch_tool"
  | "switch_plan"
  | "use_credits"
  | "optimal"
  | "upgrade_for_value";

export interface Recommendation {
  type: RecommendationType;
  action: string;
  reason: string;
  currentMonthly: number;
  recommendedMonthly: number;
  monthlySavings: number;
  annualSavings: number;
  confidence: "high" | "medium" | "low";
}

export interface ToolAuditResult {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  seats: number;
  recommendations: Recommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  status: "overspending" | "optimal" | "could_optimize";
}

export interface AuditResult {
  id: string;
  timestamp: string;
  input: AuditInput;
  toolResults: ToolAuditResult[];
  totalCurrentMonthly: number;
  totalRecommendedMonthly: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  overallStatus: "high_savings" | "moderate_savings" | "optimal";
  credexEligible: boolean;
}

/* ─── Helper: find cheaper same-vendor plans ──────────────────── */
function findCheaperSameVendorPlans(
  tool: ToolInfo,
  currentPlan: PlanInfo,
  seats: number,
  useCase: UseCase
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const plan of tool.plans) {
    if (plan.name === currentPlan.name) continue;
    if (plan.isUsageBased) continue;

    const planPrice = plan.pricePerUserPerMonth;
    const currentPrice = currentPlan.pricePerUserPerMonth;

    // Skip if same or more expensive
    if (planPrice >= currentPrice) continue;

    // Skip if plan has minimum seats that don't fit
    if (plan.minSeats && seats < plan.minSeats) continue;

    // Skip if the cheaper plan doesn't support the use case
    if (!plan.bestFor.includes(useCase) && plan.bestFor.length > 0) continue;

    const currentMonthly = currentPrice * seats;
    const recommendedMonthly = planPrice * seats;
    const monthlySavings = currentMonthly - recommendedMonthly;

    if (monthlySavings <= 0) continue;

    // Generate a specific, defensible reason
    let reason = "";
    if (
      currentPlan.minSeats &&
      currentPlan.minSeats > 1 &&
      seats <= 3 &&
      !plan.minSeats
    ) {
      reason = `Your ${seats}-person team is on ${currentPlan.name} (designed for ${currentPlan.minSeats}+ seats). ${plan.name} at $${planPrice}/user/month provides comparable individual capabilities without the team overhead, saving $${monthlySavings.toFixed(0)}/month.`;
    } else if (currentPlan.name.includes("Enterprise") || currentPlan.name.includes("Ultra") || currentPlan.name.includes("Max")) {
      reason = `You're on the ${currentPlan.name} plan ($${currentPrice}/user/month) which includes premium features like ${currentPlan.features.slice(0, 2).join(" and ")}. If your team doesn't fully utilize these, ${plan.name} at $${planPrice}/user/month covers ${plan.features.slice(0, 2).join(" and ")} — saving $${monthlySavings.toFixed(0)}/month.`;
    } else {
      reason = `${plan.name} ($${planPrice}/user/month) provides ${plan.features[0]} for your ${useCase} workflow. Switching from ${currentPlan.name} saves $${monthlySavings.toFixed(0)}/month across ${seats} seat${seats > 1 ? "s" : ""}.`;
    }

    recommendations.push({
      type: "downgrade",
      action: `Switch to ${tool.name} ${plan.name}`,
      reason,
      currentMonthly,
      recommendedMonthly,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      confidence: monthlySavings > 50 ? "high" : "medium",
    });
  }

  // Sort by savings (highest first) and return top 2
  return recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings).slice(0, 2);
}

/* ─── Helper: find alternative tools ──────────────────────────── */
function findAlternativeTools(
  currentTool: ToolInfo,
  currentPlan: PlanInfo,
  seats: number,
  useCase: UseCase
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const currentMonthly = currentPlan.pricePerUserPerMonth * seats;

  for (const altId of currentTool.alternatives) {
    const altTool = getToolById(altId);
    if (!altTool) continue;

    // Find best-fit plan from the alternative tool
    const altPlans = altTool.plans
      .filter(
        (p) =>
          !p.isUsageBased &&
          p.bestFor.includes(useCase) &&
          p.pricePerUserPerMonth > 0 &&
          p.pricePerUserPerMonth < currentPlan.pricePerUserPerMonth &&
          (!p.minSeats || seats >= p.minSeats)
      )
      .sort((a, b) => a.pricePerUserPerMonth - b.pricePerUserPerMonth);

    if (altPlans.length === 0) continue;

    const bestAlt = altPlans[0];
    const recommendedMonthly = bestAlt.pricePerUserPerMonth * seats;
    const monthlySavings = currentMonthly - recommendedMonthly;

    if (monthlySavings <= 0) continue;

    const savingsPercent = Math.round((monthlySavings / currentMonthly) * 100);

    let reason = `${altTool.name} ${bestAlt.name} at $${bestAlt.pricePerUserPerMonth}/user/month offers ${bestAlt.features[0]} for your ${useCase} workflow. Compared to ${currentTool.name} ${currentPlan.name} ($${currentPlan.pricePerUserPerMonth}/user/month), this represents a ${savingsPercent}% cost reduction — saving $${monthlySavings.toFixed(0)}/month across ${seats} seat${seats > 1 ? "s" : ""}.`;

    // Special reasoning for IDE tools
    if (currentTool.category === "ide" && altTool.category === "ide") {
      reason = `Your team uses ${currentTool.name} ${currentPlan.name} ($${currentPlan.pricePerUserPerMonth}/user/month). ${altTool.name} ${bestAlt.name} provides similar AI-assisted coding capabilities (${bestAlt.features.slice(0, 2).join(", ")}) at $${bestAlt.pricePerUserPerMonth}/user/month — a ${savingsPercent}% reduction, saving $${monthlySavings.toFixed(0)}/month.`;
    }

    // Special reasoning for chat tools
    if (currentTool.category === "chat" && altTool.category === "chat") {
      reason = `Based on your ${useCase}-heavy workflow, ${altTool.name} ${bestAlt.name} ($${bestAlt.pricePerUserPerMonth}/user/month) provides comparable capability to ${currentTool.name} ${currentPlan.name} ($${currentPlan.pricePerUserPerMonth}/user/month) while reducing monthly spend by ${savingsPercent}% — saving $${monthlySavings.toFixed(0)}/month.`;
    }

    recommendations.push({
      type: "switch_tool",
      action: `Consider ${altTool.name} ${bestAlt.name}`,
      reason,
      currentMonthly,
      recommendedMonthly,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      confidence: savingsPercent > 30 ? "high" : "medium",
    });
  }

  return recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings).slice(0, 2);
}

/* ─── Helper: check team plan overkill ────────────────────────── */
function checkTeamPlanOverkill(
  tool: ToolInfo,
  currentPlan: PlanInfo,
  seats: number,
  useCase: UseCase
): Recommendation | null {
  // Team/Business/Enterprise plans are overkill for very small teams
  const isTeamPlan =
    currentPlan.name.toLowerCase().includes("team") ||
    currentPlan.name.toLowerCase().includes("business") ||
    currentPlan.name.toLowerCase().includes("enterprise");

  if (!isTeamPlan || seats > 3) return null;

  // Find the best individual plan
  const individualPlans = tool.plans
    .filter(
      (p) =>
        !p.isUsageBased &&
        !p.name.toLowerCase().includes("team") &&
        !p.name.toLowerCase().includes("business") &&
        !p.name.toLowerCase().includes("enterprise") &&
        p.pricePerUserPerMonth > 0 &&
        p.pricePerUserPerMonth < currentPlan.pricePerUserPerMonth &&
        p.bestFor.includes(useCase)
    )
    .sort(
      (a, b) =>
        b.pricePerUserPerMonth - a.pricePerUserPerMonth
    );

  if (individualPlans.length === 0) return null;

  const bestIndividual = individualPlans[0];
  const currentMonthly = currentPlan.pricePerUserPerMonth * seats;
  const recommendedMonthly = bestIndividual.pricePerUserPerMonth * seats;
  const monthlySavings = currentMonthly - recommendedMonthly;

  if (monthlySavings <= 0) return null;

  const teamFeatures = currentPlan.features
    .filter(
      (f) =>
        f.toLowerCase().includes("admin") ||
        f.toLowerCase().includes("sso") ||
        f.toLowerCase().includes("centralized") ||
        f.toLowerCase().includes("rbac") ||
        f.toLowerCase().includes("scim")
    )
    .join(", ");

  return {
    type: "downgrade",
    action: `Switch ${seats} seats to ${tool.name} ${bestIndividual.name}`,
    reason: `Your ${seats}-person team is paying for ${currentPlan.name} ($${currentPlan.pricePerUserPerMonth}/user/month) which includes organizational features (${teamFeatures || "admin controls, centralized billing"}). With only ${seats} user${seats > 1 ? "s" : ""}, individual ${bestIndividual.name} plans at $${bestIndividual.pricePerUserPerMonth}/user/month provide the same core AI capabilities without the team management overhead — saving $${monthlySavings.toFixed(0)}/month.`,
    currentMonthly,
    recommendedMonthly,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    confidence: "high",
  };
}

/* ─── Helper: credit opportunity ──────────────────────────────── */
function checkCreditOpportunity(
  tool: ToolInfo,
  currentPlan: PlanInfo,
  seats: number
): Recommendation | null {
  const currentMonthly = currentPlan.pricePerUserPerMonth * seats;

  // Credits are most relevant for higher-spend tools
  if (currentMonthly < 100) return null;

  // Credex typically offers 15-30% savings via credits
  const creditDiscount = 0.2; // conservative 20%
  const monthlySavings = currentMonthly * creditDiscount;

  return {
    type: "use_credits",
    action: `Get discounted ${tool.name} credits through Credex`,
    reason: `Credex sources discounted AI infrastructure credits from companies that over-forecasted or pivoted. For your $${currentMonthly.toFixed(0)}/month ${tool.name} spend, this could represent approximately $${monthlySavings.toFixed(0)}/month in additional savings (~20% discount) on top of any plan optimization.`,
    currentMonthly,
    recommendedMonthly: currentMonthly - monthlySavings,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    confidence: "medium",
  };
}

/* ─── Helper: check annual billing savings ────────────────────── */
function checkAnnualBilling(
  tool: ToolInfo,
  currentPlan: PlanInfo,
  seats: number
): Recommendation | null {
  if (!currentPlan.annualPricePerUserPerMonth) return null;
  if (currentPlan.annualPricePerUserPerMonth >= currentPlan.pricePerUserPerMonth)
    return null;

  const currentMonthly = currentPlan.pricePerUserPerMonth * seats;
  const annualMonthly = currentPlan.annualPricePerUserPerMonth * seats;
  const monthlySavings = currentMonthly - annualMonthly;

  if (monthlySavings <= 0) return null;

  const savingsPercent = Math.round(
    (monthlySavings / currentMonthly) * 100
  );

  return {
    type: "switch_plan",
    action: `Switch to annual billing for ${tool.name} ${currentPlan.name}`,
    reason: `You're paying month-to-month for ${tool.name} ${currentPlan.name} at $${currentPlan.pricePerUserPerMonth}/user/month. Switching to annual billing drops this to $${currentPlan.annualPricePerUserPerMonth}/user/month — a ${savingsPercent}% discount that saves $${monthlySavings.toFixed(0)}/month ($${(monthlySavings * 12).toFixed(0)}/year) across ${seats} seat${seats > 1 ? "s" : ""}.`,
    currentMonthly,
    recommendedMonthly: annualMonthly,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    confidence: "high",
  };
}

/* ─── Main Audit Function ─────────────────────────────────────── */
export function runAudit(input: AuditInput): AuditResult {
  const toolResults: ToolAuditResult[] = [];

  for (const entry of input.tools) {
    const tool = getToolById(entry.toolId);
    if (!tool) continue;

    const currentPlan = tool.plans.find(
      (p) => p.name.toLowerCase() === entry.planName.toLowerCase()
    );
    if (!currentPlan) continue;

    const recommendations: Recommendation[] = [];

    // 1. Check if team plan is overkill for small teams
    const teamOverkill = checkTeamPlanOverkill(
      tool,
      currentPlan,
      entry.seats,
      input.primaryUseCase
    );
    if (teamOverkill) recommendations.push(teamOverkill);

    // 2. Find cheaper same-vendor plans
    const cheaperPlans = findCheaperSameVendorPlans(
      tool,
      currentPlan,
      entry.seats,
      input.primaryUseCase
    );
    recommendations.push(...cheaperPlans);

    // 3. Find alternative tools
    const alternatives = findAlternativeTools(
      tool,
      currentPlan,
      entry.seats,
      input.primaryUseCase
    );
    recommendations.push(...alternatives);

    // 4. Check annual billing opportunity
    const annualSavings = checkAnnualBilling(tool, currentPlan, entry.seats);
    if (annualSavings) recommendations.push(annualSavings);

    // 5. Check Credex credit opportunity
    const creditOpp = checkCreditOpportunity(tool, currentPlan, entry.seats);
    if (creditOpp) recommendations.push(creditOpp);

    // Deduplicate and sort
    const dedupedRecs = recommendations
      .filter(
        (r, i, arr) =>
          arr.findIndex((x) => x.action === r.action) === i
      )
      .sort((a, b) => b.monthlySavings - a.monthlySavings);

    // Calculate total savings (take the best non-credit recommendation)
    const bestNonCredit = dedupedRecs.find((r) => r.type !== "use_credits");
    const totalMonthlySavings = bestNonCredit?.monthlySavings ?? 0;

    const status: ToolAuditResult["status"] =
      totalMonthlySavings > 50
        ? "overspending"
        : totalMonthlySavings > 0
          ? "could_optimize"
          : "optimal";

    // If optimal, add a positive note
    if (dedupedRecs.length === 0) {
      dedupedRecs.push({
        type: "optimal",
        action: "No changes recommended",
        reason: `You're on ${tool.name} ${currentPlan.name} at $${currentPlan.pricePerUserPerMonth}/user/month with ${entry.seats} seat${entry.seats > 1 ? "s" : ""}. This plan is well-fitted for your ${input.primaryUseCase} use case and team size. You're spending efficiently.`,
        currentMonthly: entry.monthlySpend,
        recommendedMonthly: entry.monthlySpend,
        monthlySavings: 0,
        annualSavings: 0,
        confidence: "high",
      });
    }

    toolResults.push({
      toolId: entry.toolId,
      toolName: tool.name,
      currentPlan: entry.planName,
      currentMonthlySpend: entry.monthlySpend,
      seats: entry.seats,
      recommendations: dedupedRecs,
      totalMonthlySavings,
      totalAnnualSavings: totalMonthlySavings * 12,
      status,
    });
  }

  const totalCurrentMonthly = toolResults.reduce(
    (sum, r) => sum + r.currentMonthlySpend,
    0
  );
  const totalMonthlySavings = toolResults.reduce(
    (sum, r) => sum + r.totalMonthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  const overallStatus: AuditResult["overallStatus"] =
    totalMonthlySavings > 500
      ? "high_savings"
      : totalMonthlySavings > 0
        ? "moderate_savings"
        : "optimal";

  return {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    input,
    toolResults,
    totalCurrentMonthly,
    totalRecommendedMonthly: totalCurrentMonthly - totalMonthlySavings,
    totalMonthlySavings,
    totalAnnualSavings,
    overallStatus,
    credexEligible: totalMonthlySavings > 500,
  };
}

/** Generate a short, shareable audit ID */
function generateAuditId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
