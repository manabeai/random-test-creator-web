import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('PC hover interactions', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('structure hotspot opens the node popup on hover and dismisses when pointer leaves', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().hover();

    await expect(editor.nodePopup).toBeVisible();
    await expect(page.getByTestId('popup-option-scalar')).toBeVisible();

    await editor.previewPane.hover();

    await expect(editor.nodePopup).toHaveCount(0);
  });

  test('draft constraint opens its editor on hover and dismisses when pointer leaves', async ({ page }) => {
    await editor.addScalar('N');

    await page.getByTestId('draft-constraint-0').hover();

    await expect(page.locator('.constraint-editor')).toBeVisible();
    await expect(page.getByTestId('constraint-lower-input')).toBeVisible();

    await editor.previewPane.hover();

    await expect(page.locator('.constraint-editor')).toHaveCount(0);
  });

  test('draft constraint editor stays open while the pointer crosses into it', async ({ page }) => {
    await editor.addScalar('N');
    await editor.addArray('A', 'N');

    const constraintRow = page.getByTestId('constraint-item-0');
    const constraintEditor = page.locator('.constraint-editor');
    await constraintRow.hover();
    await expect(constraintEditor).toBeVisible();
    await expect(constraintEditor).toContainText('Constraint for N');

    const rowBox = await constraintRow.boundingBox();
    const editorBox = await constraintEditor.boundingBox();
    expect(rowBox).not.toBeNull();
    expect(editorBox).not.toBeNull();

    const transitX = Math.max(
      editorBox!.x + 1,
      Math.min(rowBox!.x + rowBox!.width / 2, editorBox!.x + editorBox!.width - 1),
    );
    const transitY = (rowBox!.y + rowBox!.height + editorBox!.y) / 2;

    await page.mouse.move(transitX, transitY);
    await page.waitForTimeout(500);
    await expect(constraintEditor).toBeVisible();
    await expect(constraintEditor).toContainText('Constraint for N');

    await page.mouse.move(
      editorBox!.x + editorBox!.width / 2,
      editorBox!.y + editorBox!.height / 2,
    );
    await expect(constraintEditor).toBeVisible();
    await expect(constraintEditor).toContainText('Constraint for N');
  });

  test('structure popup commits a scalar when the name input loses focus', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().hover();
    await page.getByTestId('popup-option-scalar').click();
    await page.getByTestId('name-input').fill('N');

    await editor.previewPane.click();

    await expect(editor.nodePopup).toHaveCount(0);
    await expect(editor.structurePane).toContainText('N');
    await expect(page.getByTestId('confirm-button')).toHaveCount(0);
  });

  test('constraint editor commits a range when both bounds are filled without a confirm button', async ({ page }) => {
    await editor.addScalar('N');
    await page.getByTestId('draft-constraint-0').hover();

    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '1000');
    await editor.previewPane.click();

    await expect(page.getByTestId('constraint-confirm')).toHaveCount(0);
    await expect(editor.getCompletedConstraints()).toHaveCount(1);
    await expect(editor.getTexConstraints()).toContainText('N');
  });
});
