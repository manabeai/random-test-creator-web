/**
 * E2E Tests: グリッド (H W / S_1...S_H)
 *
 * 対象: ABC390-C 相当
 * ユーザーフロー: doc/view/problem-user-flows.md §2
 *
 * テスト観点:
 * - 同一行 scalar (H → hotspot right → W)
 * - 文字グリッドテンプレート
 * - |S_i| = W 自動生成
 * - charset draft
 * - TeX グリッド表示 + sample grid 生成
 */
import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';
import {
  expectStructureContains,
  expectSampleLines,
  expectRightPanePopulated,
} from './fixtures/helpers';

test.describe('グリッド: H W / S_1...S_H', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('scalar H → hotspot right → scalar W で同一行に配置する', async () => {
    await editor.addScalar('H');
    await editor.addScalarRight('W');

    // Structure ペインに H W が同一行に表示
    await expectStructureContains(editor, 'H');
    await expectStructureContains(editor, 'W');

    // draft: H と W の range
    const drafts = editor.getDraftConstraints();
    await expect(drafts).toHaveCount(2);
  });

  test('文字グリッドテンプレートを追加する', async () => {
    // scalar H + W
    await editor.addScalar('H');
    await editor.addScalarRight('W');

    // グリッドテンプレート
    await editor.clickHotspot('below');
    await editor.selectPopupOption('grid-template');
    await editor.selectLength('H'); // rows
    await editor.selectLength('W'); // cols
    await editor.confirm();

    // Structure ペインにグリッド表示 (S_1 ... S_H)
    await expectStructureContains(editor, 'S');

    // draft: H range, W range, charset の3つ以上
    const drafts = editor.getDraftConstraints();
    const count = await drafts.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('charset を英小文字に設定する', async () => {
    // setup: scalar H W + grid template
    await editor.addScalar('H');
    await editor.addScalarRight('W');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('grid-template');
    await editor.selectLength('H');
    await editor.selectLength('W');
    await editor.confirm();

    // charset draft をクリックして英小文字を選択
    // (charset の draft index は H range, W range の後)
    const charsetDraft = editor.page.getByTestId(/draft-constraint/).last();
    await charsetDraft.click();

    // charset プリセットから英小文字を選択する想定
    // 具体的な UI は実装時に確定するため、ここでは概要を記述
    await editor.page.getByTestId('charset-option-lowercase').click();
    await editor.page.getByTestId('constraint-confirm').click();

    // completed に英小文字制約が表示
    const completed = editor.getCompletedConstraints();
    await expect(completed.first()).toBeVisible();
  });

  test('custom charset の文字グリッド sample は指定文字だけを出す', async () => {
    await editor.addScalar('H');
    await editor.addScalarRight('W');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('grid-template');
    await editor.selectLength('H');
    await editor.selectLength('W');
    await editor.confirm();

    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '2');
    await editor.fillBoundLiteral('upper', '2');
    await editor.confirmConstraint();

    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '3');
    await editor.fillBoundLiteral('upper', '3');
    await editor.confirmConstraint();

    await editor.openDraft(0);
    await editor.page.getByTestId('charset-option-custom').click();
    await editor.page.getByTestId('charset-char-input-0').fill('.');
    await editor.page.getByTestId('charset-add-char').click();
    await editor.page.getByTestId('charset-char-input-1').fill('#');
    await editor.confirmConstraint();

    const sample = await editor.getSampleOutput().textContent();
    const lines = sample?.trim().split('\n') ?? [];
    expect(lines).toHaveLength(3);
    expect(lines[0].trim()).toBe('2 3');
    for (const line of lines.slice(1)) {
      expect(line).toMatch(/^[.#]{3}$/);
    }
  });

  test('完成状態: グリッド + 制約 + 右ペイン検証', async () => {
    // Structure 構築
    await editor.addScalar('H');
    await editor.addScalarRight('W');

    await editor.clickHotspot('below');
    await editor.selectPopupOption('grid-template');
    await editor.selectLength('H');
    await editor.selectLength('W');
    await editor.confirm();

    // 制約を全て埋める
    // H: 1 <= H <= 500
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '500');
    await editor.confirmConstraint();

    // W: 1 <= W <= 500
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '500');
    await editor.confirmConstraint();

    // S: 英小文字
    await editor.openDraft(0);
    await editor.page.getByTestId('charset-option-lowercase').click();
    await editor.confirmConstraint();

    // 右ペイン TeX 入力形式にグリッド要素
    await expect(editor.getTexInputFormat()).toContainText('H');
    await expect(editor.getTexInputFormat()).toContainText('S');

    // sample: 1行(H W) + H行(グリッド) = H+1 行以上
    await expectSampleLines(editor, 2);
  });
});
