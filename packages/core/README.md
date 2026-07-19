# @recon-os/core

Shared domain types, interfaces, and primitives for Recon-OS. Every other package
that models RAG concepts depends on this one for its vocabulary.

- **Purpose:** Define the common data contracts of the platform (documents, chunks,
  embeddings, retrieval, generation, evaluation, experiments).
- **Audience:** Authors of engine and application packages.
- **When to update:** When the platform's domain model changes.
- **Expansion:** New domain types are added here as modules are specified.

## Scope

This package is types and interfaces only. It contains no runtime logic, no I/O, and
no provider integrations. That keeps it cheap to depend on and safe to import anywhere.

## Public surface

- `src/types.ts` — the domain model (`Document`, `Chunk`, `Embedding`,
  `RetrievalQuery`, `RetrievalResult`, `GenerationRequest`, `GenerationResponse`,
  `EvaluationMetric`, `Experiment`).
- `src/index.ts` — re-exports the domain model.

## Usage

```ts
import type { Document, Chunk } from "@recon-os/core";
```

The build emits declarations to `dist/`; the source under `src/` is the single source
of truth.
