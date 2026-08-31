---
name: "Random Test Creator（仮称）"
description: "競技プログラミングの入力形式をその見た目のまま組み、同じ定義からランダムケースを得る精密な作業台"
colors:
  paper: "#f7f8fa"
  paper-raised: "#ffffff"
  paper-canvas: "#fbfcfd"
  output-dock: "#f1f4f5"
  ink: "#101827"
  body: "#344252"
  muted: "#526273"
  rule: "#dce3e8"
  rule-soft: "#e8edf1"
  rule-control: "#82939f"
  rule-control-soft: "#cbd6dd"
  rule-dock: "#c8d4dc"
  rule-subtle: "#c7d3db"
  focus: "#006a7a"
  focus-deep: "#005565"
  focus-wash: "#e2f0f2"
  focus-soft: "#a9d9df"
  focus-on-ink: "#bfe9ed"
  focus-shadow: "rgb(23 54 62 / 28%)"
  ink-deep: "#08151b"
  ink-math: "#111820"
  ink-selected: "#08282e"
  danger: "#b92f40"
  danger-wash: "#fff0f1"
  danger-deep: "#8f2432"
  danger-shadow: "rgb(69 18 26 / 28%)"
  success: "#137a54"
  control-hover: "#9fb0ba"
  control-disabled: "#a9b4bd"
  icon-add: "#788995"
  icon-disabled: "#84929d"
  icon-quiet: "#9ca8b1"
  dock-muted: "#98a4ad"
typography:
  ui-title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans JP", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif'
    fontSize: "22px"
    fontWeight: 760
    letterSpacing: "-0.025em"
  ui-identity:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans JP", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif'
    fontSize: "17px"
    fontWeight: 760
    letterSpacing: "-0.015em"
  ui-body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans JP", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif'
    fontSize: "13px"
    fontWeight: 400
  ui-label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans JP", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif'
    fontSize: "11px"
    fontWeight: 720
    lineHeight: 1.4
  ui-micro:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans JP", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif'
    fontSize: "10px"
    fontWeight: 650
  ui-compact:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans JP", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif'
    fontSize: "12px"
    fontWeight: 650
  ui-input:
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
    fontSize: "15px"
    fontWeight: 720
  ui-title-mobile:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans JP", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif'
    fontSize: "20px"
    fontWeight: 760
  ui-action:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans JP", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif'
    fontSize: "15px"
    fontWeight: 720
  math-notation:
    fontFamily: 'KaTeX_Main, "STIX Two Math", "Times New Roman", serif'
    fontSize: "clamp(34px, 3.2vw, 48px)"
    fontWeight: 400
    lineHeight: 1.18
  math-notation-mobile:
    fontFamily: 'KaTeX_Main, "STIX Two Math", "Times New Roman", serif'
    fontSize: "clamp(29px, 9vw, 38px)"
    fontWeight: 400
    lineHeight: 1.18
  math-notation-small:
    fontFamily: 'KaTeX_Main, "STIX Two Math", "Times New Roman", serif'
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.18
  sample-mono:
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
    fontSize: "clamp(18px, 1.6vw, 23px)"
    fontWeight: 400
    lineHeight: 1.8
  mono-control:
    fontFamily: '"SFMono-Regular", Consolas, monospace'
    fontSize: "12px"
    fontWeight: 690
  mono-axis:
    fontFamily: '"SFMono-Regular", Consolas, monospace'
    fontSize: "14px"
    fontWeight: 720
  mono-bound:
    fontFamily: '"SFMono-Regular", Consolas, monospace'
    fontSize: "12px"
    fontWeight: 400
  mono-micro:
    fontFamily: '"SFMono-Regular", Consolas, monospace'
    fontSize: "11px"
    fontWeight: 400
rounded:
  selected-token: "5px"
  text-action: "6px"
  chip: "7px"
  control: "8px"
  field: "10px"
  preview: "12px"
  inspector: "14px"
  status: "999px"
spacing:
  micro: "4px"
  compact: "8px"
  control: "10px"
  inline: "12px"
  cluster: "16px"
  section: "20px"
  roomy: "24px"
  dock: "28px"
components:
  button-primary:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.ui-action}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "48px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    typography: "{typography.ui-body}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.control}"
    padding: "0 13px"
    height: "38px"
  name-chip:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.body}"
    typography: "{typography.mono-control}"
    rounded: "{rounded.chip}"
    padding: "0 7px"
    width: "34px"
    height: "38px"
  name-chip-draft:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.mono-control}"
    rounded: "{rounded.chip}"
    padding: "0 7px"
    width: "34px"
    height: "38px"
  type-switch-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-raised}"
    rounded: "{rounded.chip}"
    padding: "0 12px"
    height: "40px"
  axis-control:
    backgroundColor: "{colors.paper-canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.mono-axis}"
    rounded: "{rounded.field}"
    padding: "8px 10px 9px"
  interval-field:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.mono-bound}"
    rounded: "{rounded.chip}"
    padding: "0 7px"
    width: "76px"
    height: "34px"
  charset-option:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.body}"
    typography: "{typography.mono-micro}"
    rounded: "{rounded.chip}"
    padding: "0 9px"
    height: "35px"
  charset-option-active:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.mono-micro}"
    rounded: "{rounded.chip}"
    padding: "0 9px"
    height: "35px"
  selected-token:
    backgroundColor: "{colors.focus-wash}"
    textColor: "{colors.ink}"
    typography: "{typography.math-notation}"
    rounded: "{rounded.selected-token}"
    padding: "4px 8px 6px"
  caret-inspector:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inspector}"
    padding: "0"
  preview-tab-active:
    backgroundColor: "transparent"
    textColor: "{colors.focus-deep}"
    typography: "{typography.ui-label}"
    padding: "0 14px"
    height: "44px"
  sample-paper:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.sample-mono}"
    rounded: "{rounded.preview}"
    padding: "22px 24px"
  mobile-switch-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.ui-body}"
    rounded: "{rounded.control}"
    height: "44px"
---

# Design System: Random Test Creator（仮称）

## Overview

**Creative North Star: "問題文の上で考える精密作業台"**

入力形式は設定結果のプレビューではなく、利用者が直接読む・選ぶ・組み立てる中心オブジェクトである。冷たい白紙と濃紺のインクで競技プログラミングの問題文に近い静けさを保ち、同じ構造化ASTから入力形式、制約、生成ケースが一貫して投影されることを視覚上も明らかにする。画面の仕事は意味を飾ることではなく、改行、空白、反復位置を崩さず次の操作を最短距離に置くことにある。

選択した記号だけをシアンの括弧で捉え、その直下へ構造インスペクタを接続する。方向はカーソル横インスペクタ（順序2、seed `1afe0fe6`）であり、現在の表現は`index.html`先頭のサーフェス契約に従う。インスペクタではNumber／String／Char、横方向、縦方向、型に応じた制約を同じ記号の文脈で編集する。合法な型・軸候補、構造の解決、生成可否と回復先はRustの投影を正本とする。日本語の操作文字、数式の入力形式、monospaceの生成値という三つの声を明確に分け、常設面は色差と細い罫線、局所編集だけは柔らかな奥行きで示す。

**Key Characteristics:**

- 入力形式そのものを編集面にした、冷白の連続キャンバス
- 選択記号へ物理的に接続するカーソル横インスペクタ
- Number／String／Charと横・縦の反復を独立して掛け合わせる構造編集
- 数値・文字列長の区間入力と、文字集合の選択／直接入力を備えた型別制約
- Rustが合法な構造候補と生成可否／回復先を投影し、Webがそのまま操作へ結ぶ
- 入力形式は数式書体、操作は日本語システムサンセリフ、生成値はmonospace
- シアン／ティールを選択、フォーカス、主要操作へ限定
- デスクトップは入力形式64%／生成ケース36%、モバイルは一回の切り替えで片方を表示

## Colors

冷白の紙面をわずかな明度差で重ね、濃紺のインクと低彩度の青灰色で長時間読める作業面を作る。彩色は操作上の意味を持つティール、破壊的操作の赤、同期状態の緑に限る。

### Primary

- **選択シアン** (`focus`): 選択括弧、主要生成操作、チェック、アクティブな下線に使う。
- **深いティール** (`focus-deep`): 白い面上のリンク、ホバー文字、アクティブタブに使う。
- **選択ウォッシュ** (`focus-wash`): 数式記号の選択面だけを静かに塗る。

### Tertiary

- **削除レッド** (`danger`) と **削除ウォッシュ** (`danger-wash`): 削除の入口と確認状態だけに使う。
- **同期グリーン** (`success`): 定義と生成ケースの同期が成立している状態に使う。

### Neutral

- **クールペーパー** (`paper`): アプリ全体の基底。
- **白い浮上紙** (`paper-raised`): インスペクタ、入力欄、生成サンプルの局所面。
- **入力キャンバス** (`paper-canvas`): 問題文らしい入力形式の読み取り面。
- **出力ドック** (`output-dock`): 生成結果を入力形式から分ける冷たい灰白面。
- **ディープインク** (`ink`): 見出し、数式、重要値。
- **本文スレート** (`body`): 操作本文と通常コントロール。
- **可読ミュート** (`muted`): 補助説明、メタ情報、非アクティブタブ。
- **操作境界** (`rule-control`): 入力欄、選択肢、回復操作など意味を持つ1px境界。白い面とのコントラスト比を3:1以上に保つ。
- **追加アイコン** (`icon-add`): 常設の挿入点を判読できる濃さで示し、ホバー前から操作の所在を隠さない。
- **罫線** (`rule`) と **淡い罫線** (`rule-soft`): 面の分離と内部セクションの区切り。

### Named Rules

**The 意味を持つシアン Rule.** シアン／ティールは選択、フォーカス、主要操作、現在地だけに使い、装飾面積を増やすためには使わない。

**The 可読性床 Rule.** 通常サイズの文字は背景とのコントラスト比4.5:1以上、大きな文字と操作境界は3:1以上を保つ。補助文字は`muted`より薄くせず、罫線色を文字へ転用しない。

## Typography

**Display Font:** 大きな広告的display書体は設けず、日本語システムサンセリフを製品名と作業見出しにも使う。
**Body Font:** `-apple-system`, `BlinkMacSystemFont`, `Noto Sans JP`, `Yu Gothic UI`, `Hiragino Kaku Gothic ProN`, sans-serif。
**Math Font:** `KaTeX_Main`, `STIX Two Math`, `Times New Roman`, serif。
**Mono Font:** `SFMono-Regular`, `Consolas`, `Liberation Mono`, monospace。

**Character:** UIは日本語環境で即座に読める実務的なサンセリフ、入力形式は問題文の数式として読めるセリフ、生成ケースは標準入力として桁を追えるmonospaceを使う。書体の切り替え自体が「操作」「定義」「生成値」の境界になる。

### Hierarchy

- **UI Title** (760, 22px, -0.025em): 生成ケースなど作業面の見出し。モバイルでは20pxへ縮小する。
- **UI Identity** (760, 17px, -0.015em): 仮称の製品表示。モバイルでは15px。
- **UI Body** (400, 13px): 説明と通常操作。操作ラベルは650–760で強める。
- **UI Compact / Micro** (650, 12px / 10px): 小型ボタン、seed、状態、補助説明。
- **UI Input** (720, 15px): 変数名の中央揃え入力。
- **UI Label** (720, 11px, 1.4): 軸ラベル、フィールド名、状態、メタ情報。
- **UI Action** (720, 15px): 生成し直す主要操作。
- **Math Notation** (400, clamp(34px, 3.2vw, 48px), 1.18): 入力形式の記号列。モバイルでは29–38px、430px以下では30px。
- **Sample Mono** (400, clamp(18px, 1.6vw, 23px), 1.8): 生成ケースの標準入力。
- **Mono Control / Axis / Bound** (690, 12px / 720, 14px / 400, 12px): 名前入力補助、反復参照、区間の正確な値。

### Named Rules

**The 三つの声 Rule.** 操作は日本語サンセリフ、入力形式と値域は数式セリフ、生成された標準入力と短い識別子はmonospaceで表し、役割を交換しない。

## Layout

デスクトップは60pxのツールバー下を画面高いっぱいの作業領域とし、入力形式64%、生成ケース36%の二面構成にする。生成ケース側は390pxを下限に保ち、1120px以下では60%／40%へ寄せて操作とサンプルの可読幅を守る。入力側は連続したキャンバス、出力側は連続したドックであり、機能ごとのカード群には分解しない。

入力行は54pxのガター、内容幅に沿う数式、54pxの末端操作で構成し、82pxの行高で実際の改行と横方向の空白を保つ。Rustの投影が返す挿入点を、先頭行のガター、記号列の末端、入れ子や分岐の局所操作として配置する。選択後のインスペクタはその記号を含む行グループの直下へ置き、三角形のアンカーで対象との関係を失わせない。

820px以下では58pxの固定ツールバーと58pxの表示切り替えを積み、入力形式／生成ケースのどちらか一方だけを表示する。切り替えは一回の操作で完了し、入力画面の状態を保つ。ガターは38px、入力行は74px、ツールバー操作は42px、名前チップと主要な作業操作は44px以上になる。インスペクタは左右2pxまで広がり、基本型・横方向・縦方向は縦積みへ変わる。430px以下ではガター、挿入操作、seed欄をさらに詰めるが、入力形式の改行は変えない。

**The 記法優先 Rule.** DOMやコントロールの都合で入力形式の改行、空白、下付き文字、反復末端を動かさない。画面上の配置は問題文としての読み順を正本にする。

## Elevation & Depth

常設面は背景の明度差と1pxの罫線で分離し、影を持たせない。記号へ接続する変数追加、ノード編集、高度な構造のポップオーバーだけが、白い紙面と柔らかな影で入力キャンバスの手前へ出る。アンカーも同じ白面から連続させ、独立したダイアログではなく記法上の局所操作であることを示す。例外的に、rangeのつまみは操作点を識別する小さな影、エラートーストは他の面から分離する赤い影を持つ。

### Shadow Vocabulary

- **記法接続ポップオーバー** (`0 18px 48px rgb(35 55 68 / 17%)`): 変数追加、選択記号の編集、高度な構造を入力キャンバスの手前へ出す。
- **区間つまみ** (`0 2px 7px rgb(23 54 62 / 28%)`): 二つのrangeつまみを軌道から識別する。
- **エラートースト** (`0 12px 34px rgb(69 18 26 / 28%)`): 画面端の一時的な失敗通知を作業面から分離する。

### Named Rules

**The 一時層だけ Rule.** 影は記法へ接続した一時ポップオーバー、操作中のrangeつまみ、エラートーストに限る。常設の入力面と出力面は紙色、余白、罫線で階層を表す。

## Shapes

形は穏やかな角丸と精密な線で構成する。通常コントロールは7–10px、生成サンプルは12px、記法接続ポップオーバーは14px。選択中の数式記号は5pxの薄い塗り、左右2pxの内線、左上と左下の12px×2pxマークを重ね、単なる角丸ボタンに見せない。状態ドット、rangeつまみ、軌道だけは円または999pxのカプセルを使う。

入力欄と選択肢は3:1以上を保つ1pxの操作境界、アクティブタブは2pxの下線を使う。キーボードフォーカスは不透明な2pxの選択シアンと2pxのオフセットに統一し、button、input、select、`role="button"`の行へ同じ輪郭を与える。線の太さは状態の強さに対応させ、装飾的な枠を追加しない。

## Components

### Buttons

- **Primary:** ティール背景、白文字、48pxの高さ、10px角丸、15px・720。生成し直す操作はRustが投影する`can_generate`が真の時だけ有効で、現在のseedから投影を再計算し、seed固定が外れている時だけseedも更新する。320msの回転と`aria-busy`で短い処理中状態を伝え、ホバーでは深いティールへ移る。回転は`prefers-reduced-motion`で無効にする。
- **Quiet:** 透明背景、本文スレート、40pxの高さ、8px角丸。ツールバー、コピー、閉じる操作に使い、ホバーは淡い冷灰面だけを足す。
- **Insertion Point:** 追加位置の「＋」は44px四方、ディープインクの1px枠と同色アイコンを常時表示する。ホバーではディープインク面と白アイコンへ反転し、アイコンを160msで90度回して操作可能性を伝える。`prefers-reduced-motion`では色の反転だけを残す。
- **Danger:** 削除は透明背景と赤文字で始める。最初のクリックで対象名と取消操作を赤いウォッシュ内へ展開し、同じ削除操作の二回目で確定する。
- **Focus:** すべてのボタンは不透明な2pxの選択シアンと2pxオフセットを持ち、モバイルの主要ターゲットは44px以上にする。

### Chips

- **Name Helper:** `N / M / H / W / A / B / S / T / Q`を最小34px×38pxのmonospaceチップとして並べる。チップは識別子のdraftを一クリックで埋めるだけで、現在のdraftに一致する時またはホバー中だけティールで反転する。
- **Behavior:** チップ自体は追加、変更、構造確定を行わない。明示的なチェック操作または名前欄のEnterが、選択済みの基本型・横方向・縦方向を含むdraftを確定する。基本型、反復軸、入力全体の形を名前チップへ結びつけない。モバイルでは44px以上、5列のグリッドにする。

### Inputs / Fields

- **Primitive Switch:** Number (`#`)、String (`"…"`)、Char (`'a'`)を三分割の選択面として表す。アクティブ型は濃紺面と白文字へ反転し、Stringは文字集合と長さ、Charは文字集合、Numberは数値範囲の制約UIへ投影される。
- **Structure Axes:** `基本型 × 横方向 × 縦方向`を独立した軸として扱う。Rustが合法な基本型と軸候補を投影し、その組み合わせをscalar／array／matrixへ解決する。横・縦の参照候補は投影されたNumber scalarで、横が未指定なら縦はdisabledになる。デスクトップは一列、モバイルは縦積み。
- **Interval Constraint:** Numberの値域とStringの長さは、Rustが投影した段階値を使う二つまみsliderと、76px×34pxの下限／上限入力を併置する。sliderは実値を`aria-valuetext`で読み上げ、頻出値を速く選ぶ。どちらかの正確値フィールドがblurすると、その時点の下限・上限の組を一つのActionとして原子的に保存する。下限のEnterは上限へフォーカスを移し、その後のblurで組を確定する。
- **Character Set:** lowercase、uppercase、alpha、digit、alphanumericなど投影された候補を35px高のmonospace選択肢で示す。Customは98pxの直接入力を開き、重複を除いた文字を横にプレビューし、Enter／blurで確定する。
- **Seed:** 64px×40pxのmonospace入力。右隣に40px四方のピンボタンを置き、クリックで固定／解除する。初期値42かつ固定状態から始め、`aria-pressed`と状態に応じたアクセシブル名を持つ。
- **Focus:** button、input、select、`role="button"`の制約行は、不透明な2pxの選択シアンと2pxオフセットを使う。seed固定のピンも通常のbuttonとして同じ輪郭を示す。

### Navigation

- **Top Toolbar:** 製品表示とリセットを左、取り消し、やり直し、共有、生成可能状態を右へ置く。リセットは現在の入力を初期状態へ戻し、取り消しで復元できる。モバイルは説明文字と生成可能状態を隠し、42pxのアイコン操作を残す。
- **Projection Tabs:** サンプル、入力形式、制約を同じ幅で並べ、アクティブ項目だけをtab順に置く。左右矢印で循環、Home／Endで両端へ移動し、`aria-controls`／`aria-labelledby`で対応するtabpanelと相互に結ぶ。アクティブ項目は深いティール文字と2px下線で示す。
- **Mobile Surface Switch:** 入力形式／生成ケースの二択。アクティブ側は濃紺面と白文字で反転し、一回のタップで作業面を交換する。

### Input Format Canvas

入力形式を数式行として直接描く署名面。選択可能なのは意味のある記号であり、`role="button"`と`tabindex="0"`を持ち、クリックに加えてEnter／Spaceでも同じインスペクタを開く。非選択の記号は通常の問題文として読む。追加操作はRustが投影したbelow／right／inside／variantの位置へ置き、ディープインクの枠で常時可視にして、クリックして初めて局所エディターを開く。選択はシアンの内線、端マーク、ウォッシュを併用し、色だけに依存しない。

### Caret Inspector

選択記号を含む行の直下へアンカーでつながる14px角丸の白い編集面。アンカー位置は選択された記法トークンの中心を実測し、インスペクタ座標へ変換・クランプしたCSSカスタムオフセットで配置する。固定px位置にはしない。名前draftと補助チップ、明示的な適用操作、Number／String／Char、横方向、縦方向、型別制約、総和、二段階削除を一つの流れで扱う。`Tree`／`Connected`／`Simple`など、生成意味論が未完成のグラフ性質は作成UIへ露出しない。非アクティブな制約行は`role="button"`としてTabで到達でき、Enter／Spaceで対象記号の編集へ移る。構造変更はRustの置換Actionとして入力形式・制約・生成ケースへ同時に反映される。260msの短い到着動作は下から展開し、`prefers-reduced-motion`では無効にする。

### Generated Output Dock

入力キャンバスより一段だけ濃い冷灰面に、同期状態、seed入力と隣接する固定ピン、主要生成操作、投影タブ、白いサンプル紙、コピーを縦に並べる。生成し直すボタンは固定ピンから分離し、単独で横幅を使う。サンプル、入力形式、制約は同じASTからの投影として一つの内容枠を共有する。Rustが`can_generate`と種類別に集約したblocker数・対象ID・対象名を投影し、生成不能時は主要操作をdisabledにする。サンプルの空状態は、空の構造には追加アイコン、未設定制約には変数名チップを示し、入力面の挿入点または対象記号へ直接戻す。

### Edit Lifecycle

取り消し／やり直しは最大100件の履歴とfutureを持ち、履歴の有無をdisabled状態で示す。削除は最初のクリックで対象名と取消操作を開き、二回目でRustのRemove Actionを実行する。確定後も取り消しで戻せる。Escapeは開いているポップオーバーと選択を閉じ、`Ctrl/Cmd+Z`は履歴、`Ctrl/Cmd+Shift+Z`はfutureを進める。

## Do's and Don'ts

### Do:

- **Do** 入力形式を問題文と同じ改行、空白、下付き文字で直接表示する。
- **Do** 選択記号へシアン括弧を付け、その直下へアンカー付きインスペクタを接続する。
- **Do** 名前チップは識別子draftだけを埋め、チェックまたはEnterで構造を明示的に確定する。
- **Do** Rustが投影する合法候補からNumber／String／Charと`横方向の反復 × 縦方向の反復`を選び、scalar／array／matrixへの解決をRustに任せる。
- **Do** NumberとString長には`aria-valuetext`付きsliderと正確な上下限、String／Charには文字集合候補とCustom入力を併置する。
- **Do** 投影された記号をクリックだけでなくTabからEnter／Spaceでも選択できるようにする。
- **Do** デスクトップの64%／36%と、モバイルの一回切り替えを保つ。
- **Do** Rustが投影する生成blockerを種類別にまとめ、追加アイコンまたは対象名から回復先へ直接戻す。
- **Do** 通常文字4.5:1、操作境界3:1のコントラスト床と、不透明な2pxティール＋2pxオフセットのキーボードフォーカスを守る。
- **Do** 意味判断、編集の合法性、既定値、変換はRust側に置き、Web UIは投影と宣言的Actionに集中させる。

### Don't:

- **Don't** 入力形式をプロパティ表、レシピ帯、汎用カード群へ置き換えない。
- **Don't** 名前入力補助のクリックを確定操作にしたり、構造や入力全体を選ぶテンプレートとして扱わない。
- **Don't** 投影にない挿入点や編集可否をWeb UIだけで作らない。
- **Don't** 生成・編集の意味論が固まっていないグラフ性質を、選択肢だけ先行して公開しない。
- **Don't** sliderだけで正確な制約値を代替せず、文字集合のCustom入力を候補の外へ追い出さない。
- **Don't** 常設面へ影、グラデーション、装飾的な罫線を加えない。
- **Don't** UI都合の折り返しで入力形式と生成ケースの行対応を崩さない。
- **Don't** 生成条件の新しい意味論をWeb側だけで決めない。
