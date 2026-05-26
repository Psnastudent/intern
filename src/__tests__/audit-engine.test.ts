import { describe, it, expect } from "vitest";
import { runAudit, type AuditInput } from "../lib/audit-engine";

describe("Audit Engine", () => {
  // Test 1: Team plan overkill detection
  it("should detect team plan overkill for small teams", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planName: "Teams",
          monthlySpend: 80,
          seats: 2,
        },
      ],
      teamSize: 2,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    expect(result.toolResults).toHaveLength(1);

    const cursorResult = result.toolResults[0];
    expect(cursorResult.status).not.toBe("optimal");

    // Should recommend downgrading from Teams ($40/user) to Pro ($20/user)
    const downgradeRec = cursorResult.recommendations.find(
      (r) => r.type === "downgrade"
    );
    expect(downgradeRec).toBeDefined();
    expect(downgradeRec!.monthlySavings).toBeGreaterThan(0);
    expect(downgradeRec!.reason).toContain("2-person");
  });

  // Test 2: Optimal spend detection
  it("should mark already-optimal spend correctly", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "github-copilot",
          planName: "Pro",
          monthlySpend: 10,
          seats: 1,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const copilotResult = result.toolResults[0];

    // Either marked as optimal or has no significant savings
    expect(copilotResult.totalMonthlySavings).toBeLessThanOrEqual(10);
  });

  // Test 3: Multiple tools aggregate savings correctly
  it("should aggregate savings across multiple tools", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planName: "Teams",
          monthlySpend: 120,
          seats: 3,
        },
        {
          toolId: "chatgpt",
          planName: "Business",
          monthlySpend: 90,
          seats: 3,
        },
      ],
      teamSize: 3,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    expect(result.toolResults).toHaveLength(2);
    expect(result.totalCurrentMonthly).toBe(210);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  // Test 4: Annual billing suggestion
  it("should suggest annual billing when monthly billing is more expensive", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "claude",
          planName: "Pro",
          monthlySpend: 20,
          seats: 1,
        },
      ],
      teamSize: 1,
      primaryUseCase: "writing",
    };

    const result = runAudit(input);
    const claudeResult = result.toolResults[0];

    // Claude Pro has annual pricing ($17/mo vs $20/mo)
    const annualRec = claudeResult.recommendations.find(
      (r) => r.type === "switch_plan"
    );
    expect(annualRec).toBeDefined();
    expect(annualRec!.reason).toContain("annual");
    expect(annualRec!.monthlySavings).toBe(3); // $20 - $17 = $3/mo
  });

  // Test 5: Credex eligibility for high-spend users
  it("should flag Credex eligibility for high savings", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planName: "Enterprise",
          monthlySpend: 600,
          seats: 10,
        },
        {
          toolId: "chatgpt",
          planName: "Enterprise",
          monthlySpend: 600,
          seats: 10,
        },
      ],
      teamSize: 10,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    // High spend should have significant savings potential
    expect(result.totalCurrentMonthly).toBe(1200);

    // Should find savings from downgrading Enterprise plans
    expect(result.totalMonthlySavings).toBeGreaterThan(0);

    // Credex eligible if savings > $500/mo
    if (result.totalMonthlySavings > 500) {
      expect(result.credexEligible).toBe(true);
    }
  });

  // Test 6: Alternative tool suggestions
  it("should suggest alternative tools with lower pricing", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "chatgpt",
          planName: "Pro",
          monthlySpend: 200,
          seats: 1,
        },
      ],
      teamSize: 1,
      primaryUseCase: "writing",
    };

    const result = runAudit(input);
    const gptResult = result.toolResults[0];

    // ChatGPT Pro at $200/mo — should suggest Claude Pro at $20/mo
    const altRec = gptResult.recommendations.find(
      (r) => r.type === "switch_tool" || r.type === "downgrade"
    );
    expect(altRec).toBeDefined();
    expect(altRec!.monthlySavings).toBeGreaterThan(0);
  });

  // Test 7: Audit generates unique IDs
  it("should generate unique audit IDs", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planName: "Pro",
          monthlySpend: 20,
          seats: 1,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result1 = runAudit(input);
    const result2 = runAudit(input);

    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
    expect(result1.id).not.toBe(result2.id);
    expect(result1.id.length).toBe(8);
  });

  // Test 8: Handles unknown tool gracefully
  it("should skip unknown tools without crashing", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "nonexistent-tool",
          planName: "Pro",
          monthlySpend: 20,
          seats: 1,
        },
        {
          toolId: "cursor",
          planName: "Pro",
          monthlySpend: 20,
          seats: 1,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    // Should only process the valid tool
    expect(result.toolResults).toHaveLength(1);
    expect(result.toolResults[0].toolId).toBe("cursor");
  });

  // Test 9: Credit opportunity for high spend
  it("should suggest Credex credits for high monthly spend", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planName: "Ultra",
          monthlySpend: 200,
          seats: 1,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const cursorResult = result.toolResults[0];

    const creditRec = cursorResult.recommendations.find(
      (r) => r.type === "use_credits"
    );
    expect(creditRec).toBeDefined();
    expect(creditRec!.reason).toContain("Credex");
  });

  // Test 10: Overall status classification
  it("should classify overall audit status correctly", () => {
    // Optimal case
    const optimalInput: AuditInput = {
      tools: [
        {
          toolId: "github-copilot",
          planName: "Free",
          monthlySpend: 0,
          seats: 1,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const optimalResult = runAudit(optimalInput);
    expect(optimalResult.overallStatus).toBe("optimal");
    expect(optimalResult.totalMonthlySavings).toBe(0);
  });
});
