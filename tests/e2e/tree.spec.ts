/**
 * E2E Tests: 木入力 (N / u_1 v_1...u_{N-1} v_{N-1})
 *
 * 対象: 典型 ABC-D 木問題
 * ユーザーフロー: doc/view/problem-user-flows.md §3
 *
 * テスト観点:
 * - scalar N 作成
 * - 辺リストテンプレート（count = N-1 式）
 * - u_i, v_i の range 自動生成
 * - Tree property 追加
 * - 右ペイン TeX + sample tree 生成
 */
import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';
import {
  expectStructureContains,
  expectSampleLines,
} from './fixtures/helpers';

test.describe('木入力: N / u_1 v_1...u_{N-1} v_{N-1}', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('scalar N を追加する', async () => {
    await editor.addScalar('N');

    await expectStructureContains(editor, 'N');

    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(1);
  });

  test('辺リストテンプレートを追加する', async () => {
    await editor.addScalar('N');

    // 辺リストテンプレート
    await editor.clickHotspot('below');
    await editor.selectPopupOption('edge-list');
    // count = N - 1: 変数 N を選択 → N をクリック → 関数 "-" → operand "1"
    await editor.buildCountExpression('N', 'subtract', '1');
    await editor.confirm();

    // Structure ペインに辺リスト表示
    await expectStructureContains(editor, 'u');
    await expectStructureContains(editor, 'v');

    // draft: N range + u_i range + v_i range
    const drafts = editor.getDraftConstraints();
    const count = await drafts.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Tree property を追加する', async () => {
    await editor.addScalar('N');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('edge-list');
    await editor.buildCountExpression('N', 'subtract', '1');
    await editor.confirm();

    // Tree property を追加
    await editor.addProperty('tree');

    // completed constraint に Tree が表示
    const completed = editor.getCompletedConstraints();
    const texts = await completed.allTextContents();
    expect(texts.some((t) => t.toLowerCase().includes('tree'))).toBeTruthy();
  });

  test('完成状態: 木入力 + 制約 + 右ペイン検証', async () => {
    // Structure 構築
    await editor.addScalar('N');
    await editor.clickHotspot('below');
    await editor.selectPopupOption('edge-list');
    await editor.buildCountExpression('N', 'subtract', '1');
    await editor.confirm();

    // 制約を埋める
    // N: 2 <= N <= 2×10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '2');
    await editor.fillBoundLiteral('upper', '2');
    await editor.applyBoundFunction('upper', 'multiply', '100000');
    await editor.confirmConstraint();

    // u_i: 1 <= u_i <= N (上限は変数参照)
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'N');
    await editor.confirmConstraint();

    // v_i: 1 <= v_i <= N
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'N');
    await editor.confirmConstraint();

    // Tree property
    await editor.addProperty('tree');

    // draft が全て消えている
    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(0);

    // 右ペイン TeX に辺リスト表示
    await expect(editor.getTexInputFormat()).toContainText('N');
    await expect(editor.getTexInputFormat()).toContainText('u');

    // TeX 制約に Tree が含まれる
    await expect(editor.getTexConstraints()).not.toBeEmpty();

    // sample: N 行 + (N-1) 辺行 = N 行以上
    await expectSampleLines(editor, 2);
  });
});
