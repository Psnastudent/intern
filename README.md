# SpendPilot — AI Spend Audit Tool

> Stop overpaying for AI tools. Get a free, instant audit of your AI subscriptions.

**SpendPilot** is a free web app that audits AI tool spending for startups and engineering teams. Users input their current AI subscriptions — Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, and API usage — and get instant, defensible recommendations to optimize spend. Built as a lead-generation asset for [Credex](https://credex.co), which sells discounted AI infrastructure credits.

## Screenshots

> _Add screenshots or a Loom recording here after deployment._

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint
```

Visit `http://localhost:3000` after starting the dev server.

## Live Demo

> _Link to deployed URL on Vercel._

## Decisions

### 1. Rule-based audit engine over AI
The audit logic uses hardcoded rules, not an LLM. A finance person reviewing our recommendations should see specific numbers tracing to real pricing pages — not hallucinated suggestions. AI is only used for the optional executive summary, where creative synthesis adds value without risking accuracy.

### 2. Next.js App Router + TypeScript
Chosen for server-side rendering (OG tag generation for shareable URLs), built-in API routes (lead capture, AI summary), and strong TypeScript support. The App Router enables per-page metadata for SEO without extra libraries.

### 3. LocalStorage before Supabase
Form state persists to LocalStorage immediately — no signup friction. This is a deliberate product choice: the assignment says "no login required to use the tool." Backend storage (Supabase) is reserved for lead capture after value is shown.

### 4. Conservative savings estimates
We never fabricate savings. If a user's stack is already optimal, we tell them honestly ("You're spending well"). Credex credit savings use a conservative 20% estimate even though real discounts can be higher. Trust is the product.

### 5. Dark mode as the only mode
The target user is an engineering leader or developer. Dark mode isn't a preference toggle — it's the default experience, matched to tools they already use (VS Code, GitHub, Linear). This also makes the UI feel more premium and reduces visual clutter.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full technical writeup.

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel
- **AI Summary:** OpenAI API (with graceful template fallback)
