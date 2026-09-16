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

  test('constraint controls stay attached while the pointer crosses into them or another row', async ({ page }) => {
    await editor.addScalar('N');
    await editor.addArray('A', 'N');

    const inspector = page.getByTestId('node-inspector');
    const constraintSummary = page.getByTestId('draft-constraint-0');
    await constraintSummary.click();
    await expect(inspector).toHaveAttribute('aria-label', 'N の編集');

    const summaryBox = await constraintSummary.boundingBox();
    const lowerInput = page.getByTestId('range-lower-input');
    const inputBox = await lowerInput.boundingBox();
    expect(summaryBox).not.toBeNull();
    expect(inputBox).not.toBeNull();

    await page.mouse.move(
      inputBox!.x + inputBox!.width / 2,
      (summaryBox!.y + summaryBox!.height + inputBox!.y) / 2,
      { steps: 8 },
    );
    await page.waitForTimeout(500);
    await expect(lowerInput).toBeVisible();
    await expect(inspector).toHaveAttribute('aria-label', 'N の編集');

    await lowerInput.hover();
    await page.getByTestId('constraint-item-1').hover();
    await page.waitForTimeout(500);
    await expect(lowerInput).toBeVisible();
    await expect(inspector).toHaveAttribute('aria-label', 'N の編集');

    await lowerInput.fill('2');
    await lowerInput.press('Enter');
    await expect(page.getByTestId('completed-constraint-0')).toContainText('2');
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
