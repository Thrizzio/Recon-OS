# Roadmap

- **Purpose:** Explain what Recon-OS will become and why each step exists.
- **Audience:** Contributors deciding where to help; adopters planning adoption.
- **When to update:** When a phase starts, completes, or is reprioritized.
- **Expansion:** Each phase becomes one or more issues and pull requests as it begins.

This roadmap is phased so the project stays shippable at every step. Each phase is small
enough to review and lands behind the interfaces defined by earlier phases.

## Phase 1 — Engineering Foundation

Establish governance, documentation, and contribution workflow. **Why:** a project that
hundreds of contributors will share needs consistent rules and structure before code
appears, or technical debt accumulates in the first weeks.

## Phase 2 — Dataset Engine

Corpus ingestion, versioning, and reproducible splits. **Why:** every later evaluation and
experiment is only meaningful if the underlying data is versioned and comparable.

## Phase 3 — Chunking Engine

Deterministic, configurable chunking. **Why:** chunking directly affects retrieval quality;
it must be reproducible and isolated so its impact can be measured.

## Phase 4 — Embedding Engine

Pluggable embedding providers behind a stable interface. **Why:** embeddings are the
highest-leverage swap in RAG; an interface lets teams compare providers without code churn.

## Phase 5 — Vector Store Integration

Store-agnostic persistence and similarity search. **Why:** lock-in to one store blocks
adoption; an interface lets teams keep their existing infrastructure.

## Phase 6 — Retriever Framework

Hybrid retrieval and re-ranking. **Why:** retrieval quality is the dominant factor in answer
quality; it needs first-class, tunable strategies.

## Phase 7 — Evaluation Engine

Retrieval and generation quality measurement. **Why:** without evaluation, "improvement" is
anecdotal. This phase turns claims into comparable metrics.

## Phase 8 — Experiment Tracking

Versioned, comparable runs and metrics. **Why:** improvements must be attributable to
specific changes; tracking makes regressions detectable and reversible.

## Phase 9 — Dashboard

Observability and analytics surface. **Why:** humans need a read surface over experiments
and runtime signals to act on what tracking collects.

## Phase 10 — CLI

Command-line entry point. **Why:** local workflows (build, evaluate, compare) need a
low-friction interface before broader SDK adoption.

## Phase 11 — SDK

Programmatic API. **Why:** embedding Recon-OS in existing systems requires a stable,
documented API surface.

## Phase 12 — Production Release

Stabilize interfaces, document operations, and cut a stable release. **Why:** a production
release commits to backward compatibility and signals operational readiness.

## Status legend

- **In progress** — actively being worked on in the repository.
- **Planned** — scoped but not started.
