/**
 * E2E Tests: 複数テストケース (T / (N / A_1...A_N) x T)
 *
 * 対象: 典型マルチケース問題
 * ユーザーフロー: doc/view/problem-user-flows.md §5
 *
 * テスト観点:
 * - scalar T 作成
 * - 複数テストケーステンプレート
 * - リピートブロック内に scalar N + 横配列 A
 * - SumBound 追加
 * - 右ペイン: 複数ケース sample 生成
 */
import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';
import {
  expectStructureContains,
  expectSampleLines,
} from './fixtures/helpers';

test.describe('複数テストケース: T / (N / A) x T', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('scalar T を追加する', async () => {
    await editor.addScalar('T');

    await expectStructureContains(editor, 'T');

    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(1);
  });

  test('複数テストケーステンプレートを適用する', async () => {
    await editor.addScalar('T');

    // 複数テストケーステンプレート
    await editor.clickHotspot('below');
    await editor.selectPopupOption('multi-testcase');
    await editor.selectLength('T'); // count = T
    await editor.confirm();

    // リピートブロックが表示される
    // ブロック内に insertion hotspot が表示される
    const insideHotspot = editor.page.getByTestId('insertion-hotspot-inside');
    await expect(insideHotspot).toBeVisible();
  });

  test('ケース内に scalar N + 横配列 A を追加する', async () => {
    await editor.addScalar('T');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('multi-testcase');
    await editor.selectLength('T');
    await editor.confirm();

    // ケース内に N を追加
    await editor.clickHotspot('inside');
    await editor.selectPopupOption('scalar');
    await editor.selectType('number');
    await editor.inputName('N');
    await editor.confirm();

    // ケース内に A を追加
    await editor.clickHotspot('below');
    await editor.selectPopupOption('array');
    await editor.selectType('number');
    await editor.inputName('A');
    await editor.selectLength('N');
    await editor.confirm();

    // Structure にマルチケース表示
    await expectStructureContains(editor, 'T');
    await expectStructureContains(editor, 'N');
    await expectStructureContains(editor, 'A');

    // draft: T range + N range + A range
    const drafts = editor.getDraftConstraints();
    const count = await drafts.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('SumBound を追加する', async () => {
    await editor.addScalar('T');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('multi-testcase');
    await editor.selectLength('T');
    await editor.confirm();

    // ケース内の構造は省略
    await editor.clickHotspot('inside');
    await editor.selectPopupOption('scalar');
    await editor.selectType('number');
    await editor.inputName('N');
    await editor.confirm();

    // SumBound 追加
    await editor.addSumBound('N', '2 * 10^5');

    // completed constraint に SumBound が表示
    const completed = editor.getCompletedConstraints();
    await expect(completed).toHaveCount(1);
  });

  test('完成状態: 全制約 + 右ペイン検証', async () => {
    // Structure 構築
    await editor.addScalar('T');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('multi-testcase');
    await editor.selectLength('T');
    await editor.confirm();

    await editor.clickHotspot('inside');
    await editor.selectPopupOption('scalar');
    await editor.selectType('number');
    await editor.inputName('N');
    await editor.confirm();

    await editor.clickHotspot('below');
    await editor.selectPopupOption('array');
    await editor.selectType('number');
    await editor.inputName('A');
    await editor.selectLength('N');
    await editor.confirm();

    // 制約を埋める
    // T: 1 <= T <= 10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.applyBoundFunction('upper', 'power', '5');
    await editor.confirmConstraint();

    // N: 1 <= N <= 2×10^5
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '2');
    await editor.applyBoundFunction('upper', 'multiply', '100000');
    await editor.confirmConstraint();

    // A_i: 1 <= A_i <= 10^9
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.applyBoundFunction('upper', 'power', '9');
    await editor.confirmConstraint();

    // SumBound: Σ N <= 2×10^5
    await editor.addSumBoundExpression('N', '2', 'multiply', '100000');

    // 右ペイン TeX
    await expect(editor.getTexInputFormat()).not.toBeEmpty();
    await expect(editor.getTexConstraints()).not.toBeEmpty();

    // sample: T + T*(N + A行) = 複数行
    await expectSampleLines(editor, 3);
  });
});
