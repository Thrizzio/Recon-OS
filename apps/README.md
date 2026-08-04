# Applications

This directory hosts the deployable Recon-OS applications. Each application is its own
workspace package under `apps/*` so it can be built, tested, and released independently.

- **Purpose:** Contain end-user and operator-facing surfaces built on the `packages/`
  libraries.
- **Audience:** Maintainers adding or working on an application.
- **When to update:** When an application package is added or its scope changes.
- **Expansion:** See phases 9-11 in `ROADMAP.md` (Dashboard, CLI, SDK).

## Packages

| Package                | Roadmap phase | Description         | State                                               |
| ---------------------- | ------------- | ------------------- | --------------------------------------------------- |
| [`@recon-os/api`](api) | 5-8, 11       | Backend service.    | Skeleton: identity + server contract, no endpoints. |
| [`@recon-os/web`](web) | 9             | Dashboard frontend. | Skeleton: identity + route contract, no UI.         |

## Boundaries

- Applications depend on `packages/*` libraries; libraries never depend back on
  applications. This is enforced by `scripts/check-boundaries.mjs`.
- Each application owns its framework choice and build pipeline (added in later phases).
- Do not add application logic before the corresponding roadmap phase begins.
