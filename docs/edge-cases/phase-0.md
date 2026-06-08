# Phase 0 — Edge Cases (Project Bootstrap)

**Phase goal:** Runnable Next.js skeleton, Zod schemas, fixtures, tests.  
**Reference:** [implementation-plan.md § Phase 0](../implementation-plan.md#phase-0--project-bootstrap)

---

## Schemas (`lib/schemas.ts`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P0-EC-001 | Empty `skills` array | Valid; UI shows empty skills section | `ResumeProfileSchema` — `.default([])` | P1 |
| P0-EC-002 | Missing optional `contact` fields | Parse succeeds; fields undefined | Use `.optional()` on contact keys | P0 |
| P0-EC-003 | `overallScore` = 150 or -5 | Zod reject; clamp 0–100 in schema | `.min(0).max(100)` on score fields | P0 |
| P0-EC-004 | `confidence` = `"High"` (wrong case) | Reject unless normalized | `.enum(["high","medium","low"])` | P0 |
| P0-EC-005 | `importance` typo (`"critical"`) | Reject | Enum on gap schema | P0 |
| P0-EC-006 | Extra unknown JSON keys from future LLM | Strip with `.strict()` or `.passthrough()` — **pick one project-wide** | Document in schemas README | P0 |
| P0-EC-007 | `experience[].bullets` empty array | Valid; tailoring may skip role | Allow empty; log in Phase 2 | P1 |
| P0-EC-008 | Unicode names (e.g. José, 李明) | Preserve in contact/name fields | No ASCII-only regex on names | P1 |
| P0-EC-009 | Very long bullet (2000+ chars) | Parse OK; truncate at API layer in Phase 2 | Optional `.max(2000)` on bullet strings | P2 |
| P0-EC-010 | `TailoringRun.status` invalid value | Reject | Enum: `parsed \| analyzed \| tailored \| exported` | P0 |

---

## Fixtures (`lib/fixtures/`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P0-EC-011 | Fixture JSON drifts from schema | `pnpm test` fails | Regenerate fixture when schema changes | P0 |
| P0-EC-012 | Fixture missing `tailoredMatch` | Valid for analyze-only fixture | Separate `sample-run-analyzed.json` vs full run | P1 |
| P0-EC-013 | Duplicate companies in experience | Valid; UI shows both | No dedupe in schema | P2 |
| P0-EC-014 | Sample JD with no company name | `company` optional; UI shows "Unknown company" | `JobDescriptionProfile` optional field | P1 |
| P0-EC-015 | Fixture uses dated employment ("Present") | Store as string; no date parsing in Phase 0 | `startDate`/`endDate` as strings | P2 |

---

## Tooling & project setup

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P0-EC-016 | Missing `.env` / `GROQ_API_KEY` | App still runs; API fails later with clear message | Phase 0: stub route returns 503 + message | P1 |
| P0-EC-017 | Windows path vs POSIX in imports | Builds on Windows dev machine | Use forward slashes; avoid hardcoded `\` | P1 |
| P0-EC-018 | `pnpm` vs `npm` lockfile conflict | Document one package manager in README | Single lockfile policy | P1 |
| P0-EC-019 | Next.js 15 vs 14 API differences | Pin version in `package.json` | README states supported major | P1 |
| P0-EC-020 | Shadcn component path alias `@/` broken | `tsconfig paths` + `components.json` aligned | Verify import in stub page | P0 |

---

## Tests (Vitest)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P0-EC-021 | Valid fixture passes, invalid fixture fails | Assert `safeParse.success === false` | `lib/schemas.test.ts` per type | P0 |
| P0-EC-022 | `null` instead of `[]` for arrays | Fail parse | Test null cases | P0 |
| P0-EC-023 | Partial `MatchScore` (missing `explanation`) | Fail parse | Required field tests | P0 |

---

## Phase 0 exit checklist (edge-case gate)

- [ ] All score and enum fields bounded
- [ ] Fixtures validate against current schemas
- [ ] At least one invalid payload test per major schema
- [ ] Strict vs passthrough policy documented

---

## Deferred to later phases

Multi-column resume parsing, LLM malformed JSON, PDF binary uploads, guardrails — see phase-2+ docs.
