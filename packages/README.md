# Packages

This directory hosts reusable Recon-OS libraries (engines and interfaces). It is
intentionally empty in the engineering-foundation phase.

- **Purpose:** Contain the modular components that make up the RAG lifecycle.
- **Audience:** Maintainers implementing a new engine or interface.
- **When to update:** When a new package is introduced.
- **Expansion:** See phases 2-8 and 11 in `ROADMAP.md`.

## Planned packages

| Package | Roadmap phase | Responsibility |
| ------- | ------------- | -------------- |
| dataset-engine | 2 | Corpus versioning and reproducible splits. |
| chunking-engine | 3 | Deterministic, configurable chunking. |
| embedding-engine | 4 | Pluggable embedding providers. |
| vector-store | 5 | Store-agnostic persistence and search. |
| retriever | 6 | Hybrid retrieval and re-ranking. |
| evaluation-engine | 7 | Retrieval and generation quality measurement. |
| experiment-tracking | 8 | Versioned, comparable runs and metrics. |

Each package must expose a stable interface and ship with its own specification under
[`docs/architecture/`](../docs/architecture/). Do not add packages before the corresponding
roadmap phase begins.
