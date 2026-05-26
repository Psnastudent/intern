"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  TrendingDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Share2,
} from "lucide-react";
import type { AuditResult, ToolAuditResult } from "@/lib/audit-engine";

function StatusBadge({ status }: { status: ToolAuditResult["status"] }) {
  const config = {
    overspending: {
      icon: AlertTriangle,
      text: "Overspending",
      className: "bg-red-50 text-red-600 border-red-200",
    },
    could_optimize: {
      icon: TrendingDown,
      text: "Could Optimize",
      className: "bg-yellow-50 text-yellow-600 border-yellow-200",
    },
    optimal: {
      icon: CheckCircle2,
      text: "Optimized",
      className: "bg-accent/10 text-accent border-accent/20",
    },
  };
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${c.className}`}
    >
      <c.icon className="w-3.5 h-3.5" />
      {c.text}
    </span>
  );
}

export default function SharePageClient({ id }: { id: string }) {
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    // Try to load from localStorage (the shared link would only work if the
    // viewer has the data, or in production from a DB lookup)
    try {
      const stored = localStorage.getItem("spendpilot_audit_result");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id === id) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setResult(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [id]);

  if (!result) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
        <div className="glass-panel rounded-3xl p-10 max-w-md text-center relative z-10 w-full">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 text-accent">
            <Share2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">AI Spend Audit</h1>
          <p className="text-gray-500 font-medium mb-8">
            This audit report is available to the original creator. Run your own
            free audit to find savings on your AI tools.
          </p>
          <Link
            href="/audit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <BarChart3 className="w-5 h-5" />
            Start Free Audit
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  // Strip identifying details for the public view
  return (
    <div className="min-h-screen relative flex flex-col">
      <nav className="sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-tight text-lg">
              SpendPilot
            </span>
          </Link>
          <Link
            href="/audit"
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            Run my own audit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 relative z-10 flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-accent/10 mb-6 shadow-sm">
            <Share2 className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent tracking-wide">
              Shared Audit Report
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
            {result.totalMonthlySavings > 0 ? (
              <>
                This team could save <br/>
                <span className="text-accent relative inline-block">
                  ${result.totalAnnualSavings.toFixed(0)}/yr
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            ) : (
              <span className="text-accent">
                This team&apos;s stack is optimized
              </span>
            )}
          </h1>
          <p className="text-lg font-medium text-gray-500">
            {result.input.teamSize}-person team ·{" "}
            <span className="capitalize">{result.input.primaryUseCase}</span> use case ·{" "}
            {result.toolResults.length} tools audited
          </p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-14">
          <div className="glass-panel rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold mb-1 text-foreground">
              ${result.totalCurrentMonthly.toFixed(0)}
            </div>
            <div className="text-xs font-semibold uppercase text-gray-500 tracking-wide">Monthly Spend</div>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold mb-1 text-accent">
              ${result.totalMonthlySavings.toFixed(0)}
            </div>
            <div className="text-xs font-semibold uppercase text-accent tracking-wide">Monthly Savings</div>
          </div>
        </div>

        {/* Tool results (stripped of identifying data) */}
        <div className="space-y-4 mb-16">
          {result.toolResults.map((tr, i) => (
            <motion.div
              key={tr.toolId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-lg text-foreground">
                    {tr.toolName}
                  </h3>
                  <StatusBadge status={tr.status} />
                </div>
                {tr.totalMonthlySavings > 0 && (
                  <span className="text-accent font-semibold text-base">
                    -${tr.totalMonthlySavings.toFixed(0)}/mo
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-500">
                {tr.currentPlan} · {tr.seats} seat
                {tr.seats > 1 ? "s" : ""} · $
                {tr.currentMonthlySpend.toFixed(0)}/mo
              </p>
              {tr.recommendations[0] && tr.recommendations[0].type !== "optimal" && (
                <div className="mt-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                  <p className="text-sm font-medium text-gray-700 flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{tr.recommendations[0].action}</span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-foreground text-background rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3 text-white">
              Find Your Savings
            </h3>
            <p className="font-medium text-gray-400 mb-8 max-w-sm mx-auto">
              Run your own free audit in 2 minutes. No signup needed.
            </p>
            <Link
              href="/audit"
              className="bg-white text-foreground hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl inline-flex items-center justify-center gap-2 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              Start Free Audit
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
