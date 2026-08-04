# Contributing to Recon-OS

Thank you for considering a contribution. Recon-OS is designed for many contributors over
many years, so the process below optimizes for clarity and reviewability over raw speed.

- **Who should read this:** Anyone opening an issue or pull request.
- **When to update:** When the process changes or a convention is added.
- **Expansion:** Contributor-facing deep dives live under
  [`docs/contributing/`](docs/contributing/).

## Development philosophy

- Small, reviewable changes beat large ones.
- Documentation is part of the change, not an afterthought.
- Status is stated honestly: never present planned work as done.
- Interfaces are discussed before implementations.

## Getting started

1. Fork the repository and clone your fork.
2. Create a branch from `main` (see branch naming).
3. Make focused changes with clear commits.
4. Open a pull request using the template.

## Branch naming

Use a short `area/description` prefix:

| Prefix        | Use                                    |
| ------------- | -------------------------------------- |
| `foundation/` | Governance, docs, repo hygiene         |
| `docs/`       | Documentation changes                  |
| `feat/`       | New functionality (once modules exist) |
| `fix/`        | Bug fixes                              |
| `chore/`      | Maintenance with no behavior change    |

Example: `docs/add-retriever-rationale`.

## Commit conventions

- Use imperative mood in the subject: "add", "fix", "remove", not "added".
- Keep the subject under 72 characters.
- Separate subject from body with a blank line.
- Explain _why_ in the body when the reason is not obvious.
- One logical change per commit.

Example:

```text
add chunking interface draft

Defines the contract retrievers and stores depend on so the
chunking engine can be implemented behind it later.
```

## Issue workflow

- Search existing issues before opening a new one.
- Use the correct template (bug, feature, documentation, question).
- For features, describe the problem being solved, not just the desired output.
- Link related pull requests once opened.

## Pull request workflow

1. Open the PR against `main`.
2. Fill in every section of the PR template.
3. Ensure CI passes.
4. Request review from the relevant CODEOWNERS.
5. Address review feedback with follow-up commits or squash as agreed.

## Code review expectations

- Reviewers check correctness, clarity, tests, and documentation impact.
- Be explicit about blocking vs. non-blocking comments.
- Keep PRs small; large PRs are harder to review and merge.
- Assume good intent; critique the code, not the author.

## Documentation expectations

- Public behavior changes require documentation updates.
- New components require an architecture note under `docs/architecture/`.
- Keep [README.md](README.md), [ARCHITECTURE.md](ARCHITECTURE.md), and
  [ROADMAP.md](ROADMAP.md) consistent with reality.

## Communication expectations

- Be respectful and concise.
- Discuss significant design changes in an issue before implementing.
- Use GitHub for asynchronous, public discussion.

## Repository etiquette

- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Do not force-push to `main`.
- Do not merge your own PR without review except for trivial, explicitly allowed fixes.
- Keep discussions public so future contributors can learn from them.
