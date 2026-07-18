# Getting Started

- **Purpose:** Help a new contributor or adopter orient themselves in Recon-OS.
- **Audience:** First-time visitors, contributors, and evaluators.
- **When to update:** When onboarding steps change or new entry points are added.
- **Expansion:** Add language-specific setup once the first package exists.

## Current status

Recon-OS is in its engineering-foundation phase. The repository today contains governance,
documentation, and contribution workflow only. There is **no application code to install or
run yet**. This is intentional: the foundation must be correct before modules are built on
top of it.

## What you can do now

- Read [`../README.md`](../README.md) for vision and status.
- Read [`../ARCHITECTURE.md`](../ARCHITECTURE.md) to understand the component model.
- Read [`../ROADMAP.md`](../ROADMAP.md) to see what is planned and why.
- Read [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) to learn how to contribute.

## Where things will live

| Path | Future contents |
| ---- | --------------- |
| `packages/` | Reusable engines and interfaces (dataset, chunking, embedding, and others). |
| `apps/` | Deployable surfaces (dashboard, CLI, SDK). |
| `docs/architecture/` | Per-module specifications and ADRs. |

## Next steps for contributors

1. Find or open an issue aligned with a roadmap phase.
2. Follow the branch and commit conventions in `CONTRIBUTING.md`.
3. Open a pull request using the repository template.

Detailed local-setup instructions will be added here when the first package is introduced.
