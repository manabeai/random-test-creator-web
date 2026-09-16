import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('notation-first workbench visual shell', () => {
  test('editor uses a cool-paper 64/36 input and output workspace', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const editor = new EditorPage(page);

    await editor.goto();

    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 248, 250)');
    await expect(page.locator('.rtc-topbar')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.98)');

    const structureBox = await editor.structurePane.boundingBox();
    const previewBox = await page.getByTestId('output-pane').boundingBox();

    expect(structureBox).not.toBeNull();
    expect(previewBox).not.toBeNull();
    expect(structureBox!.width / (structureBox!.width + previewBox!.width)).toBeCloseTo(0.64, 1);
    expect(Math.abs(structureBox!.y - previewBox!.y)).toBeLessThan(2);

    await page.getByTestId('insertion-hotspot-below').first().click();
    await expect(page.getByTestId('variable-editor')).toBeVisible();
    await expect(page.getByTestId('variable-editor')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });
});
