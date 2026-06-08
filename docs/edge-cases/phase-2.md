# Phase 2 — Edge Cases (LLM Integration)

**Phase goal:** Real parse, score, gap analysis, tailor via server APIs.  
**Reference:** [implementation-plan.md § Phase 2](../implementation-plan.md#phase-2--llm-integration) · [architecture.md §7–8](../architecture.md)

---

## API & orchestration

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-001 | Missing `GROQ_API_KEY` | `503` + `{ code: "CONFIG_ERROR" }` | API route startup check | P0 |
| P2-EC-002 | Request body not JSON | `400` + `INVALID_REQUEST` | Route try/catch | P0 |
| P2-EC-003 | Missing resume or JD in `/api/parse` | `400` with field errors | Zod request schema | P0 |
| P2-EC-004 | `/api/tailor` without prior analyze (no profiles) | `400` or accept full payload in body | Document contract | P1 |
| P2-EC-005 | Duplicate `runId` reuse with different inputs | Treat as new run or reject stale | Generate new UUID per analyze | P1 |
| P2-EC-006 | Client sends oversized body (>4MB Vercel limit) | `413` before LLM call | Check `Content-Length` / body size | P0 |
| P2-EC-007 | Concurrent analyze + tailor same session | Serialize or use run version | Orchestrator mutex per runId | P2 |
| P2-EC-008 | Vertical slice: single `/api/tailor` timeout | Partial error with stage name (`parse`, `score`, etc.) | Orchestrator stage labels in error | P1 |

---

## Input truncation (`lib/truncate.ts`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-009 | Resume > `MAX_RESUME_CHARS` | Truncate with section-aware cut; warn in response metadata | Truncate + `truncated: true` flag | P0 |
| P2-EC-010 | JD > `MAX_JD_CHARS` | Truncate end or "requirements" section priority | Same | P0 |
| P2-EC-011 | Truncation cuts mid-bullet | Prefer cut at `\n\n` boundary | Paragraph-aware truncate | P1 |
| P2-EC-012 | Empty JD after trim | `400` PARSE_FAILED | Pre-validate | P0 |

---

## LLM client (`lib/llm.ts`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-013 | LLM returns markdown fenced JSON | Strip fences before parse | `extractJson()` helper | P0 |
| P2-EC-014 | LLM returns invalid JSON | One retry with repair prompt; then `LLM_INVALID_JSON` | `callLlmJson` | P0 |
| P2-EC-015 | LLM returns valid JSON, fails Zod | Retry once; then error with Zod path in `details` | Log `issues` server-side only | P0 |
| P2-EC-016 | Groq rate limit (429) | `503` + retry-after message; client Retry button | Exponential backoff optional | P1 |
| P2-EC-017 | Timeout (30s+) | `LLM_TIMEOUT`; no partial state on server | AbortController | P0 |
| P2-EC-018 | Empty LLM content | Treat as invalid JSON | Retry path | P0 |
| P2-EC-019 | Model returns array instead of object | Zod fail → retry | Schema tests | P1 |
| P2-EC-020 | Token limit exceeded mid-response | Truncate input further or reduce bullet batch | Catch provider error | P1 |
| P2-EC-021 | API key leaked in client bundle | Never import `lib/llm` in client components | ESLint boundary / code review | P0 |

---

## Resume parser

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-022 | Plain text with no clear sections | LLM cleanup still returns best-effort profile | `resume-parser` + prompt | P0 |
| P2-EC-023 | Section headers non-standard ("Work History") | Heuristics + LLM map to `experience` | Prompt examples | P1 |
| P2-EC-024 | Multi-column copy-paste (jumbled lines) | Partial parse; UI warning "review sections" | `parseWarnings[]` in response | P1 |
| P2-EC-025 | Resume is only skills list, no jobs | Empty `experience`; still analyzable | Valid schema | P0 |
| P2-EC-026 | Duplicate bullet text in same role | Keep both; tailor may dedupe wording | No auto-dedupe | P2 |
| P2-EC-027 | Dates as "2020 – Present" / "Jan 2020" | Store raw strings; seniority heuristic fuzzy | `match-engine` | P2 |
| P2-EC-028 | Acronyms (AWS, K8s) vs spelled out | Normalize in skills list for matching | `normalizeSkill()` | P1 |
| P2-EC-029 | LLM invents employer not in source text | Zod can't catch — Phase 4 guardrail; Phase 2: log | Defer fabrication check | P1 |

---

## JD parser

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-030 | JD is boilerplate EEO paragraph only | Low-quality profile; warn user | Min length check on JD | P1 |
| P2-EC-031 | No job title in JD | `jobTitle: "Unknown"` or infer from first line | Prompt + fallback | P0 |
| P2-EC-032 | "Required" vs "Preferred" not labeled | LLM buckets best-effort; mark low confidence in metadata | Optional `parseConfidence` | P2 |
| P2-EC-033 | Same skill in required and preferred | Dedupe to required only | `jd-parser` normalize | P1 |
| P2-EC-034 | JD lists 100+ tools | Cap stored arrays; prioritize for matching | `.slice(0, N)` + warn | P1 |
| P2-EC-035 | Vague JD ("team player", "fast-paced") | `domainSignals` / soft skills; weak gap signals | Gap engine nuance | P2 |
| P2-EC-036 | Seniority contradictory ("Junior" + "10 years") | Pick dominant signal; explain in match | `match-engine` | P2 |
| P2-EC-037 | Non-English JD | Best-effort parse; document English-first MVP | README limitation | P2 |

---

## Match engine

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-038 | Zero required skills extracted | Skill score 0 or N/A; explanation notes sparse JD | Division-by-zero guard | P0 |
| P2-EC-039 | All skills match synonyms only (JS vs JavaScript) | Synonym map or fuzzy match | `skillAliases` table | P1 |
| P2-EC-040 | LLM score 85, deterministic 40 | Reconcile: weight deterministic higher for `overallScore` | `reconcileScores()` | P0 |
| P2-EC-041 | Tailored score lower than original | Allowed; show honestly in UI | No forced monotonic increase | P0 |
| P2-EC-042 | Perfect 100 score with obvious gaps | Cap score when `criticalMissingRequirements.length > 0` | Deterministic cap | P0 |
| P2-EC-043 | Scoring tailored resume | Build temporary profile from tailored bullets | `resumeFromTailored()` helper | P0 |
| P2-EC-044 | Keyword stuffing in tailored text inflates score | Phase 4 density check; Phase 2: prefer deterministic keywords | Note in phase-4 | P2 |

---

## Gap engine

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-045 | No gaps found | Return `{ gaps: [] }`; UI empty state | Valid response | P0 |
| P2-EC-046 | LLM suggests "add Kubernetes" when missing | `canSafelyAdd: false` unless in resume | Prompt + schema default | P0 |
| P2-EC-047 | Skill mentioned once in obscure bullet | "Weakly represented" not "missing" | Gap merge logic | P1 |
| P2-EC-048 | Duplicate gap names from LLM + deterministic | Merge by normalized name | `mergeGaps()` | P1 |
| P2-EC-049 | 30+ gaps returned | Sort by importance; UI show top 15 + expand | Server sort + slice | P1 |

---

## Tailoring engine

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-050 | Role with 15 bullets | Rewrite top N (e.g. 8) by JD relevance; rest unchanged | Bullet selection policy | P1 |
| P2-EC-051 | Bullet already well-aligned | Optional skip; `changeReason: "minimal change"` | Relevance threshold | P2 |
| P2-EC-052 | LLM adds new metric ("30% faster") | Phase 4 flags; Phase 2 prompt forbids | Prompt only | P0 |
| P2-EC-053 | LLM adds technology not in resume | Same | Prompt only | P0 |
| P2-EC-054 | Original bullet empty string | Skip rewrite | Filter before LLM | P0 |
| P2-EC-055 | Tailored bullet empty after LLM | Fall back to original | Default in orchestrator | P0 |
| P2-EC-056 | Summary rewrite invents new role scope | Optional disable summary in MVP | Feature flag | P1 |
| P2-EC-057 | Skills reorder adds new skill string | Only reorder existing; no new entries | Validate against resume skill set | P0 |
| P2-EC-058 | Per-bullet LLM loop: one fails | Continue others; mark failed bullet `confidence: low` | Partial success response | P1 |
| P2-EC-059 | `keywordsAddressed` not in JD | Strip invalid keywords post-validate | Intersect with JD keyword set | P1 |

---

## UI ↔ API integration

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P2-EC-060 | Network offline on fetch | Toast + retry; preserve inputs | Client error handler | P0 |
| P2-EC-061 | 500 from server | Show `error.message`; don't wipe sessionStorage | Error boundary | P0 |
| P2-EC-062 | Partial response (analyze OK, tailor fail) | Keep analyze results; enable retry tailor | Status `analyzed` preserved | P0 |
| P2-EC-063 | User edits paste during in-flight request | Ignore stale response (request id) | AbortController or sequence id | P1 |
| P2-EC-064 | Long operation (>60s) | Loading message with stage; consider timeout UI | Progress copy | P1 |

---

## Phase 2 test cases (minimum)

| ID | Test |
|----|------|
| P2-EC-065 | Skill overlap: required `["Python","SQL"]`, resume has Python only → partial score |
| P2-EC-066 | Mock LLM invalid JSON → retry → success |
| P2-EC-067 | Mock LLM invalid JSON twice → `LLM_INVALID_JSON` |
| P2-EC-068 | Truncate 60k resume → `truncated: true` in metadata |
| P2-EC-069 | Empty experience → analyze returns without tailor crash |

---

## Phase 2 exit checklist

- [ ] All P0 API/LLM/parser cases handled
- [ ] Score reconciliation documented in code
- [ ] No API key in client bundle
- [ ] Retry + error codes match `lib/api-error.ts`
- [ ] Tailored score can be less than original (display OK)

---

## See also

Fabrication and export gates: [phase-4.md](./phase-4.md). PDF: [phase-3.md](./phase-3.md). File upload: [phase-5.md](./phase-5.md).
