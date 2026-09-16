import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('数式による制約編集', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
    await editor.addScalar('N');
    await editor.fillBoundLiteral('lower', '5');
    await editor.fillBoundLiteral('upper', '5');
    await editor.addArray('A', 'N');
  });

  test('変数と演算から括弧付きの上限を組み、再編集しても意味を保持する', async ({ page }) => {
    await page.getByTestId('range-expression-toggle').click();
    await page.getByTestId('range-upper-input').focus();
    await page.getByTestId('expression-variable-N').click();
    await expect(page.getByTestId('expression-variable-A')).toHaveCount(0);
    await page.getByTestId('expression-operation-subtract').click();
    await page.getByTestId('expression-operand-input').fill('1');
    await page.getByTestId('expression-operation-apply').click();
    await page.getByTestId('expression-operation-multiply').click();
    await page.getByTestId('expression-operand-input').fill('2');
    await page.getByTestId('expression-operation-apply').click();
    await page.getByTestId('constraint-expression-apply').click();

    await expect(page.getByTestId('range-upper-input')).toHaveValue('(N-1)*2');
    await expect(editor.getCompletedConstraints().last()).toContainText('(N-1)*2');
    await expect(editor.getCompletedConstraints().last()).not.toContainText('NodeId');
    await page.keyboard.press('Escape');
    await editor.getStructureNodeByLabel('A').click();
    await expect(page.getByTestId('range-upper-input')).toHaveValue('(N-1)*2');
    await page.getByTestId('range-lower-input').fill('(N-1)*2');
    await page.getByTestId('constraint-expression-apply').click();
    await expect(editor.getSampleOutput()).toHaveText('5\n8 8 8 8 8');
    await page.getByRole('tab', { name: '制約', exact: true }).click();
    await expect(editor.getTexConstraints().locator('annotation').last()).toContainText('\\left(N - 1\\right) \\times 2');
  });

  test('無効な式や逆転した区間を確定せず、入力位置で修正できる', async ({ page }) => {
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '8');
    await page.getByTestId('range-expression-toggle').click();
    for (const value of ['N+', 'N/0', 'S+1', 'min(N)', '0']) {
      await page.getByTestId('range-upper-input').fill(value);
      await page.getByTestId('constraint-expression-apply').click();
      await expect(page.getByTestId('constraint-expression-error')).toBeVisible();
      await expect(editor.getCompletedConstraints().last()).toHaveText('1 ≤ A ≤ 8');
    }
    await page.getByTestId('range-upper-input').fill('min(N, 10^3)');
    await page.getByTestId('constraint-expression-apply').click();
    await expect(page.getByTestId('constraint-expression-error')).toHaveCount(0);
    await expect(page.getByTestId('range-upper-input')).toHaveValue('min(N,10^3)');
  });

  test('総和の候補を対象に合わせて表示し、既存の総和を置き換えて取り消せる', async ({ page }) => {
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '8');
    await editor.addScalar('S', 'string');
    await page.getByTestId('sumbound-shortcut').click();
    const targets = page.getByTestId('sumbound-var-select');
    await expect(targets.locator('option')).toHaveText(['対象を選択', 'N']);
    await targets.selectOption('N');
    await page.getByTestId('sumbound-upper-input').fill('2 * 10^5');
    await page.getByTestId('sumbound-upper-input').press('Enter');
    const sum = editor.getCompletedConstraints().filter({ hasText: 'ΣN' });
    await expect(sum).toHaveCount(1);
    await sum.click();
    await page.getByTestId('sumbound-edit-upper-input').fill('10^5');
    await page.getByTestId('sumbound-edit-apply').click();
    await expect(sum).toHaveCount(1);
    await expect(sum).toContainText('10^5');
    await page.getByTestId('undo-button').click();
    await expect(sum).toContainText('2*10^5');
    await page.getByTestId('redo-button').click();
    await expect(sum).toContainText('ΣN ≤ 10^5');
  });

  test('文字列長にも数式候補を使い、長さの負値を拒否する', async ({ page }) => {
    await editor.addScalar('S', 'string');
    await page.getByTestId('charset-option-lowercase').click();
    await page.getByTestId('string-length-expression-toggle').click();
    await page.getByTestId('string-length-lower-input').fill('-1');
    await page.getByTestId('constraint-expression-apply').click();
    await expect(page.getByTestId('constraint-expression-error')).toBeVisible();
    await page.getByTestId('string-length-lower-input').fill('N-1');
    await page.getByTestId('string-length-upper-input').fill('max(N-1, 3)');
    await page.getByTestId('constraint-expression-apply').click();
    await expect(page.getByTestId('string-length-upper-input')).toHaveValue('max(N-1,3)');
    await expect(editor.getCompletedConstraints().last()).toContainText('len(S)');
  });

  test('入力中の取り消しをドキュメント履歴へ送らない', async ({ page }) => {
    await page.getByTestId('range-expression-toggle').click();
    await page.getByTestId('range-upper-input').fill('N+1');
    await page.getByTestId('range-upper-input').press('Control+z');
    await expect(editor.getStructureNodeByLabel('A')).toBeVisible();
  });

  for (const prefix of ['range', 'string-length']) {
    test(`${prefix}: 未入力の境界を示し、確定済み制約を保持する`, async ({ page }) => {
      if (prefix === 'string-length') {
        await editor.addScalar('S', 'string');
        await page.getByTestId('charset-option-lowercase').click();
      }
      await page.getByTestId(`${prefix}-lower-input`).fill('1');
      await page.getByTestId(`${prefix}-lower-input`).press('Enter');
      await page.getByTestId(`${prefix}-upper-input`).fill('8');
      await page.getByTestId(`${prefix}-upper-input`).press('Enter');
      const original = await editor.getCompletedConstraints().last().textContent();
      await page.getByTestId(`${prefix}-expression-toggle`).click();
      await page.getByTestId(`${prefix}-lower-input`).fill('   ');
      await page.getByTestId('constraint-expression-apply').click();
      await expect(page.getByTestId('constraint-expression-error')).toContainText('下限');
      await expect(editor.getCompletedConstraints().last()).toHaveText(original!);
      await page.getByTestId(`${prefix}-lower-input`).fill('1');
      await page.getByTestId(`${prefix}-upper-input`).fill('');
      await page.getByTestId(`${prefix}-upper-input`).press('Enter');
      await expect(page.getByTestId('constraint-expression-error')).toContainText('上限');
      await expect(editor.getCompletedConstraints().last()).toHaveText(original!);
    });
  }

  test('モバイルでも長い式と演算補助を横スクロールなしで操作できる', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByTestId('range-expression-toggle').click();
    await page.getByTestId('range-upper-input').fill('min((N-1)*2, max(10^3, 10^5))');
    await page.getByTestId('constraint-expression-apply').click();
    await expect(page.getByTestId('range-upper-input')).toHaveValue('min((N-1)*2,max(10^3,10^5))');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
