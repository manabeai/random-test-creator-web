/**
 * E2E Tests: 基本配列 (N + A_1...A_N)
 *
 * 対象: ABC395-A 相当
 * ユーザーフロー: doc/view/problem-user-flows.md §1
 *
 * テスト観点:
 * - scalar 作成
 * - 横配列作成（長さに既存変数を選択）
 * - draft range 自動生成
 * - range 入力 → completed 昇格
 * - 右ペイン TeX/sample 更新
 */
import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';
import {
  expectStructureContains,
  expectSampleLines,
  expectRightPanePopulated,
} from './fixtures/helpers';

test.describe('基本配列: N + A_1...A_N', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('初期状態: root Sequence は表示せず insertion hotspot だけ見せる', async () => {
    await expect(editor.structurePane).not.toContainText('Sequence');
    await expect(editor.insertionHotspots.first()).toBeVisible();
  });

  test('scalar N を追加する', async () => {
    await editor.addScalar('N');

    // Structure ペインに N が表示
    await expectStructureContains(editor, 'N');

    // draft constraint が自動生成される
    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(1);

    // 右ペイン TeX 入力形式に N が表示される
    await expect(editor.getTexInputFormat()).toContainText('N');

    // draft constraint が残っている間は sample は生成しない
    await expect(editor.getSampleOutput()).toBeEmpty();
  });

  test('scalar N の後に横配列 A を追加する', async () => {
    await editor.addScalar('N');
    await editor.addArray('A', 'N');

    // Structure ペインに A が表示
    await expectStructureContains(editor, 'A');

    // draft が 2 つ（N の range + A の range）
    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(2);

    // 右ペイン TeX 入力形式に A が表示
    await expect(editor.getTexInputFormat()).toContainText('A');

    // draft constraint が残っている間は sample は生成しない
    await expect(editor.getSampleOutput()).toBeEmpty();
  });

  test('N の右に横配列 A を追加すると同じ Structure 行に表示される', async () => {
    await editor.addScalar('N');

    await editor.clickHotspotForNode('N', 'right');
    await editor.selectPopupOption('array');
    await editor.selectType('number');
    await editor.inputName('A');
    await expect(editor.page.getByTestId('length-var-option-N')).toBeVisible();
    await editor.pickLengthVar('N');
    await editor.confirm();

    const nLine = editor.getStructureNodeByLabel('N').locator('..');
    await expect(nLine).toContainText('N');
    await expect(nLine).toContainText('A');
    await expect(editor.getStructureNodeByLabel('N').getByTestId('insertion-hotspot-right')).toHaveCount(0);
    await expect(editor.getStructureNodeByLabel('A').getByTestId('insertion-hotspot-right')).toBeVisible();
  });

  test('Array は必須項目が埋まるまで confirm できない', async () => {
    await editor.addScalar('N');

    await editor.clickHotspotForNode('N', 'right');
    await editor.selectPopupOption('array');
    await expect(editor.page.getByTestId('confirm-button')).toBeDisabled();

    await editor.inputName('A');
    await expect(editor.page.getByTestId('confirm-button')).toBeDisabled();

    await editor.pickLengthVar('N');
    await expect(editor.page.getByTestId('confirm-button')).toBeEnabled();
  });

  test('draft constraint を埋めて completed に昇格する', async () => {
    await editor.addScalar('N');
    await editor.addArray('A', 'N');

    // N の draft range を埋める: 1 <= N <= 10^6
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.applyBoundFunction('upper', 'power', '6');
    await editor.confirmConstraint();

    // completed constraint が 1 つ表示
    const completed = editor.getCompletedConstraints();
    await expect(completed).toHaveCount(1);

    // 右ペイン TeX 制約に反映
    await expect(editor.getTexConstraints()).toContainText('N');
  });

  test('完成状態: 全 draft を埋めて右ペイン検証', async () => {
    // Structure 構築
    await editor.addScalar('N');
    await editor.addArray('A', 'N');

    // 全制約を埋める
    // N: 1 <= N <= 10^6
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.applyBoundFunction('upper', 'power', '6');
    await editor.confirmConstraint();

    // A_i: 1 <= A_i <= 10^9 (index 0: 残った draft が繰り上がる)
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.applyBoundFunction('upper', 'power', '9');
    await editor.confirmConstraint();

    // draft が全て消えている
    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(0);

    // completed が 2 つ
    const completed = editor.getCompletedConstraints();
    await expect(completed).toHaveCount(2);

    // 右ペイン三要素が全て揃っている
    await expectRightPanePopulated(editor);

    // sample が有効（2 行以上）
    await expectSampleLines(editor, 2);
  });
});
