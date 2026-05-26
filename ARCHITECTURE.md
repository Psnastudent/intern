# Architecture

## System Overview

SpendPilot is a Next.js 16 application using the App Router pattern. The architecture follows a clear separation between the **audit engine** (pure business logic), **presentation layer** (React components), and **API layer** (Next.js route handlers).

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page (animated, client component)
│   ├── layout.tsx          # Root layout with metadata + fonts
│   ├── globals.css         # Design system (CSS custom properties)
│   ├── audit/
│   │   └── page.tsx        # Spend input form
│   ├── results/
│   │   └── page.tsx        # Audit results display
│   ├── share/[id]/
│   │   ├── page.tsx        # Server component (OG metadata)
│   │   └── SharePageClient.tsx  # Client component (display)
│   └── api/
│       ├── summary/route.ts    # AI summary generation
│       └── leads/route.ts      # Lead capture + rate limiting
├── lib/
│   ├── pricing-data.ts     # Pricing database (typed, sourced)
│   └── audit-engine.ts     # Core audit logic (rule-based)
└── __tests__/
    └── audit-engine.test.ts  # Unit tests for audit logic
```

## Key Design Decisions

### Audit Engine (Rule-Based)

The audit engine (`src/lib/audit-engine.ts`) uses five analysis strategies, applied in order:

1. **Team plan overkill detection** — Flags when a <4 person team is paying for Team/Business/Enterprise plans that include admin features they don't need.
2. **Cheaper same-vendor plans** — Within the same tool, identifies lower-cost plans that still fit the user's use case.
3. **Alternative tool suggestions** — Cross-tool comparison for similar capability at lower cost.
4. **Annual billing optimization** — Detects monthly billing when annual would save ~20%.
5. **Credex credit opportunity** — For spends >$100/mo, surfaces the Credex credit discount.

Recommendations are sorted by savings amount. Each recommendation includes:
- Specific dollar amounts
- Confidence level (high/medium/low)
- Full reasoning tracing to pricing data

### Data Flow

```
User Input → LocalStorage (persistence)
           → Audit Engine (client-side, instant)
           → Results Page (animated display)
           → Optional: Email Capture → /api/leads (server)
           → Optional: AI Summary → /api/summary (server)
           → Shareable URL → /share/[id] (with OG tags)
```

### Why Client-Side Audit?

The audit runs entirely in the browser. This is intentional:
- **Instant results** — no API latency
- **Privacy** — user data never leaves the browser unless they opt into email capture
- **Offline capable** — form state persists in LocalStorage
- **No backend cost** — the audit itself generates zero server load

### API Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/summary` | POST | Generate AI summary | None (rate limited) |
| `/api/leads` | POST | Capture email + company | None (rate limited + honeypot) |

### Abuse Protection

- **Rate limiting:** IP-based, 5 requests/minute per IP (in-memory for MVP; would use Redis in production)
- **Honeypot field:** Hidden form field that bots fill — silently accepted but discarded
- **No auth required:** Deliberate choice to minimize friction. Lead capture is optional.

### Styling Architecture

All styling uses Tailwind CSS v4 with CSS custom properties defined in `globals.css`. Key design tokens:
- `--accent` / `--accent-light` — Purple gradient (brand)
- `--success` — Green (savings, positive signals)
- `--warning` / `--danger` — Status indicators
- Glass morphism via `glass-card` utility class
- Animations via Framer Motion (client components only)

### Scalability Considerations

For production at scale:
- Audit results would be stored in Supabase/Postgres (currently localStorage)
- Share URLs would resolve from DB, not localStorage
- Rate limiting would use Redis/Upstash
- Pricing data would be pulled from a CMS or API, not hardcoded
- Email would be sent via Resend/Postmark transactional API
