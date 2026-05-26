/**
 * AI Tool Pricing Data
 * All prices sourced from official vendor pricing pages.
 * See PRICING_DATA.md at repo root for full source citations.
 * Last verified: 2026-05-25
 */

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface PlanInfo {
  name: string;
  pricePerUserPerMonth: number;
  /** Annual billing price per user per month, if available */
  annualPricePerUserPerMonth?: number;
  /** Minimum seats required, if applicable */
  minSeats?: number;
  /** Key features/capabilities of this plan */
  features: string[];
  /** Best suited use cases */
  bestFor: UseCase[];
  /** Whether this is an API/usage-based plan */
  isUsageBased?: boolean;
  /** Typical monthly cost estimate for usage-based plans (per user) */
  typicalMonthlyCostPerUser?: number;
}

export interface ToolInfo {
  id: string;
  name: string;
  vendor: string;
  category: "ide" | "chat" | "api" | "image" | "general";
  pricingUrl: string;
  plans: PlanInfo[];
  /** Alternative tools that serve similar use cases */
  alternatives: string[];
}

export const AI_TOOLS: ToolInfo[] = [
  {
    id: "cursor",
    name: "Cursor",
    vendor: "Cursor",
    category: "ide",
    pricingUrl: "https://cursor.com/pricing",
    plans: [
      {
        name: "Hobby",
        pricePerUserPerMonth: 0,
        features: ["Limited completions", "Limited chat", "Basic models"],
        bestFor: ["coding"],
      },
      {
        name: "Pro",
        pricePerUserPerMonth: 20,
        annualPricePerUserPerMonth: 16,
        features: [
          "Unlimited tab completions",
          "$20/mo credit pool",
          "All frontier models",
          "Extended agent limits",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Pro+",
        pricePerUserPerMonth: 60,
        annualPricePerUserPerMonth: 48,
        features: [
          "3x credit usage vs Pro",
          "All frontier models",
          "Heavy usage support",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Ultra",
        pricePerUserPerMonth: 200,
        annualPricePerUserPerMonth: 160,
        features: [
          "20x usage multiplier",
          "Priority feature access",
          "Full-time AI-native dev",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Teams",
        pricePerUserPerMonth: 40,
        annualPricePerUserPerMonth: 32,
        minSeats: 2,
        features: [
          "Shared chats/rules",
          "Centralized billing",
          "Usage analytics",
          "RBAC",
          "SAML/OIDC SSO",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Enterprise",
        pricePerUserPerMonth: 60,
        features: [
          "Pooled usage",
          "Invoice/PO billing",
          "SCIM",
          "AI code tracking",
          "Priority support",
        ],
        bestFor: ["coding"],
      },
    ],
    alternatives: ["github-copilot", "windsurf"],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    vendor: "GitHub / Microsoft",
    category: "ide",
    pricingUrl: "https://github.com/features/copilot/plans",
    plans: [
      {
        name: "Free",
        pricePerUserPerMonth: 0,
        features: ["Limited completions", "Limited chat"],
        bestFor: ["coding"],
      },
      {
        name: "Pro",
        pricePerUserPerMonth: 10,
        annualPricePerUserPerMonth: 10,
        features: [
          "Unlimited completions",
          "$10/mo AI credits",
          "All models",
          "Agent mode",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Pro+",
        pricePerUserPerMonth: 39,
        features: [
          "$39/mo AI credits",
          "All models",
          "Agentic coding",
          "Power user features",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Business",
        pricePerUserPerMonth: 19,
        features: [
          "Org management",
          "$19/user AI credits (pooled)",
          "Policy controls",
          "Audit logs",
        ],
        bestFor: ["coding"],
        minSeats: 1,
      },
      {
        name: "Enterprise",
        pricePerUserPerMonth: 39,
        features: [
          "GH Enterprise Cloud required",
          "Advanced security",
          "SCIM",
          "Custom policies",
        ],
        bestFor: ["coding"],
        minSeats: 1,
      },
    ],
    alternatives: ["cursor", "windsurf"],
  },
  {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    category: "chat",
    pricingUrl: "https://claude.ai/pricing",
    plans: [
      {
        name: "Free",
        pricePerUserPerMonth: 0,
        features: ["Limited access", "Daily usage limits"],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
      {
        name: "Pro",
        pricePerUserPerMonth: 20,
        annualPricePerUserPerMonth: 17,
        features: [
          "Higher usage limits",
          "Claude Code",
          "Projects",
          "Google Workspace integration",
        ],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
      {
        name: "Max 5x",
        pricePerUserPerMonth: 100,
        features: [
          "5x usage capacity vs Pro",
          "Priority access",
          "Agentic workflows",
        ],
        bestFor: ["coding", "writing", "mixed"],
      },
      {
        name: "Max 20x",
        pricePerUserPerMonth: 200,
        features: [
          "20x usage capacity vs Pro",
          "Priority access",
          "Heavy agentic use",
        ],
        bestFor: ["coding", "writing", "mixed"],
      },
      {
        name: "Team",
        pricePerUserPerMonth: 25,
        annualPricePerUserPerMonth: 20,
        minSeats: 5,
        features: [
          "Centralized billing",
          "Admin controls",
          "Shared projects",
          "Higher limits",
        ],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
      {
        name: "Team Premium",
        pricePerUserPerMonth: 125,
        annualPricePerUserPerMonth: 100,
        minSeats: 5,
        features: [
          "Claude Code dev environment",
          "All Team features",
          "Premium usage",
        ],
        bestFor: ["coding", "mixed"],
      },
      {
        name: "Enterprise",
        pricePerUserPerMonth: 60,
        features: [
          "SAML SSO",
          "SCIM",
          "Custom data retention",
          "500k+ context",
          "Contractual indemnity",
        ],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
    ],
    alternatives: ["chatgpt"],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    category: "chat",
    pricingUrl: "https://openai.com/chatgpt/pricing/",
    plans: [
      {
        name: "Free",
        pricePerUserPerMonth: 0,
        features: ["Limited GPT-4o access", "Basic features"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        name: "Plus",
        pricePerUserPerMonth: 20,
        features: [
          "GPT-5.5",
          "Deep Research",
          "Sora",
          "Codex",
          "Agent Mode",
          "Ad-free",
        ],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
      {
        name: "Pro",
        pricePerUserPerMonth: 200,
        features: [
          "20x Plus limits",
          "1M token context",
          "o1 Pro mode",
          "GPT-5.5 Pro",
        ],
        bestFor: ["research", "coding", "data", "mixed"],
      },
      {
        name: "Business",
        pricePerUserPerMonth: 30,
        annualPricePerUserPerMonth: 25,
        minSeats: 2,
        features: [
          "Shared workspaces",
          "Admin controls",
          "SAML/SSO",
          "60+ integrations",
          "Data privacy",
        ],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
      {
        name: "Enterprise",
        pricePerUserPerMonth: 60,
        features: [
          "SCIM",
          "EKM",
          "Data residency",
          "Dedicated support",
          "Custom terms",
        ],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
    ],
    alternatives: ["claude"],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    vendor: "Anthropic",
    category: "api",
    pricingUrl: "https://www.anthropic.com/pricing",
    plans: [
      {
        name: "API (Haiku)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 50,
        features: [
          "$1/1M input tokens",
          "$5/1M output tokens",
          "Fast, cost-effective",
          "Batch 50% discount",
        ],
        bestFor: ["coding", "writing", "data", "mixed"],
      },
      {
        name: "API (Sonnet)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 150,
        features: [
          "$3/1M input tokens",
          "$15/1M output tokens",
          "Balanced performance",
          "Prompt caching 90% off",
        ],
        bestFor: ["coding", "writing", "research", "mixed"],
      },
      {
        name: "API (Opus)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 300,
        features: [
          "$5/1M input tokens",
          "$25/1M output tokens",
          "Highest capability",
          "1M context window",
        ],
        bestFor: ["research", "coding", "mixed"],
      },
    ],
    alternatives: ["openai-api"],
  },
  {
    id: "openai-api",
    name: "OpenAI API",
    vendor: "OpenAI",
    category: "api",
    pricingUrl: "https://openai.com/api/pricing/",
    plans: [
      {
        name: "API (GPT-5.4 Nano)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 20,
        features: [
          "$0.20/1M input tokens",
          "$1.25/1M output tokens",
          "Budget-tier",
          "Fast responses",
        ],
        bestFor: ["writing", "data", "mixed"],
      },
      {
        name: "API (GPT-5.4 Mini)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 50,
        features: [
          "$0.75/1M input tokens",
          "$4.50/1M output tokens",
          "Efficient production",
        ],
        bestFor: ["coding", "writing", "data", "mixed"],
      },
      {
        name: "API (GPT-5.4)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 200,
        features: [
          "$2.50/1M input tokens",
          "$15/1M output tokens",
          "Frontier workhorse",
        ],
        bestFor: ["coding", "research", "mixed"],
      },
      {
        name: "API (GPT-5.5)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 400,
        features: [
          "$5/1M input tokens",
          "$30/1M output tokens",
          "Flagship model",
        ],
        bestFor: ["research", "coding"],
      },
    ],
    alternatives: ["anthropic-api"],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    vendor: "Google",
    category: "chat",
    pricingUrl: "https://ai.google.dev/pricing",
    plans: [
      {
        name: "Free",
        pricePerUserPerMonth: 0,
        features: ["Basic access", "Daily limits"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        name: "AI Plus",
        pricePerUserPerMonth: 8,
        features: [
          "Enhanced access",
          "Higher limits",
          "Gemini integration",
        ],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        name: "AI Pro",
        pricePerUserPerMonth: 20,
        features: [
          "Gemini 3.1 Pro access",
          "High usage limits",
          "Advanced features",
        ],
        bestFor: ["writing", "research", "coding", "mixed"],
      },
      {
        name: "AI Ultra",
        pricePerUserPerMonth: 100,
        features: [
          "Highest capability",
          "Extended storage",
          "Premium features",
        ],
        bestFor: ["research", "coding", "data", "mixed"],
      },
      {
        name: "API (Gemini 3.5 Flash)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 40,
        features: [
          "$1.50/1M input tokens",
          "$9/1M output tokens",
          "Fast, multimodal",
        ],
        bestFor: ["coding", "writing", "data", "mixed"],
      },
      {
        name: "API (Gemini 3.1 Pro)",
        pricePerUserPerMonth: 0,
        isUsageBased: true,
        typicalMonthlyCostPerUser: 150,
        features: [
          "$2/1M input tokens",
          "$12/1M output tokens",
          "Advanced reasoning",
        ],
        bestFor: ["coding", "research", "data", "mixed"],
      },
    ],
    alternatives: ["chatgpt", "claude"],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    vendor: "Codeium",
    category: "ide",
    pricingUrl: "https://windsurf.com/pricing",
    plans: [
      {
        name: "Free",
        pricePerUserPerMonth: 0,
        features: [
          "Base usage allowance",
          "Unlimited tab autocomplete",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Pro",
        pricePerUserPerMonth: 20,
        features: [
          "Standard daily/weekly quotas",
          "All premium models",
          "Full features",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Teams",
        pricePerUserPerMonth: 40,
        minSeats: 2,
        features: [
          "Pro features",
          "Admin controls",
          "Centralized billing",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Max",
        pricePerUserPerMonth: 200,
        features: [
          "Highest usage allowances",
          "Power user features",
          "All models",
        ],
        bestFor: ["coding"],
      },
      {
        name: "Enterprise",
        pricePerUserPerMonth: 60,
        features: [
          "SSO/SCIM/RBAC",
          "Priority support",
          "Higher quotas",
        ],
        bestFor: ["coding"],
      },
    ],
    alternatives: ["cursor", "github-copilot"],
  },
];

/** Get a tool by its ID */
export function getToolById(id: string): ToolInfo | undefined {
  return AI_TOOLS.find((t) => t.id === id);
}

/** Get all tools in a category */
export function getToolsByCategory(category: ToolInfo["category"]): ToolInfo[] {
  return AI_TOOLS.filter((t) => t.category === category);
}

/** Get a specific plan for a tool */
export function getPlan(
  toolId: string,
  planName: string
): PlanInfo | undefined {
  const tool = getToolById(toolId);
  if (!tool) return undefined;
  return tool.plans.find(
    (p) => p.name.toLowerCase() === planName.toLowerCase()
  );
}
