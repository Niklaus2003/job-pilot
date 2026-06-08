# Phase 4 — Edge Cases (Guardrails & Validation)

**Phase goal:** Post-LLM truthfulness checks, risk flags, export gates, stricter schemas.  
**Reference:** [implementation-plan.md § Phase 4](../implementation-plan.md#phase-4--guardrails--validation) · [architecture.md §9](../architecture.md)

---

## Guardrails module (`lib/guardrails.ts`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P4-EC-001 | New number in tailored bullet (was none) | `riskFlag: unsupported_metric` | Regex / digit detection | P0 |
| P4-EC-002 | New percentage ("40% increase") | Same flag | `%` + number pattern | P0 |
| P4-EC-003 | Number changed (5 → 50 engineers) | `unsupported_metric` or `metric_changed` | Compare digit tokens | P0 |
| P4-EC-004 | Same number, reworded context | No flag | Allow if digit set equal | P0 |
| P4-EC-005 | "million", "thousand" without digits | Heuristic flag if not in original | Word number map | P1 |
| P4-EC-006 | New tool: "Kubernetes" not in resume | `riskFlag: unsupported_tool` | Token vs resume skills+bullets | P0 |
| P4-EC-007 | Tool synonym (K8s vs Kubernetes) | No flag if canonical form in resume | Alias table | P1 |
| P4-EC-008 | Tool in JD only, added to bullet | Flag — JD ≠ resume evidence | Strict resume corpus | P0 |
| P4-EC-009 | New employer name in bullet | `unsupported_employer` or strip sentence | Company list from experience | P0 |
| P4-EC-010 | New degree/certification string | `unsupported_credential` | Education + certs list | P0 |
| P4-EC-011 | "Expert", "world-class", "industry-leading" | `seniority_inflation` + lower confidence | Phrase list | P1 |
| P4-EC-012 | "Led team of 50" when original "led team" | Metric + seniority flags | Combined | P0 |
| P4-EC-013 | Keyword count 2× original | `keyword_stuffing` warning | Token count ratio | P1 |
| P4-EC-014 | Identical tailored and original | No flag; confidence can stay high | Skip | P0 |
| P4-EC-015 | Unicode homoglyph bypass (Cyrillic 'а') | Normalize to ASCII before compare | NFKC normalize | P2 |

---

## Pipeline integration

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P4-EC-016 | Guardrail strips claim — bullet too short | Revert to original or mark `confidence: low` | Min length check | P1 |
| P4-EC-017 | All bullets flagged high risk | Still show review; block export by policy | Export gate | P0 |
| P4-EC-018 | `GUARDRAIL_BLOCKED` config true | `403` on export API | Env flag | P1 |
| P4-EC-019 | Guardrails run twice (idempotent) | Same flags, no duplicate | Idempotent validate | P1 |
| P4-EC-020 | Summary pass not guardrailed | Run same checks on summary | Extend validator | P0 |

---

## User confirmation UI

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P4-EC-021 | High risk bullet unconfirmed | Export disabled | `PDFExportButton` | P0 |
| P4-EC-022 | User checks confirm without reading | Still allowed — disclaimer covers liability | Checkbox per bullet | P0 |
| P4-EC-023 | User edits tailored text in UI (if enabled) | Re-run guardrails on save | onBlur validate | P1 |
| P4-EC-024 | Medium/low risk only | Export allowed after disclaimer only | Gate rules by severity | P1 |
| P4-EC-025 | Risk resolved by editing bullet to remove metric | Clear flag on revalidate | Live validation | P1 |
| P4-EC-026 | Disclaimer modal dismissed | No download | Modal required | P0 |
| P4-EC-027 | Disclaimer accepted once per session | `sessionStorage.disclaimerAccepted` | Optional UX | P2 |

---

## Schema hardening

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P4-EC-028 | LLM returns `confidence: "HIGH"` | Reject at API boundary | `.enum()` strict | P0 |
| P4-EC-029 | Empty `changeReason` | Reject or default "Alignment update" | `.min(1)` on reason | P1 |
| P4-EC-030 | `keywordsAddressed` empty array | Allowed | Optional field | P0 |
| P4-EC-031 | Orchestrator output fails Zod | Never return to client; log runId | Server-only error | P0 |
| P4-EC-032 | Schema version upgrade | Bump `STORAGE_VERSION`; migrate or clear | Client storage | P1 |

---

## Logging & privacy

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P4-EC-033 | Log full resume on guardrail fail | Log runId + flag type only | Structured logging | P0 |
| P4-EC-034 | PII in `details` sent to client | Strip to generic message | `api-error` sanitizer | P0 |

---

## False positives / negatives

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P4-EC-035 | Legitimate metric in original, missed by parser | User confirms bullet; don't strip | `userConfirmed` bypass | P1 |
| P4-EC-036 | "Java" in bullet, "JavaScript" in skills — tool false positive | Alias / substring rules | Tune tool matcher | P1 |
| P4-EC-037 | LLM softens claim but guardrail misses subtle inflation | Rely on disclaimer + review | Accept limitation | P2 |

---

## Phase 4 tests (adversarial)

| ID | Input | Expected |
|----|-------|----------|
| P4-EC-038 | Original: "Built API" / Tailored: "Built API, 40% faster" | `unsupported_metric` |
| P4-EC-039 | Add "Snowflake" not in resume | `unsupported_tool` |
| P4-EC-040 | Add "Google" as new employer | `unsupported_employer` |
| P4-EC-041 | Export with 1 unconfirmed high-risk | Blocked |
| P4-EC-042 | Export all confirmed + disclaimer | Allowed |

---

## Phase 4 exit checklist

- [ ] Metric, tool, employer injection cases flagged
- [ ] Export blocked until disclaimer + high-risk confirmed
- [ ] API never returns unvalidated orchestrator output
- [ ] Adversarial unit tests pass

---

## See also

LLM fabrication root cause: [phase-2.md](./phase-2.md) P2-EC-052–053. PDF content: [phase-3.md](./phase-3.md).
