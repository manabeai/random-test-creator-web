import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('stylesheet migration contracts', () => {
  test('keeps notation, controls, focus and reduced motion intact', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const editor = new EditorPage(page);
    await editor.goto();
    await editor.addScalar('N');
    await page.mouse.move(0, 0);

    await expect(page.locator('.rtc-workspace')).toHaveCSS('display', 'grid');
    await expect(page.locator('.rtc-topbar')).toHaveCSS('min-height', '60px');
    await expect(page.locator('.rtc-topbar h1')).toHaveCSS('font-size', '17px');
    await expect(page.locator('.rtc-topbar h1')).toHaveCSS('font-weight', '760');
    await expect(page.getByTestId('output-tab-sample')).toHaveCSS('border-bottom', '2px solid rgb(0, 106, 122)');
    await expect(page.getByTestId('node-inspector')).toHaveCSS('animation-name', 'none');
    await expect(page.getByTestId('node-inspector')).toHaveCSS('border-radius', '14px');
    await expect(editor.getStructureNodeByLabel('N')).toHaveCSS('background-color', 'rgb(226, 240, 242)');
    await expect(page.locator('.rtc-format-math .katex').first()).toHaveCSS('font-family', /KaTeX_Main/);
    await expect(page.locator('.rtc-format-math .katex-mathml').first()).toHaveCSS('position', 'absolute');

    const lower = page.getByTestId('range-lower-input');
    await lower.focus();
    await expect(lower).toHaveCSS('outline-color', 'rgb(0, 106, 122)');
    await expect(lower).toHaveCSS('outline-width', '2px');
    await expect(lower).toHaveCSS('outline-offset', '2px');
    await expect(lower).toHaveCSS('border-top-width', '1px');
    await expect(lower).toHaveCSS('min-height', '34px');
    await page.locator('.rtc-inspector-header strong').click();
    await page.getByTestId('range-expression-toggle').click();
    await expect(lower).toHaveCSS('min-height', '40px');
    await expect(page.getByTestId('constraint-expression-apply')).toHaveCSS('background-color', 'rgb(0, 85, 101)');
    await page.screenshot({ path: testInfo.outputPath('desktop-expression.png'), animations: 'disabled' });
  });

  for (const width of [821, 820, 390]) {
    test(`preserves the workbench breakpoint and touch layout at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      const mobileSwitch = page.locator('.rtc-mobile-switch');
      const isMobile = width <= 820;
      await expect(mobileSwitch).toHaveCSS('display', isMobile ? 'grid' : 'none');
      await expect(page.locator('.rtc-workspace')).toHaveCSS('display', isMobile ? 'block' : 'grid');
      await expect(page.locator('.rtc-topbar')).toHaveCSS('min-height', isMobile ? '58px' : '60px');

      if (isMobile) {
        await page.getByTestId('insertion-hotspot-below').click();
        await expect(page.getByTestId('name-helper-N')).toHaveCSS('min-height', '44px');
        await expect(page.locator('.rtc-axis-composer')).toHaveCSS('display', 'grid');
        await expect(page.getByTestId('variable-editor')).toHaveCSS('padding', '15px');
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        await page.screenshot({ path: testInfo.outputPath('mobile-create.png'), animations: 'disabled' });
        await page.keyboard.press('Escape');
        await mobileSwitch.getByRole('button', { name: '生成ケース' }).click();
        await expect(page.getByTestId('output-pane')).toBeVisible();
        await expect(page.getByTestId('format-pane')).toBeHidden();
        await expect(page.locator('.rtc-regenerate')).toHaveCSS('min-height', '48px');
      }
    });
  }

  test('preserves the viewer and preset routes, including conditional styles', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#/viewer');
    const panes = page.locator('.viewer-panes');
    await expect(panes).toHaveCSS('display', 'grid');
    await expect(page.locator('.app')).toHaveCSS('background-color', 'rgb(15, 17, 21)');
    await expect(page.locator('.pane-header').first()).toHaveCSS('min-height', '44px');
    await expect(page.locator('.pane-content').first()).toHaveCSS('line-height', '24px');
    const toggle = page.getByRole('button', { name: 'AST', exact: true }).first();
    await toggle.click();
    await page.mouse.move(0, 0);
    await expect(toggle).toHaveClass(/active/);
    await expect(toggle).toHaveCSS('border-top-width', '1px');
    await expect(page.locator('.pane-content').first()).toContainText('Sequence');
    await page.screenshot({ path: testInfo.outputPath('viewer.png'), animations: 'disabled' });
    await page.getByRole('link', { name: 'Preview', exact: true }).click();
    await expect(page.locator('.preview-card').first()).toHaveCSS('border-radius', '8px');
    await expect(page.locator('.preview-grid')).toHaveCSS('gap', '16px');
    await expect(page.locator('.card-content').first()).toHaveCSS('font-size', '12px');
    await page.screenshot({ path: testInfo.outputPath('presets.png'), animations: 'disabled' });
    await page.locator('.preview-card').first().click();
    await page.setViewportSize({ width: 700, height: 844 });
    await expect(panes).toHaveCSS('display', 'flex');
    await expect(panes).toHaveCSS('flex-direction', 'column');
  });
});
