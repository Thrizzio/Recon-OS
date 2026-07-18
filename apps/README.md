# Applications

This directory hosts deployable Recon-OS applications. It is intentionally empty in the
engineering-foundation phase.

- **Purpose:** Contain end-user and operator-facing surfaces built on the `packages/`
  libraries.
- **Audience:** Maintainers adding a new application (dashboard, CLI, SDK).
- **When to update:** When a new application package is introduced.
- **Expansion:** See phases 9-11 in `ROADMAP.md` (Dashboard, CLI, SDK).

## Planned applications

| Application | Roadmap phase | Description |
| ----------- | ------------- | ----------- |
| Dashboard | 9 | Observability and analytics surface. |
| CLI | 10 | Command-line entry point for local workflows. |
| SDK | 11 | Programmatic API for embedding Recon-OS. |

Each application should be its own package with an explicit boundary and its own
documentation. Do not add application code before the corresponding roadmap phase begins.
