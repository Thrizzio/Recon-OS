# Getting Started

- **Purpose:** Help a new contributor or adopter orient themselves in Recon-OS.
- **Audience:** First-time visitors, contributors, and evaluators.
- **When to update:** When onboarding steps change or new entry points are added.
- **Expansion:** Add language-specific setup as packages gain build pipelines.

## Current status

Recon-OS is in its engineering-foundation phase. The monorepo workspace is in place, so
you can install dependencies and run the toolchain today. There is **no runnable
application yet** — the `apps/` and `packages/` are skeletons (identity, contracts, and
shared config only). Engine logic arrives in later phases.

## What you can do now

- Read [`../README.md`](../README.md) for vision, status, and the monorepo layout.
- Read [`../ARCHITECTURE.md`](../ARCHITECTURE.md) to understand the component model.
- Read [`../ROADMAP.md`](../ROADMAP.md) to see what is planned and why.
- Read [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) to learn how to contribute.

## Local setup

Recon-OS uses [pnpm](https://pnpm.io/) workspaces. Node 20+ is required.

```text
# from the repository root
corepack enable            # if pnpm is not already installed
pnpm install               # install all workspace dependencies
pnpm typecheck             # type-check every package
pnpm lint                  # lint every package
pnpm test                  # run the workspace validation suite
pnpm validate              # typecheck + lint + boundary checks
```

`pnpm validate` is the fastest way to confirm your environment matches the workspace
contract. CI runs the same checks on every pull request.

## Where things live

| Path                 | Contents                                      |
| -------------------- | --------------------------------------------- |
| `packages/core`      | Shared domain types and interfaces.           |
| `packages/config`    | Shared TypeScript / ESLint / Prettier config. |
| `packages/sdk`       | Reserved SDK client contract.                 |
| `packages/cli`       | Reserved CLI surface.                         |
| `apps/api`           | Reserved backend service skeleton.            |
| `apps/web`           | Reserved dashboard frontend skeleton.         |
| `docs/architecture/` | Per-module specifications and ADRs.           |

## Next steps for contributors

1. Run the local setup above and confirm `pnpm validate` passes.
2. Find or open an issue aligned with a roadmap phase.
3. Follow the branch and commit conventions in `CONTRIBUTING.md`.
4. Open a pull request using the repository template.
