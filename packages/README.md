# Packages

This directory hosts the reusable Recon-OS libraries and shared tooling. Each package is
its own workspace member under `packages/*`.

- **Purpose:** Contain the modular components and shared config that make up the platform.
- **Audience:** Maintainers implementing a library, engine, or interface.
- **When to update:** When a package is added or its responsibility changes.
- **Expansion:** Engine packages (dataset, chunking, embedding, and others) are added in
  later phases; see `ROADMAP.md`.

## Current packages

| Package | Responsibility | State |
| ------- | -------------- | ----- |
| [`@recon-os/core`](core) | Shared domain types and interfaces (the platform vocabulary). | Types only; no logic. |
| [`@recon-os/config`](config) | Shared TypeScript, ESLint, and Prettier configuration. | Tooling; not built. |
| [`@recon-os/sdk`](sdk) | Reserved client contract for embedding Recon-OS. | Interface skeleton. |
| [`@recon-os/cli`](cli) | Reserved command-line surface. | Identity + command contract. |

## Planned engine packages

| Package | Roadmap phase | Responsibility |
| ------- | ------------- | -------------- |
| dataset-engine | 2 | Corpus versioning and reproducible splits. |
| chunking-engine | 3 | Deterministic, configurable chunking. |
| embedding-engine | 4 | Pluggable embedding providers. |
| vector-store | 5 | Store-agnostic persistence and search. |
| retriever | 6 | Hybrid retrieval and re-ranking. |
| evaluation-engine | 7 | Retrieval and generation quality measurement. |
| experiment-tracking | 8 | Versioned, comparable runs and metrics. |

## Boundaries

- Engine packages build on `@recon-os/core` for their domain types.
- Each package exposes a stable interface and ships its own specification under
  [`docs/architecture/`](../docs/architecture/).
- Do not add a package before the corresponding roadmap phase begins.
