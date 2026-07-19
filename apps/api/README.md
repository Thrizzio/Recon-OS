# @recon-os/api

Reserved backend service for Recon-OS. This package will host the API that the web
dashboard and SDK talk to (see phases 5-8 and 11 of `ROADMAP.md`).

- **Purpose:** Hold the backend service boundary.
- **Audience:** Backend contributors (later phases).
- **When to update:** When the API service is implemented.
- **Expansion:** Routes, handlers, and middleware are added in a later PR.

## Current state

This is a skeleton. `src/index.ts` exports `API_NAME` and `API_VERSION`.
`src/server.ts` defines the `ApiServer` and `ApiServerOptions` contracts as interfaces
only. No HTTP framework, routes, or handlers exist yet, so the `build` script is a
placeholder.

## Public surface

- `API_NAME`, `API_VERSION` — package identity.
- `ApiServer`, `ApiServerOptions` — the server lifecycle contract.
