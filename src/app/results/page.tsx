"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  TrendingDown,
  Check,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Mail,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BadgeDollarSign,
  BarChart3,
} from "lucide-react";
import type { AuditResult, ToolAuditResult, Recommendation } from "@/lib/audit-engine";

/* ─── Animated counter ────────────────────────────────────────── */
function AnimCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className = "",
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const ctrl = animate(count, target, { duration, ease: "easeOut" });
    const unsub = rounded.on("change", setDisplay);
    return () => { ctrl.stop(); unsub(); };
  }, [count, rounded, target, duration]);

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}

/* ─── Status badge component ──────────────────────────────────── */
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

/* ─── Recommendation card ─────────────────────────────────────── */
function RecommendationCard({
  rec,
  index,
}: {
  rec: Recommendation;
  index: number;
}) {
  const typeConfig = {
    downgrade: { color: "text-accent", label: "Plan Downgrade" },
    switch_tool: { color: "text-accent", label: "Alternative Tool" },
    switch_plan: { color: "text-yellow-600", label: "Billing Optimization" },
    use_credits: { color: "text-purple-600", label: "Credex Credits" },
    optimal: { color: "text-accent", label: "Already Optimal" },
    upgrade_for_value: { color: "text-accent", label: "Value Upgrade" },
  };

  const tc = typeConfig[rec.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className={`text-xs font-semibold tracking-wide ${tc.color}`}>
            {tc.label}
          </span>
          <h4 className="font-semibold text-foreground text-sm mt-1">
            {rec.action}
          </h4>
        </div>
        {rec.monthlySavings > 0 && (
          <span className="text-accent font-bold text-sm whitespace-nowrap bg-accent/10 px-2 py-1 rounded-lg">
            -${rec.monthlySavings.toFixed(0)}/mo
          </span>
        )}
      </div>
      <p className="text-gray-600 font-medium text-sm leading-relaxed mt-2">{rec.reason}</p>
      {rec.confidence && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              rec.confidence === "high"
                ? "bg-accent"
                : rec.confidence === "medium"
                  ? "bg-yellow-500"
                  : "bg-gray-400"
            }`}
          />
          <span className="text-xs font-semibold text-gray-500 capitalize">
            {rec.confidence} confidence
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Tool result section ─────────────────────────────────────── */
function ToolResultCard({
  result,
  index,
}: {
  result: ToolAuditResult;
  index: number;
}) {
  const [expanded, setExpanded] = useState(
    result.status === "overspending"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.3 }}
      className="glass-panel rounded-2xl mb-4 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 md:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h3 className="font-bold text-lg text-foreground">
                {result.toolName}
              </h3>
              <StatusBadge status={result.status} />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {result.currentPlan} · {result.seats} seat
              {result.seats > 1 ? "s" : ""} · $
              {result.currentMonthlySpend.toFixed(0)}/mo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {result.totalMonthlySavings > 0 && (
            <span className="text-accent font-semibold text-base">
              Save ${result.totalMonthlySavings.toFixed(0)}/mo
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 md:px-6 pb-5 md:pb-6 space-y-4 border-t border-gray-100 pt-6 bg-gray-50/30"
        >
          {result.recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} index={i} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Email Capture Modal ─────────────────────────────────────── */
function EmailCapture({
  result,
  onClose,
}: {
  result: AuditResult;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          role,
          teamSize: result.input.teamSize,
          auditId: result.id,
          totalSavings: result.totalAnnualSavings,
          credexEligible: result.credexEligible,
        }),
      });
    } catch {
      // Fail silently
    }

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-3xl p-6 md:p-10 max-w-md w-full relative bg-white shadow-2xl border-0"
      >
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Report Saved!</h3>
            <p className="text-gray-600 font-medium mb-8">
              We&apos;ll send your full audit report to {email}.
              {result.credexEligible &&
                " A Credex specialist will reach out about your savings opportunity."}
            </p>
            <button onClick={onClose} className="btn-primary w-full py-3">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-2xl text-foreground">
                Get Your Report
              </h3>
              <p className="text-sm font-medium text-gray-500">
                We&apos;ll email your complete audit with action items.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="work@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="clean-input"
                id="email-capture"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="clean-input"
                />
                <input
                  type="text"
                  placeholder="Role (optional)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="clean-input"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send my report
                  </>
                )}
              </button>
            </form>

            {result.credexEligible && (
              <div className="mt-6 p-4 rounded-xl bg-purple-50 border border-purple-100">
                <p className="text-xs text-purple-700 flex items-start gap-2 font-medium">
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Your audit shows &gt;$500/mo in potential savings. A Credex
                    specialist can help you capture even more through discounted
                    AI credits.
                  </span>
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── AI Summary Component ────────────────────────────────────── */
function AISummary({ result }: { result: AuditResult }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditResult: result }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setSummary(data.summary);
    } catch {
      // Fallback to template summary
      setError(true);
      const tools = result.toolResults.map((t) => t.toolName).join(", ");
      const topSaving = result.toolResults
        .filter((t) => t.totalMonthlySavings > 0)
        .sort((a, b) => b.totalMonthlySavings - a.totalMonthlySavings)[0];

      let fallback = `Your team of ${result.input.teamSize} is spending $${result.totalCurrentMonthly.toFixed(0)}/month on AI tools (${tools}).`;

      if (result.totalMonthlySavings > 0) {
        fallback += ` Our analysis identified $${result.totalMonthlySavings.toFixed(0)}/month ($${result.totalAnnualSavings.toFixed(0)}/year) in potential savings.`;
        if (topSaving) {
          fallback += ` The biggest opportunity is your ${topSaving.toolName} subscription, where a plan change could save $${topSaving.totalMonthlySavings.toFixed(0)}/month alone.`;
        }
      } else {
        fallback += ` Your current stack is well-optimized — you're spending efficiently for your use case.`;
      }

      if (result.credexEligible) {
        fallback += ` With savings exceeding $500/month, you may qualify for additional discounts through Credex's discounted AI credit program.`;
      }

      setSummary(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <Sparkles className="w-5 h-5 text-accent" />
        <span className="text-lg font-semibold text-foreground">
          Executive Summary
        </span>
        {error && (
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md ml-auto">
            Fallback Used
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex items-center gap-3 font-medium text-gray-500 py-6">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <span>Analyzing stack...</span>
        </div>
      ) : (
        <p className="font-medium text-[15px] leading-relaxed text-gray-700">
          {summary}
        </p>
      )}
    </motion.div>
  );
}

/* ─── Results Content (uses searchParams) ─────────────────────── */
function ResultsContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("spendpilot_audit_result");
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResult(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${result?.id}`
      : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative z-10">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <p className="text-gray-500 font-medium">Loading your audit results...</p>
        <Link
          href="/audit"
          className="text-accent text-sm hover:underline font-medium"
        >
          Or start a new audit →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 flex flex-col">

      {/* Nav */}
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-foreground text-sm font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
              id="share-btn"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-gray-500" />
                  Share
                </>
              )}
            </button>
            <button
              onClick={() => setShowEmailCapture(true)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2 shadow-sm"
              id="save-report-btn"
            >
              <Mail className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 flex-1 w-full">
        {/* Back link */}
        <Link
          href="/audit"
          className="inline-flex items-center gap-1.5 font-medium text-sm text-gray-500 hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit stack
        </Link>

        {/* Hero savings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-accent/10 mb-8 shadow-sm">
            <div className="w-2 h-2 bg-accent animate-pulse rounded-full" />
            <span className="font-semibold text-xs tracking-wide text-accent">
              Audit Complete
            </span>
          </div>

          {result.totalMonthlySavings > 0 ? (
            <>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
                You could save <br/>
                <span className="text-accent relative inline-block">
                  <AnimCounter
                    target={result.totalAnnualSavings}
                    prefix="$"
                    suffix="/yr"
                  />
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-gray-600 font-medium max-w-2xl leading-relaxed">
                That&apos;s <span className="font-semibold text-accent">${result.totalMonthlySavings.toFixed(0)}/mo</span> in potential savings across {result.toolResults.length} tool{result.toolResults.length > 1 ? "s" : ""}.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
                Stack <span className="text-accent">Optimized</span>
              </h1>
              <p className="text-xl text-gray-600 font-medium max-w-2xl leading-relaxed">
                Your AI spend is highly efficient. We&apos;ll notify you if new pricing changes affect your stack.
              </p>
            </>
          )}
        </motion.div>

        {/* Summary cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
        >
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center text-center sm:text-left">
            <div className="text-3xl font-bold text-foreground mb-1">
              ${result.totalCurrentMonthly.toFixed(0)}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current /mo</div>
          </div>
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center text-center sm:text-left">
            <div className="text-3xl font-bold text-accent mb-1">
              ${result.totalRecommendedMonthly.toFixed(0)}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Optimized /mo</div>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 flex flex-col justify-center text-center sm:text-left">
            <div className="text-3xl font-bold text-accent mb-1">
              ${result.totalMonthlySavings.toFixed(0)}
            </div>
            <div className="text-xs font-semibold text-accent uppercase tracking-wide">Monthly Savings</div>
          </div>
          <div className="bg-accent text-white rounded-2xl p-6 flex flex-col justify-center text-center sm:text-left shadow-lg shadow-accent/20">
            <div className="text-3xl font-bold mb-1">
              ${result.totalAnnualSavings.toFixed(0)}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-white/90">Annual Savings</div>
          </div>
        </motion.div>

        {/* AI Summary */}
        <div className="mb-14">
          <AISummary result={result} />
        </div>

        {/* Tool-by-tool results */}
        <div className="space-y-6 mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Breakdown
          </h2>
          {result.toolResults.map((tr, i) => (
            <ToolResultCard key={tr.toolId} result={tr} index={i} />
          ))}
        </div>

        {/* Credex CTA for high savings */}
        {result.credexEligible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-foreground text-background rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BadgeDollarSign className="w-48 h-48" />
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
              <div className="max-w-xl">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <BadgeDollarSign className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-3xl font-bold mb-3 text-white">
                  Unlock Exclusive Credits
                </h3>
                <p className="text-lg font-medium text-gray-300 leading-relaxed">
                  With over $500/mo in savings, Credex can negotiate even steeper discounts on your behalf through bulk infrastructure credits.
                </p>
              </div>
              <button
                onClick={() => setShowEmailCapture(true)}
                className="btn-primary bg-white text-foreground hover:bg-gray-100 flex-shrink-0 border-0"
                id="credex-cta"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Book Consultation
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Low savings — be honest */}
        {!result.credexEligible && result.totalMonthlySavings < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl p-8 text-center mb-16"
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              You&apos;re spending well
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6 font-medium">
              Your AI stack is already well-optimized. We&apos;ll keep an eye on
              pricing changes and let you know if new optimization opportunities
              come up.
            </p>
            <button
              onClick={() => setShowEmailCapture(true)}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-foreground text-sm font-medium py-3 px-6 rounded-xl inline-flex items-center gap-2 transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4 text-gray-400" />
              Notify me of new optimizations
            </button>
          </motion.div>
        )}

        {/* Share section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-1 text-foreground">
              Share Audit
            </h3>
            <p className="text-sm font-medium text-gray-500">
              Company details are stripped from shared links.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              readOnly
              value={shareUrl}
              className="clean-input flex-1 md:w-80 text-sm"
              id="share-url"
            />
            <button
              onClick={handleCopyLink}
              className="btn-primary py-3 whitespace-nowrap shadow-sm"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Email capture modal */}
      <AnimatePresence>
        {showEmailCapture && (
          <EmailCapture
            result={result}
            onClose={() => setShowEmailCapture(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Page (with Suspense for useSearchParams) ────────────────── */
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
