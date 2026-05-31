import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('Precision dark workbench visual shell', () => {
  test('editor uses the modern PC workbench surfaces without breaking the three-pane layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const editor = new EditorPage(page);

    await editor.goto();

    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 17, 21)');
    await expect(page.locator('header')).toHaveCSS('background-color', 'rgb(21, 25, 34)');
    await expect(page.locator('main')).toHaveCSS('background-color', 'rgb(15, 17, 21)');

    const structureBox = await editor.structurePane.boundingBox();
    const constraintBox = await editor.constraintPane.boundingBox();
    const previewBox = await editor.previewPane.boundingBox();

    expect(structureBox).not.toBeNull();
    expect(constraintBox).not.toBeNull();
    expect(previewBox).not.toBeNull();
    expect(structureBox!.width).toBeGreaterThan(300);
    expect(constraintBox!.width).toBeGreaterThan(300);
    expect(previewBox!.width).toBeGreaterThan(300);
    expect(Math.abs(structureBox!.y - constraintBox!.y)).toBeLessThan(2);
    expect(Math.abs(constraintBox!.y - previewBox!.y)).toBeLessThan(2);

    await page.getByTestId('insertion-hotspot-below').first().hover();
    await expect(editor.nodePopup).toBeVisible();
    await expect(editor.nodePopup).toHaveCSS('background-color', 'rgb(21, 25, 34)');
    await expect(page.getByTestId('popup-option-scalar')).toHaveCSS('border-color', 'rgb(56, 65, 82)');
  });
});
