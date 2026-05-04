# random-test-creator-web

Standalone frontend for the AST editor and preview UI.

## Structure

- `src/` - Preact frontend
- `tests/` - unit and Playwright tests
- `cp-ast-ecosystems/` - git submodule providing the Rust AST core and wasm crate
- `wasm/` - local build output from `cp-ast-wasm` (generated, not committed)

## Setup

```bash
git submodule update --init --recursive
npm install
```

## Development

```bash
npm run dev
```

This builds `cp-ast-ecosystems/crates/cp-ast-wasm` into `./wasm` before starting Vite.

For frontend-only iteration without rebuilding wasm:

```bash
npm run dev:fast
```

## Test

```bash
npm run test:unit
npm run test:e2e
```

## Deployment

Pushing a tag that starts with `v` triggers the GitHub Pages workflow.
The Pages build checks out `cp-ast-ecosystems` as a submodule, rebuilds wasm, and publishes `dist/`.
