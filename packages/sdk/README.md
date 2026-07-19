# @recon-os/sdk

Reserved programmatic surface for Recon-OS. This package will become the SDK that
lets other systems embed Recon-OS (see phase 11 of `ROADMAP.md`).

- **Purpose:** Define the client contract applications use to talk to a Recon-OS
  deployment.
- **Audience:** Authors of applications and external integrations.
- **When to update:** When the SDK contract is finalized (later phase).
- **Expansion:** Concrete transport and providers are implemented in a later PR.

## Current state

This is a contract skeleton. `src/client.ts` defines `ReconOSClient` and
`ReconOSClientOptions` as interfaces only; no HTTP calls, no auth, no network I/O.
`src/index.ts` also exports `SDK_NAME` and `SDK_VERSION` as real, importable values.

## Public surface

- `ReconOSClient` — the client contract.
- `ReconOSClientOptions` — construction options.
- `SDK_NAME`, `SDK_VERSION` — package identity.

Method payloads are intentionally `unknown` until the internal domain types are
finalized. Do not build production logic on this surface yet.
