/**
 * E2E Tests: グラフ入力 (N M / u_i v_i × M)
 *
 * 対象: ABC401-E, ABC408-E 相当
 * ユーザーフロー: doc/view/problem-user-flows.md §6
 *
 * テスト観点:
 * - scalar N → scalar M (右に追加)
 * - 辺リストテンプレート（count = M 変数参照）
 * - 重み付き辺リストテンプレート（u, v, w）
 * - u_i, v_i, w_i の range 自動生成
 * - 右ペイン TeX + sample グラフ生成
 */
import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';
import {
  expectStructureContains,
  expectSampleLines,
  expectRightPanePopulated,
} from './fixtures/helpers';

test.describe('グラフ入力: N M / u_i v_i × M', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('scalar N → scalar M (right) → 辺リストを追加する', async () => {
    await editor.addScalar('N');
    await editor.addScalarRight('M');

    // 辺リストテンプレート（count = M）
    await editor.clickHotspot('below');
    await editor.selectPopupOption('edge-list');
    await editor.pickCountVar('M');
    await editor.confirm();

    // Structure ペインに辺リスト表示
    await expectStructureContains(editor, 'u');
    await expectStructureContains(editor, 'v');

    // draft: N range + M range + u_i range + v_i range
    const drafts = editor.getDraftConstraints();
    const count = await drafts.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('重み付き辺リストを追加する', async () => {
    await editor.addScalar('N');
    await editor.addScalarRight('M');

    // 重み付き辺リストテンプレート
    await editor.addWeightedEdgeList('M', 'w');

    // Structure ペインに u, v, w が表示
    await expectStructureContains(editor, 'u');
    await expectStructureContains(editor, 'v');
    await expectStructureContains(editor, 'w');

    // draft: N range + M range + u_i range + v_i range + w_i range
    const drafts = editor.getDraftConstraints();
    const count = await drafts.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('辺の制約を埋める', async () => {
    // Structure 構築
    await editor.addScalar('N');
    await editor.addScalarRight('M');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('edge-list');
    await editor.pickCountVar('M');
    await editor.confirm();

    // 制約を埋める
    // N: 2 <= N <= 2×10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '2');
    await editor.fillBoundLiteral('upper', '2');
    await editor.applyBoundFunction('upper', 'multiply', '100000');
    await editor.confirmConstraint();

    // M: 1 <= M <= 3×10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '3');
    await editor.applyBoundFunction('upper', 'multiply', '100000');
    await editor.confirmConstraint();

    // u_i: 1 <= u_i <= N
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'N');
    await editor.confirmConstraint();

    // v_i: 1 <= v_i <= N
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'N');
    await editor.confirmConstraint();

    // completed constraint が表示される
    const completed = editor.getCompletedConstraints();
    const count = await completed.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // 右ペイン TeX 制約に反映
    await expect(editor.getTexConstraints()).not.toBeEmpty();
  });

  test('完成状態: 重み付きグラフ + 制約 + 右ペイン検証', async () => {
    // Structure 構築
    await editor.addScalar('N');
    await editor.addScalarRight('M');
    await editor.addWeightedEdgeList('M', 'w');

    // 全制約を埋める
    // N: 2 <= N <= 2×10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '2');
    await editor.fillBoundLiteral('upper', '2');
    await editor.applyBoundFunction('upper', 'multiply', '100000');
    await editor.confirmConstraint();

    // M: 1 <= M <= 3×10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '3');
    await editor.applyBoundFunction('upper', 'multiply', '100000');
    await editor.confirmConstraint();

    // u_i: 1 <= u_i <= N
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'N');
    await editor.confirmConstraint();

    // v_i: 1 <= v_i <= N
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'N');
    await editor.confirmConstraint();

    // w_i: 1 <= w_i <= 10^9
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.applyBoundFunction('upper', 'power', '9');
    await editor.confirmConstraint();

    // draft が全て消えている
    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(0);

    // 右ペイン三要素が全て揃っている
    await expectRightPanePopulated(editor);

    // sample が有効（2 行以上）
    await expectSampleLines(editor, 2);
  });
});
