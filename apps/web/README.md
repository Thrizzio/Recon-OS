# @recon-os/web

Reserved dashboard frontend for Recon-OS. This package will become the web dashboard
for observability and experiment analytics (see phase 9 of `ROADMAP.md`).

- **Purpose:** Hold the dashboard frontend boundary.
- **Audience:** Frontend contributors (later phases).
- **When to update:** When the dashboard is implemented.
- **Expansion:** The UI framework and routes are chosen in a later PR.

## Current state

This is a skeleton. `src/index.ts` exports `WEB_NAME`, `WEB_VERSION`, and the
`DashboardRoute` contract as an interface. No UI framework, bundler, or components
exist yet, so the `build` script is a placeholder.

## Public surface

- `WEB_NAME`, `WEB_VERSION` — package identity.
- `DashboardRoute` — the route contract.
