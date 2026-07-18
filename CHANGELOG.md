# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Engineering foundation: repository governance, documentation structure, and contribution
  workflow.
- `README.md` with project vision, problem statement, and status.
- `ARCHITECTURE.md` describing component responsibilities and expected data flow.
- `ROADMAP.md` with a phased plan from foundation to production release.
- `CONTRIBUTING.md` with branch, commit, issue, and PR conventions.
- `SECURITY.md` with a responsible-disclosure policy.
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
- `CODEOWNERS` prepared for future module maintainers.
- GitHub issue templates (bug, feature, documentation, question) and a pull request
  template.
- Minimal GitHub Actions workflow (`.github/workflows/ci.yml`).
- Cross-platform repository hygiene: `.gitignore`, `.editorconfig`, `.gitattributes`.

### Notes

- No application code, pipelines, or integrations are included in this release. They are
  introduced incrementally in later phases (see `ROADMAP.md`).

## [0.0.0] - 2026-07-18

### Added

- Initial repository scaffold (pre-foundation). This line predates the engineering
  foundation and is not a released version; it is recorded for traceability only.
