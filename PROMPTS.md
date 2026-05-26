# LLM Prompts

## AI Summary Generation Prompt

### System Prompt
```
You are a financial analyst specializing in SaaS spend optimization. Write a concise, actionable executive summary (100 words max) for a startup's AI tool audit. Be specific with numbers. Be professional but approachable. Do not use markdown formatting.
```

### User Prompt Template
```
Audit for a {teamSize}-person team focused on {primaryUseCase}.

Current monthly AI spend: ${totalCurrentMonthly}
Potential monthly savings: ${totalMonthlySavings}
Potential annual savings: ${totalAnnualSavings}

{For each tool:}
Tool: {toolName} ({planName}, {seats} seats, ${monthlySpend}/mo)
Status: {status}
Savings: ${monthlySavings}/mo
Recommendations:
- {action}: saves ${savings}/mo. {reason}

{If credexEligible:}
This team qualifies for Credex discounted credits (>$500/mo savings).

Write a ~100 word executive summary highlighting the key findings and top recommendation.
```

### Why This Prompt Design

1. **System prompt sets the persona:** "Financial analyst" ensures the tone is professional and numbers-focused, not generic AI assistant language.

2. **Explicit word limit:** "100 words max" prevents rambling. The summary should be scannable — it's going in an email and on a results page.

3. **"No markdown formatting":** Early versions generated bullet points and headers, which looked broken in the UI. Plain paragraphs render better inline.

4. **Structured data input:** Rather than passing raw JSON, I format the data as a readable brief. This gives the model better context than a data dump.

5. **Conditional Credex mention:** Only includes the Credex qualification if savings exceed $500/mo. This avoids the model generating a sales pitch for users who don't qualify.

### What I Tried That Didn't Work

1. **First attempt:** "Summarize this JSON" + raw audit result. Output was too technical, cited field names, and felt robotic.

2. **Second attempt:** "Write a friendly summary." Output was too casual ("Hey there!") and lacked specific numbers.

3. **Third attempt:** "Be a CFO advisor." Output was too formal and used jargon ("OPEX optimization cadence"). The financial analyst persona hit the right balance.

4. **Temperature experiments:**
   - 0.3: Too repetitive, every summary sounded the same
   - 0.7: Good variety while staying factual (selected)
   - 1.0: Occasionally invented features or made math errors

### Fallback Strategy

If the OpenAI API is unavailable (429, timeout, no API key), the summary falls back to a template-based generator in `src/app/api/summary/route.ts`. The template:
- Uses the same data points
- Constructs a grammatically correct paragraph
- Highlights the top savings opportunity
- Mentions Credex eligibility if applicable

The fallback is clearly labeled in the UI: "Using template (API unavailable)."

### Model Choice

Using `gpt-4o-mini` for cost efficiency. The summary is short (100 words) and doesn't require advanced reasoning — just coherent synthesis. At ~$0.15/1M input tokens, the cost per summary is negligible (<$0.001).
