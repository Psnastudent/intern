# Tests Documentation

SpendPilot includes a comprehensive test suite for the core business logic (the audit engine). The tests are written using [Vitest](https://vitest.dev/).

## Running the Tests

To run the test suite:
```bash
npm test
```

## Test Coverage

The `src/__tests__/audit-engine.test.ts` file contains 10 test cases that cover the core strategies and edge cases of the audit engine:

1. **Team Plan Overkill Detection:** Ensures that if a 2-person team is on a 'Teams' or 'Enterprise' plan that requires minimum seats or charges a premium for unneeded admin features, the engine recommends downgrading to individual Pro plans.
2. **Optimal Spend Detection:** Verifies that if the user's stack is already optimally priced, the engine accurately classifies it as "optimal" and recommends no changes.
3. **Multi-Tool Aggregation:** Confirms that if a user submits multiple tools, the monthly and annual savings are summed correctly across all tools.
4. **Annual Billing Optimization:** Tests that if a user pays monthly for a tool that offers an annual discount (e.g., Claude Pro), the engine surfaces the annual billing savings.
5. **Credex Eligibility Flagging:** Validates that if the total monthly savings identified exceed $500/month, the audit is flagged as `credexEligible` to trigger the consultation CTA.
6. **Alternative Tool Suggestions:** Ensures the engine can suggest a cheaper alternative tool if it matches the same use case (e.g., suggesting Claude Pro if the user is overpaying for an Enterprise text model).
7. **Unique ID Generation:** Tests that every audit generates a unique, 8-character ID for shareable URLs.
8. **Unknown Tool Graceful Handling:** Verifies that if an invalid or unsupported tool ID is passed in the input, the engine skips it without crashing the entire audit.
9. **Credit Opportunity:** Validates that high-spend tools trigger the Credex discounted AI credits recommendation, applying a conservative 20% estimated savings calculation.
10. **Overall Status Classification:** Checks that the top-level `overallStatus` (high_savings, moderate_savings, optimal) is correctly derived from the total savings value.

## Why Vitest?

Vitest was chosen over Jest because it is significantly faster, native to modern build tools (like Vite/Turbopack), and supports TypeScript out of the box without complicated Babel or ts-node configurations. It provides a Jest-compatible API, making the tests easy to write and read.
