# @recon-os/config

Shared tooling configuration for the Recon-OS monorepo. It is the single home for
cross-package lint, format, and TypeScript settings so that every package stays
consistent without duplicating configuration.

- **Purpose:** Provide one source of truth for `tsconfig`, ESLint, and Prettier.
- **Audience:** Every workspace package (and contributors editing tooling).
- **When to update:** When compiler, lint, or format rules change project-wide.
- **Expansion:** Add new shared configs (for example, a test preset) here.

## What it provides

| File | Consumer | Use |
| ---- | -------- | --- |
| `tsconfig.base.json` | TypeScript packages | Base compiler options, extended per package. |
| `eslint.config.js` | Root `eslint.config.js` | Flat ESLint config, re-exported at the repo root. |
| `prettier.config.js` | Root `prettier.config.js` | Formatter options, re-exported at the repo root. |

## How packages consume it

- TypeScript packages extend `../../packages/config/tsconfig.base.json`.
- The root `eslint.config.js` and `prettier.config.js` re-export the configs here,
  so child packages need no ESLint or Prettier config of their own.

This package contains configuration only. It has no runtime source and is not built.
