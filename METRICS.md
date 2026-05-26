# Metrics

## North Star Metric

**Qualified Leads Generated per Week**

A "qualified lead" is defined as a user who:
1. Completed an audit showing >$200/month in potential savings
2. Submitted their email address
3. Has a real company domain (not @gmail.com)

### Why This Metric

SpendPilot exists to generate leads for Credex's AI credit sales team. "Qualified leads per week" captures the full value chain — a user had to discover the tool, trust it enough to enter their stack, see valuable recommendations, and then choose to share their email. It directly correlates with Credex revenue.

**Why not "audits completed"?** — Vanity metric. An audit that shows $0 savings and captures no email has zero business value.

**Why not "DAU"?** — This is a tool people use once per quarter (when they review budgets), not daily. DAU would be misleading.

**Why not "revenue"?** — Revenue attribution from lead → Credex sale is too delayed (weeks/months) to be actionable at this stage.

## 3 Input Metrics That Drive the North Star

### 1. Audit Completion Rate
**Definition:** % of visitors who land on `/audit` and reach the results page.
**Target:** >60%
**Why it matters:** If users drop off during the form, our UX has friction. If they drop off before results, our form is too long or confusing.
**What we'd fix:** Reduce form fields, add inline progress indicator, pre-fill common tools.

### 2. Average Savings Identified
**Definition:** Mean `totalMonthlySavings` across all completed audits.
**Target:** >$200/month
**Why it matters:** If our audit engine consistently finds <$50/month savings, the tool feels useless and email capture drops. If it overstates savings, users lose trust.
**What we'd fix:** Add more tools, add benchmark data, ensure pricing data is current.

### 3. Email Capture Rate
**Definition:** % of users who complete an audit AND submit their email.
**Target:** >25% for high-savings audits (>$200/mo), >10% for all audits.
**Why it matters:** This is where value converts to lead. Low capture means the CTA is wrong, the timing is off, or the trust isn't earned.
**What we'd fix:** A/B test CTA copy, adjust placement, add social proof near the capture form.

## What I'd Instrument First

1. **Page-level funnel:** Landing → Audit form → Results → Email capture (using simple analytics or Vercel Analytics)
2. **Audit engine output distribution:** Histogram of savings amounts to calibrate whether recommendations feel valuable
3. **Tool selection frequency:** Which AI tools users add most often → informs which pricing data to prioritize keeping current
4. **Share URL click-through rate:** Are shared audits driving new users? (This is the viral loop.)

## Pivot Trigger

**If, after 500 completed audits:**
- Average savings < $50/month AND
- Email capture rate < 5% AND
- Zero Credex consultations booked

**Then:** The tool's value proposition is wrong. Either:
- Most teams are already well-optimized (market doesn't exist)
- Our audit logic is too conservative (engineering fix)
- The wrong persona is finding the tool (distribution fix)

**Decision:** If it's a market problem (teams genuinely aren't overspending), pivot SpendPilot to a "benchmark" tool instead ("See how your AI spend compares to similar teams") — which has engagement value even without savings.
