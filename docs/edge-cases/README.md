# Edge Cases — Resume Shapeshifter

Reference docs for implementers. Each file lists edge cases for one [implementation plan](../implementation-plan.md) phase: scenario, expected behavior, where to handle, and how to test.

| Phase | Document | When to use |
|-------|----------|-------------|
| **0** | [phase-0.md](./phase-0.md) | Bootstrap, schemas, fixtures, tooling |
| **1** | [phase-1.md](./phase-1.md) | Static UI, mock data, client state |
| **2** | [phase-2.md](./phase-2.md) | LLM, parsers, APIs, orchestration |
| **3** | [phase-3.md](./phase-3.md) | PDF generation and export |
| **4** | [phase-4.md](./phase-4.md) | Guardrails, validation, export gates |
| **5** | [phase-5.md](./phase-5.md) | File upload, polish, deployment, demo |

**Conventions**

- **Severity:** `P0` = must handle before phase exit · `P1` = should handle in phase · `P2` = document/defer with UX note
- **Handler:** suggested file or layer
- IDs are stable (`P0-EC-001`) for tests and PR checklists

**Related:** [architecture.md](../architecture.md) · [problemStatement.md](../problemStatement.md)
