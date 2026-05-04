# E2E Tests — Competitive Programming AST Editor

## 概要

このディレクトリには、AST Editor の E2E テストが含まれる。
`doc/view/proccess.md` の E2E 先行設計方針に基づき、**ユーザー操作順序を先に固定**し、UI 実装はテストを通すために後から追う。

> **重要**: テストを変えて実装に合わせない。実装をテストの要求に合わせる。

## テスト実行

```bash
# 全テスト実行
npm run test:e2e

# UI モード（デバッグ用）
npm run test:e2e:ui
```

前提: `npm run dev` でローカルサーバーが起動していること（playwright.config.ts の `webServer` で自動起動される）。

## ディレクトリ構成

```
tests/e2e/
├── playwright.config.ts        # Playwright 設定
├── README.md                   # この文書
├── fixtures/
│   ├── editor-page.ts          # Page Object Model
│   └── helpers.ts              # 共通ヘルパー
├── basic-array.spec.ts         # カテゴリ 1: 基本配列
├── grid.spec.ts                # カテゴリ 2: グリッド
├── tree.spec.ts                # カテゴリ 3: 木入力
├── query.spec.ts               # カテゴリ 4: クエリ列
├── multi-testcase.spec.ts      # カテゴリ 5: 複数テストケース
├── graph.spec.ts               # カテゴリ 6: グラフ入力
└── ragged-array.spec.ts        # カテゴリ 7: 可変長配列列
```

## カテゴリと対応文書

| Spec ファイル | カテゴリ | フロー文書 | 参照問題 |
|--------------|---------|-----------|---------|
| basic-array.spec.ts | 基本配列 (N + A) | §1 | ABC395-A |
| grid.spec.ts | グリッド (H W + S) | §2 | ABC390-C |
| tree.spec.ts | 木入力 (辺リスト) | §3 | 典型 ABC-D |
| query.spec.ts | クエリ列 (Choice) | §4 | ABC395-D |
| multi-testcase.spec.ts | 複数テストケース | §5 | 典型マルチケース |
| graph.spec.ts | グラフ入力 (辺リスト) | §6 | ABC401-E, ABC408-E |
| ragged-array.spec.ts | 可変長配列列 (`N`, then `k_i A_{i,*}`) | 追加予定 | 典型可変長列入力 |

フロー文書: `doc/view/problem-user-flows.md`

## data-testid 契約

E2E テストは以下の `data-testid` に依存する。UI 実装時にこれらの testid を付与すること。

### Structure ペイン

| data-testid | 説明 |
|------------|------|
| `structure-pane` | Structure ペインのルート要素 |
| `insertion-hotspot-below` | 下に追加する hotspot |
| `insertion-hotspot-right` | 右に追加する hotspot |
| `insertion-hotspot-inside` | ブロック内に追加する hotspot |
| `insertion-hotspot-variant` | variant 追加用 hotspot |
| `structure-node-{nodeId}` | 個別ノード要素 |

補足:
- `structure-node-{nodeId}` は安定した行単位ターゲットとして使う
- hotspot は対象ノード行の内側から辿ることを推奨し、`first()` / `last()` 依存を避ける

### ポップアップ / ウィザード

| data-testid | 説明 |
|------------|------|
| `node-popup` | ノード種別選択ポップアップ |
| `popup-option-scalar` | scalar 選択 |
| `popup-option-array` | 横配列 選択 |
| `popup-option-tuple` | tuple 選択 |
| `popup-option-grid-template` | 文字グリッドテンプレート |
| `popup-option-edge-list` | 辺リストテンプレート |
| `popup-option-query-list` | クエリ列テンプレート |
| `popup-option-multi-testcase` | 複数テストケーステンプレート |
| `popup-option-repeat` | repeat 選択 |
| `popup-option-weighted-edge-list` | 重み付き辺リストテンプレート |
| `name-input` | 変数名入力フィールド |
| `weight-name-input` | 重み変数名入力 |
| `type-select` | 型選択ドロップダウン |
| `length-select` | 長さ参照先選択（互換用の hidden select） |
| `length-var-option-{name}` | length に代入可能な変数候補 (e.g., N) |
| `length-expression-input` | length の自由入力欄 |
| `count-field` | count 式フィールド |
| `count-var-option-{name}` | count に代入可能な変数候補 (e.g., N) |
| `count-expression-input` | count の自由入力欄 |
| `expression-element-{name}` | 式中のクリック可能な変数要素 |
| `function-op-{op}` | 関数適用ポップアップの操作 (subtract, add, multiply, divide, min, max) |
| `function-operand-input` | 関数 operand の自由入力欄 |
| `variant-tag-input` | variant タグ入力 |
| `confirm-button` | 確定ボタン |
| `node-edit-kind-select` | 既存 Structure ノード編集時の Scalar/Array 選択 |
| `node-edit-type-select` | 既存 Structure ノード編集時の型選択 |
| `node-edit-length-var-option-{name}` | 既存 Array ノード編集時の length 候補 |
| `node-edit-confirm` | 既存 Structure ノード編集の確定ボタン |

### Constraint ペイン

| data-testid | 説明 |
|------------|------|
| `constraint-pane` | Constraint ペインのルート要素 |
| `constraint-item-{index}` | draft/completed を統合した安定表示行 |
| `draft-constraint-{index}` | draft 制約（index は 0 始まり） |
| `completed-constraint-{index}` | 完成制約 |
| `constraint-lower-input` | Range 下限エリア（クリックで値ピッカー表示） |
| `constraint-upper-input` | Range 上限エリア（クリックで値ピッカー表示） |
| `constraint-value-literal` | 値ピッカー内の正整数自由入力欄 |
| `constraint-var-option-{name}` | 値ピッカー内の変数選択肢 (e.g., N) |
| `constraint-lower-expression` | 下限内のクリック可能な式要素（関数適用用） |
| `constraint-upper-expression` | 上限内のクリック可能な式要素（関数適用用） |
| `constraint-confirm` | 制約確定ボタン |
| `property-shortcut` | Property ショートカットボタン |
| `property-option-{name}` | Property 選択肢 (tree, simple, etc.) |
| `sumbound-shortcut` | SumBound ショートカットボタン |
| `sumbound-var-select` | SumBound 対象変数選択 |
| `sumbound-upper-input` | SumBound 上界エリア（クリックで値ピッカー表示） |
| `sumbound-upper-expression` | SumBound 上界内のクリック可能な式要素 |
| `charset-option-lowercase` | charset プリセット: 英小文字 |
| `charset-option-alpha` | charset プリセット: 英字 |
| `charset-option-alphanumeric` | charset プリセット: 英数字 |

### 右ペイン (Preview)

| data-testid | 説明 |
|------------|------|
| `preview-pane` | Preview ペインのルート要素 |
| `tex-input-format` | TeX 入力形式表示領域 |
| `tex-constraints` | TeX 制約表示領域 |
| `sample-output` | サンプルケース表示領域 |

### 数式編集

| data-testid | 説明 |
|------------|------|
| `math-editable-{id}` | クリック可能な数式要素 |
| `math-editor-input` | 数式編集入力欄 |
| `math-editor-confirm` | 数式確定ボタン |

## テストの現状

現在、全 E2E は `npm run test:e2e --prefix web` で pass することを期待する。

Phase 3（UI 実装）でテストを通すことが目標。

## 設計原則

1. **テストを変えて実装に合わせない** — 実装をテストの要求に合わせる
2. **右ペイン三要素は必須** — TeX 入力形式 + TeX 制約 + sample は全テストで検証
3. **Structure → draft 自動生成** — ノード追加時に draft constraint が自動生成されることを検証
4. **draft → completed 昇格** — 値入力後に constraint が completed に昇格することを検証
