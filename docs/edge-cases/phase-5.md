# Phase 5 — Edge Cases (Polish & Demo Readiness)

**Phase goal:** File upload, UX polish, samples, deployment, portfolio demo.  
**Reference:** [implementation-plan.md § Phase 5](../implementation-plan.md#phase-5--polish--demo-readiness)

---

## File upload (PDF / DOCX)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P5-EC-001 | File > 5 MB | `413` or client reject before upload | Size check both sides | P0 |
| P5-EC-002 | Wrong MIME (`.exe` renamed `.pdf`) | Reject; magic-byte sniff optional | `file-type` or extension + MIME | P0 |
| P5-EC-003 | Empty PDF (0 pages text) | `PARSE_FAILED` + suggest paste | `pdf-parse` empty | P0 |
| P5-EC-004 | Scanned PDF (image only, no text) | Extraction empty; show "paste text" fallback | OCR out of scope | P0 |
| P5-EC-005 | Password-protected PDF | Clear error; no hang | Catch library error | P0 |
| P5-EC-006 | Corrupt PDF binary | `PARSE_FAILED` | try/catch | P0 |
| P5-EC-007 | Multi-column PDF layout | Garbled line order; show extraction preview | Preview UI before parse | P0 |
| P5-EC-008 | DOCX with tables/text boxes | Partial text; warn user | `mammoth` + preview | P1 |
| P5-EC-009 | `.doc` legacy format | Reject with "save as DOCX" message | Extension allowlist | P1 |
| P5-EC-010 | Upload then user also pastes text | Prefer paste if non-empty; or merge policy | Document: paste wins | P1 |
| P5-EC-011 | Very large extracted text (> MAX) | Truncate + warn (Phase 2 rules) | `truncate.ts` | P0 |
| P5-EC-012 | Filename with unicode / spaces | Sanitize display name only | UI label | P2 |
| P5-EC-013 | Multiple files dropped | Accept first only; message | Input `multiple={false}` | P1 |

---

## Extraction preview UX

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P5-EC-014 | Preview shows gibberish | Encourage paste; disable auto-analyze | Warning banner | P0 |
| P5-EC-015 | User approves bad preview | Proceed at own risk; disclaimer | Confirm checkbox | P1 |
| P5-EC-016 | Preview truncated in UI | "Showing first N characters" | Slice display | P1 |

---

## UX polish

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P5-EC-017 | Slow 3G — long API | Stage-specific skeletons | Per-step loaders | P1 |
| P5-EC-018 | User refreshes mid-tailor | Restore from sessionStorage or prompt restart | Phase 1 patterns | P0 |
| P5-EC-019 | Split routes `/tailor/review` without state | Redirect to `/tailor` | Route guard | P1 |
| P5-EC-020 | Score subscores all zero | Hide breakdown or show "N/A" | `ScoreCard` | P1 |
| P5-EC-021 | Side-by-side on 320px mobile | Tab switcher Original / Tailored | Tabs component | P0 |
| P5-EC-022 | Dark mode (if Shadcn dark) | PDF still light-themed | PDF separate theme | P2 |
| P5-EC-023 | Accessibility: keyboard through gaps | Focusable cards | a11y audit | P2 |

---

## Sample content & demo

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P5-EC-024 | Sample files missing from `public/` | Load sample fails gracefully | 404 handler | P0 |
| P5-EC-025 | Sample JD outdated (job closed) | Demo still works structurally | Note in DEMO.md | P2 |
| P5-EC-026 | Demo path tailored score not > original | Update sample or prompts; document expected range | DEMO.md | P1 |
| P5-EC-027 | Presenter has no API key live | Pre-record PDF or offline fixture mode | Fallback demo | P1 |

---

## Deployment (Vercel / production)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P5-EC-028 | Env vars not set in Vercel | Build succeeds; runtime 503 on API | Dashboard checklist | P0 |
| P5-EC-029 | Serverless function timeout on full pipeline | Split routes or increase `maxDuration` | Pro plan / optimize | P0 |
| P5-EC-030 | Rate limit spam on `/api/*` | `429` after N req/min per IP | Middleware | P1 |
| P5-EC-031 | CORS probe from external site | Deny non-same-origin | Default Next.js | P1 |
| P5-EC-032 | Cold start + PDF = timeout | Warm route or React-PDF | Architecture choice | P0 |
| P5-EC-033 | Build succeeds but Playwright missing in prod | Feature flag disable PDF in broken env | Health check | P1 |

---

## E2E tests

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P5-EC-034 | E2E without API key in CI | Mock API or skip tagged tests | `test.skipIf` | P1 |
| P5-EC-035 | Flaky download assertion | Wait for download event | Playwright | P1 |
| P5-EC-036 | Sample button → analyze timeout | Increase test timeout 120s | Config | P1 |

---

## Cross-cutting (end-to-end)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P5-EC-037 | User trusts score as guarantee | Disclaimer: not ATS guarantee | UI + PDF | P0 |
| P5-EC-038 | JD for wrong seniority (IC vs Manager) | Gap shows seniority mismatch | gap + match | P1 |
| P5-EC-039 | Same resume, two JDs in one session | New runId per analyze; clear or branch state | New run button | P1 |
| P5-EC-040 | Browser translate extension breaks layout | Out of scope; note in FAQ | P2 |

---

## Phase 5 exit checklist

- [ ] PDF/DOCX upload errors human-readable
- [ ] Extraction preview for file uploads
- [ ] Mobile review usable
- [ ] Samples load; DEMO.md steps pass once
- [ ] Production deploy completes golden path
- [ ] Rate limit on APIs

---

## Master demo golden path (regression)

Use this sequence before portfolio share:

1. Load `public/samples/sample-resume.txt` + `sample-jd.txt`
2. Analyze → original score + gaps visible
3. Tailor → side-by-side ≥3 bullets with reasons
4. Confirm disclaimer + any high-risk bullets
5. Export comparison PDF → open locally → disclaimer + scores present
6. Tailored score ≥ original (demo sample)

---

## Document index

[README.md](./README.md) · Phase 0–4 edge cases · [implementation-plan.md](../implementation-plan.md)
