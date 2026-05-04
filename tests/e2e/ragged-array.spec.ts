/**
 * E2E Tests: 可変長配列列 (N / k_i A_{i,1}...A_{i,k_i})
 *
 * 目標入力:
 *   N
 *   k_1 A_{1,1} ... A_{1,k_1}
 *   ...
 *   k_N A_{N,1} ... A_{N,k_N}
 *
 * テスト観点:
 * - scalar N 作成
 * - repeat ブロック (count = N)
 * - repeat 内で scalar k を追加
 * - k の右 hotspot で Array が候補に出る
 * - 同一行で k_i と A_{i,*} を構築できる
 * - 右ペイン TeX/sample が更新される
 */
import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';
import {
  expectStructureContains,
  expectSampleLines,
} from './fixtures/helpers';

test.describe('可変長配列列: N / k_i A_{i,1}...A_{i,k_i}', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('repeat ブロック内で k の右に Array を置ける', async () => {
    await editor.addScalar('N');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('repeat');
    await editor.page.getByTestId('count-field').click();
    await editor.page.getByTestId('count-var-option-N').click();
    await editor.confirm();

    await editor.clickHotspot('inside');
    await editor.selectPopupOption('scalar');
    await editor.selectType('number');
    await editor.inputName('k');
    await editor.confirm();

    await editor.clickHotspotForNode('k', 'right');
    await expect(editor.page.getByTestId('popup-option-scalar')).toBeVisible();
    await expect(editor.page.getByTestId('popup-option-array')).toBeVisible();
  });

  test('N 回の各行を k_i + A_{i,*} として構築できる', async () => {
    await editor.addScalar('N');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('repeat');
    await editor.page.getByTestId('count-field').click();
    await editor.page.getByTestId('count-var-option-N').click();
    await editor.confirm();

    await editor.clickHotspot('inside');
    await editor.selectPopupOption('scalar');
    await editor.selectType('number');
    await editor.inputName('k');
    await editor.confirm();

    await editor.clickHotspotForNode('k', 'right');
    await editor.selectPopupOption('array');
    await editor.selectType('number');
    await editor.inputName('A');
    await editor.pickLengthVar('k');
    await editor.confirm();

    await expectStructureContains(editor, 'N');
    await expectStructureContains(editor, 'k');
    await expectStructureContains(editor, 'A');

    const drafts = editor.getDraftConstraints();
    const draftCount = await drafts.count();
    expect(draftCount).toBeGreaterThanOrEqual(3);
  });

  test('完成状態: range 制約を埋めて右ペインに反映される', async () => {
    await editor.addScalar('N');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('repeat');
    await editor.page.getByTestId('count-field').click();
    await editor.page.getByTestId('count-var-option-N').click();
    await editor.confirm();

    await editor.clickHotspot('inside');
    await editor.selectPopupOption('scalar');
    await editor.selectType('number');
    await editor.inputName('k');
    await editor.confirm();

    await editor.clickHotspotForNode('k', 'right');
    await editor.selectPopupOption('array');
    await editor.selectType('number');
    await editor.inputName('A');
    await editor.pickLengthVar('k');
    await editor.confirm();

    // N: 1 <= N <= 3
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '3');
    await editor.confirmConstraint();

    // k_i: 1 <= k_i <= 3
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '3');
    await editor.confirmConstraint();

    // A_{i,j}: 1 <= A_{i,j} <= 10^9
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.applyBoundFunction('upper', 'power', '9');
    await editor.confirmConstraint();

    await expect(editor.getTexInputFormat()).not.toBeEmpty();
    await expect(editor.getTexConstraints()).not.toBeEmpty();
    await expectSampleLines(editor, 2);
  });
});
