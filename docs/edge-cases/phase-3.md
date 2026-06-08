# Phase 3 — Edge Cases (PDF Export)

**Phase goal:** Server-side tailored + comparison PDF download.  
**Reference:** [implementation-plan.md § Phase 3](../implementation-plan.md#phase-3--pdf-export) · [architecture.md §12](../architecture.md)

---

## Export API (`POST /api/export`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P3-EC-001 | Export before tailor complete | `400` — run not ready | Check `status === "tailored"` | P0 |
| P3-EC-002 | Missing `TailoringRun` in request body | `400` if client must send full run | Validate body schema | P0 |
| P3-EC-003 | Incomplete run (no `gapAnalysis`) | Comparison PDF still renders; gaps section empty | Template conditional | P1 |
| P3-EC-004 | `format: "both"` | Return two files or zip; document choice | `pdf-generator` | P1 |
| P3-EC-005 | Invalid `format` enum | `400` | Zod | P0 |
| P3-EC-006 | `runId` only but server has no cache | `404` or require full payload | MVP: send full run in body | P0 |
| P3-EC-007 | Malformed `TailoringRun` in body | `400` schema validation | Zod before render | P0 |

---

## PDF renderer (Playwright / Puppeteer / React-PDF)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P3-EC-008 | Chromium not found on Vercel | Fallback renderer or Docker; clear deploy doc | `@sparticuz/chromium` or React-PDF | P0 |
| P3-EC-009 | Render timeout (>60s) | `EXPORT_FAILED` + suggest fewer bullets | Route `maxDuration` | P0 |
| P3-EC-010 | Out of memory large HTML | Paginate content; limit bullets in PDF | Template slice | P1 |
| P3-EC-011 | Font files missing in serverless | Use system/web-safe fonts only | `Arial`, `Helvetica` | P0 |
| P3-EC-012 | Playwright launch fails locally | README troubleshooting; dev uses React-PDF | Env flag `PDF_RENDERER` | P1 |
| P3-EC-013 | Concurrent export requests | Queue or separate browser per request | Limit parallelism | P2 |

---

## Comparison PDF template

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P3-EC-014 | 40+ changed bullets | Paginate; continue on next pages | CSS `page-break` | P0 |
| P3-EC-015 | Bullet text extremely long | Wrap in column; reduce font in PDF only | Print CSS `font-size: 9pt` | P1 |
| P3-EC-016 | Original vs tailored column misalignment | Row-based layout per bullet pair | Table or grid per bullet | P0 |
| P3-EC-017 | Unchanged bullet in experience | Show same text both sides or omit from diff section | Policy: show all or only changed | P1 |
| P3-EC-018 | Missing `company` in JD | Header shows job title only | Optional chaining | P0 |
| P3-EC-019 | Score explanation wraps awkwardly | Max 2 lines in header | Truncate with ellipsis | P1 |
| P3-EC-020 | Gap table > 20 rows | Second page; smaller font | Page break before gaps | P1 |
| P3-EC-021 | Special characters in PDF (emoji, ©) | Embed UTF-8 font or strip emoji | Font subset | P1 |
| P3-EC-022 | Disclaimer missing | Fail QA — footer on **every** page | `@page` margin + footer | P0 |
| P3-EC-023 | Highlight color not visible in B&W print | Use border-left + bold, not color alone | Dual cue | P1 |

---

## Tailored resume PDF template

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P3-EC-024 | No tailored summary | Use original summary | Fallback in template | P0 |
| P3-EC-025 | `tailoredSkills` undefined | Use original skills order | Fallback | P0 |
| P3-EC-026 | Mixed tailored/original bullets per role | Per-bullet: use tailored if present | Map bullets | P0 |
| P3-EC-027 | Contact email long string | Wrap; don't overflow margin | CSS | P1 |
| P3-EC-028 | No projects/education sections | Omit empty sections | Conditional render | P0 |
| P3-EC-029 | User expects US Letter vs A4 | Default Letter; document in README | `format: "Letter"` | P2 |

---

## Client download UX

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P3-EC-030 | base64 response huge | Prefer `blob` stream or `Content-Disposition` attachment | API response type | P1 |
| P3-EC-031 | Safari blocks download | Use `<a download>` + blob URL revoke | Client helper | P1 |
| P3-EC-032 | User double-clicks export | Disable button while loading | `isExporting` | P0 |
| P3-EC-033 | Export succeeds but popup blocked | Same-tab download | No `window.open` | P1 |
| P3-EC-034 | Client `TailoringRun` stale vs server | Prefer server-validated body from client state | Single source | P1 |

---

## Content integrity

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P3-EC-035 | HTML injection in resume bullet (`<script>`) | Escape all user text in template | React/text nodes | P0 |
| P3-EC-036 | PDF shows pre-guardrail tailored text | Export uses same data as review UI | Single `TailoringRun` object | P0 |
| P3-EC-037 | `riskFlag` bullets in comparison PDF | Show risk indicator in footnote | Optional Phase 4 sync | P2 |

---

## Phase 3 tests

| ID | Test |
|----|------|
| P3-EC-038 | Fixture run → comparison PDF buffer length > 1KB |
| P3-EC-039 | Fixture run → tailored PDF renders contact name |
| P3-EC-040 | Export without `tailoredResume` → 400 |
| P3-EC-041 | Manual: open PDF, search disclaimer text |

---

## Phase 3 exit checklist

- [ ] Comparison PDF has scores, columns, gaps, disclaimer
- [ ] Tailored PDF has no diff highlights
- [ ] Export gated on tailored status
- [ ] XSS-safe template rendering
- [ ] Serverless PDF path documented if deploying

---

## See also

Export confirmation gates: [phase-4.md](./phase-4.md).
