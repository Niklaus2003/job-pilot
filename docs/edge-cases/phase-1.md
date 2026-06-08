# Phase 1 — Edge Cases (Static Prototype)

**Phase goal:** Full UI flow with mock `TailoringRun`; no real LLM/API.  
**Reference:** [implementation-plan.md § Phase 1](../implementation-plan.md#phase-1--static-prototype)

---

## Input UI (`ResumeInput`, `JDInput`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P1-EC-001 | Both textareas empty | Analyze/Tailor disabled | Button `disabled={!resume \|\| !jd}` | P0 |
| P1-EC-002 | Whitespace-only resume (`"   \n  "`) | Treat as empty | `.trim()` before validation | P0 |
| P1-EC-003 | User pastes 100k+ characters | Show char count; soft warn at limit (align with Phase 2 `MAX_*`) | Character counter + warning banner | P1 |
| P1-EC-004 | Paste with `\r\n` vs `\n` line endings | Display OK; store normalized `\n` | Normalize on change or submit | P1 |
| P1-EC-005 | HTML paste from LinkedIn (tags in text) | Show as plain text in textarea | Strip tags optional in Phase 5 | P2 |
| P1-EC-006 | User clears resume after Analyze | Reset or warn: "Analysis stale" | Clear downstream sections or show banner | P1 |
| P1-EC-007 | Load sample overwrites user text | Confirm dialog or undo toast | `Load sample` handler | P2 |
| P1-EC-008 | File upload clicked (stub) | "Coming in Phase 5" tooltip; no crash | Disabled input + message | P1 |

---

## Mock orchestrator (`lib/mock-orchestrator.ts`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P1-EC-009 | Double-click Analyze rapidly | Single in-flight mock; ignore duplicate | `isLoading` guard | P0 |
| P1-EC-010 | Mock delay interrupted (navigate away) | No state corruption on return | Abort or ignore stale promise | P1 |
| P1-EC-011 | Fixture missing `gapAnalysis.gaps` | UI shows "No gaps" empty state | `GapAnalysis` null-safe | P0 |
| P1-EC-012 | Fixture bullet count mismatch (3 original, 2 tailored) | Align by index; flag orphan in dev console | `SideBySideDiff` zip by index | P1 |
| P1-EC-013 | Tailor clicked before Analyze | Disable Tailor until `status >= analyzed` | Step gating | P0 |
| P1-EC-014 | Mock returns `tailoredMatch` lower than `originalMatch` | UI still renders both (demo may vary) | No assertion in Phase 1 | P2 |

---

## Client state (`useTailoringRun`, `sessionStorage`)

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P1-EC-015 | `sessionStorage` quota exceeded (~5MB) | Catch `QuotaExceededError`; toast + continue in-memory only | try/catch on `setItem` | P1 |
| P1-EC-016 | Corrupt JSON in `sessionStorage` | Clear key; restart flow | `JSON.parse` in try/catch | P0 |
| P1-EC-017 | Old schema version stored after deploy | Migrate or clear storage on version mismatch | `STORAGE_VERSION` key | P1 |
| P1-EC-018 | Private/incognito mode blocks storage | App works; warn persistence lost on refresh | Feature detect + banner | P1 |
| P1-EC-019 | User opens two tabs | Last write wins; optional tab conflict warning | P2 for MVP | P2 |
| P1-EC-020 | Browser back from `/tailor` | State restored from sessionStorage | Persist on each step | P1 |

---

## Display components

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P1-EC-021 | JD has 50+ required skills | Scrollable list; collapse "show more" | `JDSummary` | P1 |
| P1-EC-022 | Gap list empty | Empty state: "No significant gaps identified" | `GapAnalysis` | P0 |
| P1-EC-023 | Score explanation very long | Truncate with expand | `ScoreCard` | P1 |
| P1-EC-024 | `riskFlag` present in fixture | Badge visible on `BulletChangeCard` | Render optional field | P1 |
| P1-EC-025 | Mobile viewport side-by-side | Stack columns vertically | Responsive CSS | P0 |
| P1-EC-026 | Zero experience entries in fixture | Show education/projects only; no crash | Conditional sections | P0 |
| P1-EC-027 | Special chars in bullets (`<`, `&`) | Escaped in React text nodes | Default JSX escaping | P0 |
| P1-EC-028 | Export clicked (disabled) | No-op or tooltip "Phase 3" | `PDFExportButton` | P1 |

---

## Navigation & layout

| ID | Scenario | Expected behavior | Handler | Sev |
|----|----------|-------------------|---------|-----|
| P1-EC-029 | Direct URL `/tailor` without prior state | Empty inputs; no crash | Default initial state | P0 |
| P1-EC-030 | Landing CTA with no env | Navigate to tailor regardless | No API in Phase 1 | P0 |

---

## Phase 1 exit checklist

- [ ] Empty/whitespace inputs blocked
- [ ] Step order enforced (Analyze before Tailor)
- [ ] sessionStorage corrupt/quota handled
- [ ] Empty gaps and empty experience handled in UI
- [ ] Mobile layout does not overflow horizontally

---

## Handoff notes for Phase 2

Replace mock orchestrator with API calls; keep same UI contracts. Preserve `useTailoringRun` shape so components need minimal changes. See [phase-2.md](./phase-2.md).
