# Web Development Principles

## Change Workflow
- Work E2E-first for `web/` changes
- Before changing implementation, write or update Playwright tests that describe the intended behavior
- Align with the user on the detailed behavior change before making the implementation pass
- For every `web/` task, run the full test suites before finishing, even if the change looks indirect
- Do not rely on "unrelated" assumptions; run all Rust tests, web unit tests, and web E2E tests because indirect regressions are possible

## Architecture
- Keep domain logic in Rust, primarily under `cp-ast-core`, `cp-ast-json`, and `cp-ast-wasm`
- Keep the view layer focused on rendering projection results and issuing declarative `Action` requests
- Do not patch behavior in the view with ad-hoc logic when the rule belongs to projection, operation, or serialization boundaries
- Prefer extending projection/action APIs over adding UI-local branching that duplicates domain rules
- Treat frontend state as UI state; semantic decisions about AST structure, edit legality, defaults, and transformations should live on the Rust side

## Repository Layout
- This repository is the standalone frontend.
- `cp-ast-ecosystems/` is consumed as a git submodule.
- Build browser bindings from `cp-ast-ecosystems/crates/cp-ast-wasm` into the local `wasm/` directory.
