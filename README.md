# Recon-OS

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![CI](https://github.com/hardikkaurani/Recon-OS/actions/workflows/ci.yml/badge.svg)](https://github.com/hardikkaurani/Recon-OS/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Engineering platform for production-grade Retrieval-Augmented Generation (RAG) systems.

Recon-OS helps engineering teams build, evaluate, benchmark, observe, and continuously
improve RAG systems. It is infrastructure, not another RAG framework or starter template.

## Vision

Production RAG is an engineering discipline, not a prompt. Recon-OS provides the durable
scaffolding that RAG systems need across their lifecycle: reproducible datasets, measurable
retrieval, comparable generations, and observable behavior in production.

The goal is a platform where every claim about a RAG system ("retrieval got better", "this
model is cheaper for our traffic", "the new chunker reduced latency") is backed by data
rather than intuition.

## Motivation

Most teams assemble RAG from framework tutorials and re-implement the same evaluation,
chunking, and observability glue on every project. The result is inconsistent quality, no
historical comparison, and no shared vocabulary across teams.

Recon-OS exists to make that infrastructure a shared, well-maintained asset:

- Evaluation is first-class, not an afterthought.
- Datasets and experiments are versioned and comparable.
- Components are modular so any store, model, or retriever can be swapped.
- Decisions are recorded so future contributors understand *why*, not just *what*.

## Problem statement

Building a RAG system that works in production requires more than a vector database and a
prompt. It requires:

- Reproducible datasets and corpus versions.
- Deterministic chunking and embedding strategies.
- Retrieval that can be measured against labeled relevance.
- Generation that can be evaluated beyond "looks right".
- Experiment tracking to compare changes over time.
- Observability to detect regressions in production.

Today these concerns are scattered across bespoke scripts and framework defaults. Recon-OS
consolidates them into a single, opinionated-but-extensible engineering platform.

## Long-term goals

- A modular component model where stores, embedders, retrievers, and evaluators are
  interchangeable behind stable interfaces.
- A dataset and experiment layer that makes every change measurable and reversible.
- First-class evaluation covering retrieval quality, generation faithfulness, and cost.
- Observability and analytics that surface regressions before users do.
- A CLI and SDK that let teams adopt Recon-OS incrementally, without a rewrite.

## Status

Recon-OS is in its engineering-foundation phase. The repository currently establishes
governance, documentation structure, and the contribution workflow. Application code and
modules are introduced incrementally through later pull requests (see
[ROADMAP.md](ROADMAP.md)).

## Implemented features

The following are present in the repository today:

- Project governance: [LICENSE](LICENSE), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md),
  [CODEOWNERS](CODEOWNERS), [SECURITY.md](SECURITY.md).
- Contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md), issue templates, and a pull
  request template.
- Architecture and roadmap documentation: [ARCHITECTURE.md](ARCHITECTURE.md),
  [ROADMAP.md](ROADMAP.md).
- Continuous integration skeleton: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
- Cross-platform repository hygiene: [`.gitignore`](.gitignore),
  [`.editorconfig`](.editorconfig), [`.gitattributes`](.gitattributes).

No application code, pipelines, or integrations are implemented yet by design.

## Planned features

These are planned, not implemented. Each maps to a phase in [ROADMAP.md](ROADMAP.md).

- Dataset Engine for corpus versioning and reproducible splits.
- Chunking Engine with deterministic, configurable strategies.
- Embedding Engine with pluggable providers.
- Vector Store Integration behind a store-agnostic interface.
- Retriever Framework supporting hybrid and re-ranking strategies.
- Evaluation Engine for retrieval and generation quality.
- Experiment Tracking for versioned, comparable runs.
- Dashboard, CLI, and SDK for adoption and observability.

## Repository structure

```text
Recon-OS/
├── .github/                 # GitHub templates and CI
│   ├── ISSUE_TEMPLATE/      # Bug, feature, documentation, question templates
│   ├── workflows/           # CI definitions
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                    # Documentation tree
│   ├── architecture/        # Architecture deep-dives (future modules)
│   ├── contributing/        # Contributor-facing docs
│   └── getting-started/     # Onboarding
├── apps/                    # Deployable applications (dashboard, CLI, SDK)
├── packages/                # Reusable libraries (engines and interfaces)
├── ARCHITECTURE.md          # Architecture overview
├── ROADMAP.md               # Phased plan
├── CONTRIBUTING.md          # Contributor guide
├── SECURITY.md              # Vulnerability disclosure policy
├── CHANGELOG.md             # Keep a Changelog entries
├── CODE_OF_CONDUCT.md       # Contributor Covenant 2.1
├── CODEOWNERS               # Review ownership
├── LICENSE                  # Apache License 2.0
├── .editorconfig            # Editor formatting
├── .gitattributes           # Line-ending normalization
└── .gitignore               # Polyglot monorepo ignores
```

## Architecture summary

Recon-OS models the RAG lifecycle as a sequence of discrete, replaceable components:
ingestion, chunking, embedding, vector storage, retrieval, generation, evaluation, and
analytics. Each component exposes a stable interface so implementations can evolve
independently. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design and a data-flow
diagram.

## Engineering principles

- **Clarity over cleverness.** Code and docs should be understood on first read.
- **Maintainability over speed.** Decisions favor long-term cost reduction.
- **Modularity over monoliths.** Components are isolated behind explicit interfaces.
- **Documentation as a deliverable.** A change without docs is an incomplete change.
- **No premature optimization.** Solve the problem that exists, not the one imagined.
- **Honesty about status.** Implemented and planned work are never conflated.

## Roadmap summary

| Phase | Milestone | Status |
| ----- | --------- | ------ |
| 1 | Engineering Foundation | In progress |
| 2 | Dataset Engine | Planned |
| 3 | Chunking Engine | Planned |
| 4 | Embedding Engine | Planned |
| 5 | Vector Store Integration | Planned |
| 6 | Retriever Framework | Planned |
| 7 | Evaluation Engine | Planned |
| 8 | Experiment Tracking | Planned |
| 9 | Dashboard | Planned |
| 10 | CLI | Planned |
| 11 | SDK | Planned |
| 12 | Production Release | Planned |

See [ROADMAP.md](ROADMAP.md) for the rationale behind each phase.

## Contributing

Recon-OS is built for many contributors over many years. Read
[CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Short version:

1. Open or claim an issue describing the change.
2. Branch from `main` using the documented naming convention.
3. Keep commits focused and follow the commit conventions.
4. Open a PR using the provided template and fill in every section.

## License

Recon-OS is released under the [Apache License 2.0](LICENSE).
