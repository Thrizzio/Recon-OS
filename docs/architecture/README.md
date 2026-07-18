# Architecture Documentation

- **Purpose:** Host detailed architecture specifications for individual components and
  decisions.
- **Audience:** Contributors implementing or reviewing a specific module.
- **When to update:** When a module is specified, or an architectural decision is recorded.
- **Expansion:** Each future module (see `ROADMAP.md`) gets its own document here.

This directory is the home for deep architectural content that would make
[`ARCHITECTURE.md`](../ARCHITECTURE.md) too long if inlined. The top-level document stays a
stable overview; specifics live here.

## Contents

| Document | Status | Description |
| -------- | ------ | ----------- |
| `ARCHITECTURE.md` (repo root) | Current | System-wide overview and data flow. |
| Module specs | Planned | One document per engine once specified. |
| ADRs | Planned | Architecture Decision Records for notable trade-offs. |

## Conventions

- Name module docs as `<module>-spec.md` (for example, `dataset-engine-spec.md`).
- Record decisions as `adr-NNN-<topic>.md` and reference them from module specs.
- Keep diagrams as Mermaid so they render on GitHub without external assets.
