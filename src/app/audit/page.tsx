"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Users,
  ChevronDown,
  Loader2,
  Save,
  BarChart3,
} from "lucide-react";
import { AI_TOOLS, type UseCase } from "@/lib/pricing-data";
import { runAudit, type AuditInput, type ToolEntry } from "@/lib/audit-engine";

const STORAGE_KEY = "spendpilot_audit_form";

const useCaseOptions: { value: UseCase; label: string; emoji: string }[] = [
  { value: "coding", label: "Coding", emoji: "💻" },
  { value: "writing", label: "Writing", emoji: "✍️" },
  { value: "data", label: "Data Analysis", emoji: "📊" },
  { value: "research", label: "Research", emoji: "🔬" },
  { value: "mixed", label: "Mixed / General", emoji: "🔀" },
];

interface FormToolEntry {
  id: string;
  toolId: string;
  planName: string;
  monthlySpend: string;
  seats: string;
}

function createEmptyTool(): FormToolEntry {
  return {
    id: Math.random().toString(36).slice(2, 10),
    toolId: "",
    planName: "",
    monthlySpend: "",
    seats: "1",
  };
}

export default function AuditPage() {
  const router = useRouter();
  const [tools, setTools] = useState<FormToolEntry[]>([createEmptyTool()]);
  const [teamSize, setTeamSize] = useState("1");
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (data.tools && data.tools.length > 0) setTools(data.tools);
        if (data.teamSize) setTeamSize(data.teamSize);
        if (data.useCase) setUseCase(data.useCase);
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tools, teamSize, useCase })
      );
    } catch {
      // ignore quota errors
    }
  }, [tools, teamSize, useCase, loaded]);

  const addTool = () => {
    setTools((prev) => [...prev, createEmptyTool()]);
  };

  const removeTool = (id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTool = (id: string, field: keyof FormToolEntry, value: string) => {
    setTools((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: value };

        // Reset plan when tool changes
        if (field === "toolId") {
          updated.planName = "";
          updated.monthlySpend = "";
        }

        // Auto-calculate monthly spend when plan + seats are set
        if (field === "planName" || field === "seats") {
          const tool = AI_TOOLS.find((at) => at.id === updated.toolId);
          const plan = tool?.plans.find(
            (p) => p.name === updated.planName
          );
          if (plan && !plan.isUsageBased) {
            const seats = parseInt(updated.seats) || 1;
            updated.monthlySpend = (
              plan.pricePerUserPerMonth * seats
            ).toString();
          }
        }

        return updated;
      })
    );
  };

  const getPlansForTool = (toolId: string) => {
    const tool = AI_TOOLS.find((t) => t.id === toolId);
    return tool?.plans ?? [];
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    // Build audit input
    const validTools: ToolEntry[] = tools
      .filter((t) => t.toolId && t.planName && t.monthlySpend)
      .map((t) => ({
        toolId: t.toolId,
        planName: t.planName,
        monthlySpend: parseFloat(t.monthlySpend) || 0,
        seats: parseInt(t.seats) || 1,
      }));

    if (validTools.length === 0) {
      setIsSubmitting(false);
      return;
    }

    const input: AuditInput = {
      tools: validTools,
      teamSize: parseInt(teamSize) || 1,
      primaryUseCase: useCase,
    };

    // Run audit
    const result = runAudit(input);

    // Store result for the results page
    localStorage.setItem("spendpilot_audit_result", JSON.stringify(result));

    // Navigate to results
    router.push(`/results?id=${result.id}`);
  }, [tools, teamSize, useCase, router]);

  const validToolCount = tools.filter(
    (t) => t.toolId && t.planName && t.monthlySpend
  ).length;
  const totalMonthly = tools.reduce(
    (sum, t) => sum + (parseFloat(t.monthlySpend) || 0),
    0
  );

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/50 backdrop-blur-md border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-tight text-lg">
              SpendPilot
            </span>
          </Link>
          <div className="flex items-center gap-4 font-medium text-sm">
            <span className="hidden sm:inline text-gray-600">
              {validToolCount} tool{validToolCount !== 1 ? "s" : ""} added
            </span>
            {totalMonthly > 0 && (
              <span className="text-accent font-semibold bg-accent/10 px-3 py-1 rounded-full">
                ${totalMonthly.toFixed(0)}/mo
              </span>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 md:py-16 flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center sm:text-left"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            AI Stack Audit
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Add each AI tool your team pays for. We&apos;ll find exactly where you&apos;re overspending.
          </p>
        </motion.div>

        {/* Team Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-6 sm:p-8 mb-8"
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Users className="w-5 h-5 text-accent" />
            Team Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="teamSize"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Team Size
              </label>
              <input
                id="teamSize"
                type="number"
                min="1"
                max="10000"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="clean-input"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label
                htmlFor="useCase"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Primary Use Case
              </label>
              <div className="relative">
                <select
                  id="useCase"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value as UseCase)}
                  className="clean-input appearance-none pr-10"
                >
                  {useCaseOptions.map((uc) => (
                    <option key={uc.value} value={uc.value}>
                      {uc.emoji} {uc.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tool Entries */}
        <div className="space-y-6 mb-8">
          <AnimatePresence mode="popLayout">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="glass-panel rounded-2xl p-6 sm:p-8 relative"
              >
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Tool #{index + 1}
                  </h3>
                  {tools.length > 1 && (
                    <button
                      onClick={() => removeTool(tool.id)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Remove tool"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Tool selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Tool
                    </label>
                    <div className="relative">
                      <select
                        value={tool.toolId}
                        onChange={(e) =>
                          updateTool(tool.id, "toolId", e.target.value)
                        }
                        className="clean-input appearance-none pr-10"
                        id={`tool-select-${index}`}
                      >
                        <option value="">Select a tool...</option>
                        {AI_TOOLS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Plan selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Plan
                    </label>
                    <div className="relative">
                      <select
                        value={tool.planName}
                        onChange={(e) =>
                          updateTool(tool.id, "planName", e.target.value)
                        }
                        className="clean-input appearance-none pr-10 disabled:opacity-50 disabled:bg-gray-50"
                        disabled={!tool.toolId}
                        id={`plan-select-${index}`}
                      >
                        <option value="">Select a plan...</option>
                        {getPlansForTool(tool.toolId).map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}{" "}
                            {p.pricePerUserPerMonth > 0
                              ? `($${p.pricePerUserPerMonth}/user/mo)`
                              : "(Free)"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Seats */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Seats
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={tool.seats}
                      onChange={(e) =>
                        updateTool(tool.id, "seats", e.target.value)
                      }
                      className="clean-input"
                      placeholder="1"
                      id={`seats-${index}`}
                    />
                  </div>

                  {/* Monthly Spend */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Spend ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tool.monthlySpend}
                      onChange={(e) =>
                        updateTool(tool.id, "monthlySpend", e.target.value)
                      }
                      className="clean-input"
                      placeholder="Auto-calculated"
                      id={`spend-${index}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Tool Button */}
        <motion.button
          onClick={addTool}
          whileTap={{ scale: 0.98 }}
          className="w-full border border-dashed border-gray-300 rounded-2xl bg-white/50 backdrop-blur-sm p-6 flex items-center justify-center gap-2 text-gray-600 font-medium hover:bg-white hover:text-accent hover:border-accent/50 transition-all cursor-pointer mb-12 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Another Tool
        </motion.button>

        {/* Summary & Submit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Total Monthly AI Spend
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-foreground">
                ${totalMonthly.toFixed(0)}
                <span className="text-lg sm:text-xl font-medium text-gray-400 ml-1">
                  /mo
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">Annual Total</div>
              <div className="text-2xl sm:text-3xl font-semibold text-gray-800">
                ${(totalMonthly * 12).toFixed(0)}
                <span className="text-sm font-medium text-gray-400 ml-1">
                  /yr
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-6 justify-center sm:justify-start">
            <Save className="w-4 h-4" />
            Auto-saves to browser
          </div>

          <button
            onClick={handleSubmit}
            disabled={validToolCount === 0 || isSubmitting}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            id="run-audit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Running Audit...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5 mr-2" />
                Generate Free Audit
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          {validToolCount === 0 && (
            <p className="text-sm font-medium text-red-500 text-center mt-4 bg-red-50 py-2 rounded-lg">
              Please add at least one complete tool to continue.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
