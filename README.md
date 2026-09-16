[![DeepWiki](https://img.shields.io/badge/DeepWiki-manabeai%2Frandom--test--creator--web-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/manabeai/random-test-creator-web)

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

## 数式による制約編集

入力形式の変数を選び、値の範囲・文字列長の「数式で編集」を開くと、上下限を式で指定できます。
`N - 1`、`(N - 1) * 2`、`2 * 10^5`、`min(N, 100)` などを直接入力するか、変数候補と演算ボタンで組み立てます。
演算は選択中の下限または上限の式全体に適用され、「制約を適用」で上下限をまとめて確定します。
通常の数値入力では従来どおりスライダーとフォーカスを外したときの保存が使えます。

「総和を追加」から数値変数と上限を指定できます。追加済みの総和は制約行から再編集でき、変更・削除は取り消せます。
式の解析・合成、参照候補、スコープと循環依存の判定、定数区間の検証は Rust が担当します。
入力エラーは編集欄に表示され、確定済みの制約と生成結果を保持したまま修正できます。

## Test

```bash
npm run test:unit
npm run test:e2e
```

数式のブラウザ操作は `tests/e2e/constraint-expressions.spec.ts`、解析・再投影・TeX・候補の検証は
`cp-ast-ecosystems/crates/cp-ast-core/tests/expression_editing.rs` にあります。
Rust 全体のテストは `cargo test --workspace --manifest-path cp-ast-ecosystems/Cargo.toml` で実行します。

## Deployment

Pushing a tag that starts with `v` triggers the Cloudflare Workers workflow.
The GitHub Actions runner checks out `cp-ast-ecosystems` as a submodule,
rebuilds wasm, builds the frontend, and deploys `dist/` as static assets
to the `random-test-creator` Worker via `wrangler deploy`.

### Prerequisites

1. A Cloudflare Workers project named `random-test-creator` must exist
2. Generate a Cloudflare API token with **Workers Scripts — Edit** permission
3. Add these GitHub repository secrets:
   - `CLOUDFLARE_API_TOKEN` — your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID (found in the Cloudflare dashboard URL)
