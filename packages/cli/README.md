# @recon-os/cli

Reserved command-line interface for Recon-OS. This package will become the `recon`
CLI used for local workflows such as building datasets, running evaluations, and
comparing experiments (see phase 10 of `ROADMAP.md`).

- **Purpose:** Define the CLI identity and command contract.
- **Audience:** Contributors building the CLI; end users in later phases.
- **When to update:** When CLI commands are implemented (later phase).
- **Expansion:** Concrete commands are added in a later PR.

## Current state

This is a skeleton. `src/index.ts` exports `CLI_NAME`, `CLI_VERSION`, and the `Command`
contract (interface only). `bin/recon.mjs` is a runnable placeholder that prints the
tool name and a link to the roadmap, then exits. No command parsing or side effects
exist yet.

## Try it

```sh
node packages/cli/bin/recon.mjs
```

## Public surface

- `CLI_NAME`, `CLI_VERSION` — package identity.
- `Command` — the contract a CLI command implements.
