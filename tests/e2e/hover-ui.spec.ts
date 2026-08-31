import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('direct workbench interactions', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('structure hotspot is deliberate: hover previews nothing and click opens the editor', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().hover();
    await expect(editor.nodePopup).toHaveCount(0);

    await page.getByTestId('insertion-hotspot-below').first().click();
    await expect(editor.nodePopup).toBeVisible();
    await expect(page.getByTestId('type-number')).toBeVisible();
  });

  test('a selected variable exposes its type-specific constraint controls', async ({ page }) => {
    await editor.addScalar('N');
    await page.getByTestId('draft-constraint-0').click();
    await expect(page.getByTestId('number-range-control')).toBeVisible();
    await expect(page.getByTestId('range-lower-input')).toBeVisible();
  });

  test('a focused name field reveals helpers and a helper commits immediately', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await page.getByTestId('type-number').click();

    const helper = page.getByTestId('name-helper-N');
    await expect(helper).toBeHidden();
    await page.getByTestId('name-input').focus();
    await expect(helper).toBeVisible();
    await helper.click();

    await expect(editor.nodePopup).toHaveCount(0);
    await expect(page.getByTestId('format-token-N')).toBeVisible();
    await expect(page.getByTestId('node-inspector')).toHaveCount(0);
  });

  test('constraint editor commits a range when both bounds are filled without a confirm button', async ({ page }) => {
    await editor.addScalar('N');
    await page.getByTestId('draft-constraint-0').click();

    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '1000');
    await expect(page.getByTestId('constraint-confirm')).toHaveCount(0);
    await expect(editor.getCompletedConstraints()).toHaveCount(1);
    await expect(editor.getTexConstraints()).toContainText('N');
  });
});
