/**
 * E2E Tests: クエリ列 (N Q / variant分岐)
 *
 * 対象: ABC395-D 相当（3種クエリ）
 * ユーザーフロー: doc/view/problem-user-flows.md §4
 *
 * テスト観点:
 * - 同一行 scalar (N → hotspot right → Q)
 * - クエリ列テンプレート (count = Q)
 * - variant 追加 (3種)
 * - 各 variant の構造定義
 * - 右ペイン TeX クエリ表示
 */
import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';
import { expectStructureContains } from './fixtures/helpers';

test.describe('クエリ列: N Q / variant分岐', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('scalar N → hotspot right → scalar Q で同一行に配置する', async () => {
    await editor.addScalar('N');
    await editor.addScalarRight('Q');

    await expectStructureContains(editor, 'N');
    await expectStructureContains(editor, 'Q');

    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(2);
  });

  test('クエリ列テンプレートを追加する', async () => {
    // scalar N + Q
    await editor.addScalar('N');
    await editor.addScalarRight('Q');

    // クエリ列
    await editor.clickHotspot('below');
    await editor.selectPopupOption('query-list');
    await editor.selectLength('Q'); // count = Q
    await editor.confirm();

    // Structure にクエリ列ブロックが表示
    // variant 追加用の hotspot が出現する
    const variantHotspot = editor.page.getByTestId(
      'insertion-hotspot-variant',
    );
    await expect(variantHotspot).toBeVisible();
  });

  test('variant を 3 つ追加する', async () => {
    // setup: scalar N Q + query list
    await editor.addScalar('N');
    await editor.addScalarRight('Q');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('query-list');
    await editor.selectLength('Q');
    await editor.confirm();

    // variant 1: tag=1, body=[a, b]
    const addVariant = editor.page.getByTestId('insertion-hotspot-variant');
    await addVariant.click();
    await editor.page.getByTestId('variant-tag-input').fill('1');
    await editor.inputName('a');
    await editor.confirm();
    // 右に b を追加
    await editor.clickHotspot('right');
    await editor.selectPopupOption('scalar');
    await editor.selectType('number');
    await editor.inputName('b');
    await editor.confirm();

    // variant 2: tag=2, body=[a, b]
    await addVariant.click();
    await editor.page.getByTestId('variant-tag-input').fill('2');
    await editor.inputName('a');
    await editor.confirm();
    await editor.clickHotspot('right');
    await editor.selectPopupOption('scalar');
    await editor.selectType('number');
    await editor.inputName('b');
    await editor.confirm();

    // variant 3: tag=3, body=[a]
    await addVariant.click();
    await editor.page.getByTestId('variant-tag-input').fill('3');
    await editor.inputName('a');
    await editor.confirm();

    // 右ペイン TeX にクエリ形式が表示される
    await expect(editor.getTexInputFormat()).not.toBeEmpty();
  });

  test('完成状態: 制約を埋めて右ペイン検証', async () => {
    // setup: scalar N Q + query list
    await editor.addScalar('N');
    await editor.addScalarRight('Q');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('query-list');
    await editor.selectLength('Q');
    await editor.confirm();

    // variant 追加は省略（上記テストでカバー）

    // 制約を埋める
    // N: 1 <= N <= 2×10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '2');
    await editor.applyBoundFunction('upper', 'multiply', '100000');
    await editor.confirmConstraint();

    // Q: 1 <= Q <= 2×10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '2');
    await editor.applyBoundFunction('upper', 'multiply', '100000');
    await editor.confirmConstraint();

    // 右ペイン TeX 制約が表示される
    await expect(editor.getTexConstraints()).not.toBeEmpty();
  });
});
