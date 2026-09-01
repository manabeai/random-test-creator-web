import { test, expect, type Page } from '@playwright/test';

async function chooseName(page: Page, name: string) {
  await page.getByTestId('name-input').focus();
  await page.getByTestId(`name-helper-${name}`).click();
}

test.describe('direct input workbench', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('keeps insertion points visible and gives them a clear hover action', async ({ page }) => {
    const addPoint = page.getByTestId('insertion-hotspot-below').first();

    await expect(addPoint).toHaveCSS('border-color', 'rgb(16, 24, 39)');
    await expect(addPoint).toHaveCSS('color', 'rgb(16, 24, 39)');

    await addPoint.hover();
    await expect(addPoint).toHaveCSS('background-color', 'rgb(16, 24, 39)');
    await expect(addPoint).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('places the next vertical insertion point below the existing notation', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').click();
    await page.getByTestId('name-input').fill('N');

    const line = page.getByTestId('input-format-line').first();
    const notation = line.locator('.rtc-format-math');
    const addPoint = page.getByTestId('insertion-hotspot-below');
    const [lineBox, notationBox, addBox] = await Promise.all([
      line.boundingBox(),
      notation.boundingBox(),
      addPoint.boundingBox(),
    ]);

    expect(lineBox).not.toBeNull();
    expect(notationBox).not.toBeNull();
    expect(addBox).not.toBeNull();
    expect(addBox!.y).toBeGreaterThanOrEqual(lineBox!.y + lineBox!.height - 2);
    expect(addBox!.x).toBeGreaterThanOrEqual(notationBox!.x - 2);

    await addPoint.click();
    const popup = page.getByTestId('node-popup');
    const popupBox = await popup.boundingBox();
    const arrowLeft = await popup.evaluate(element => (
      Number.parseFloat(getComputedStyle(element, '::before').left)
    ));
    expect(popupBox).not.toBeNull();
    const arrowCenter = popupBox!.x + arrowLeft + 11;
    const addCenter = addBox!.x + addBox!.width / 2;
    expect(Math.abs(arrowCenter - addCenter)).toBeLessThanOrEqual(2);
  });

  test('commits one typed character without a check or an automatic inspector transition', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').click();

    const nameInput = page.getByTestId('name-input');
    await expect(nameInput).toHaveAttribute('maxlength', '1');
    await expect(page.getByTestId('confirm-button')).toHaveCount(0);
    await nameInput.fill('N');

    await expect(page.getByTestId('variable-editor')).toHaveCount(0);
    await expect(page.getByTestId('format-token-N')).toBeVisible();
    await expect(page.getByTestId('node-inspector')).toHaveCount(0);
  });

  test('reveals compact name helpers from the name field and commits a helper immediately', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').click();
    await page.getByTestId('type-number').click();

    const nameInput = page.getByTestId('name-input');
    const editor = page.getByTestId('variable-editor');
    const helpers = page.getByLabel('名前候補');
    const helper = page.getByTestId('name-helper-N');
    await expect(helper).toBeHidden();
    await nameInput.hover();
    await expect(helper).toBeVisible();
    await expect(helpers).toHaveCSS('box-shadow', 'none');
    await expect(helpers).toHaveCSS('border-top-width', '0px');

    const editorBox = await editor.boundingBox();
    const helpersBox = await helpers.boundingBox();
    expect(editorBox).not.toBeNull();
    expect(helpersBox).not.toBeNull();
    expect(helpersBox!.x).toBeGreaterThanOrEqual(editorBox!.x);
    expect(helpersBox!.x + helpersBox!.width).toBeLessThanOrEqual(editorBox!.x + editorBox!.width);
    expect(helpersBox!.y + helpersBox!.height).toBeLessThanOrEqual(editorBox!.y + editorBox!.height);

    await helper.click();

    await expect(page.getByTestId('format-token-N')).toBeVisible();
    await expect(page.getByTestId('variable-editor')).toHaveCount(0);
    await expect(page.getByTestId('node-inspector')).toHaveCount(0);
  });

  test('builds N and A directly from the competitive-programming notation surface', async ({ page }) => {
    await expect(page.getByTestId('editor-workbench')).toBeVisible();
    await expect(page.getByTestId('format-pane')).toBeVisible();
    await expect(page.getByTestId('output-pane')).toBeVisible();
    await expect(page.getByText('変更は入力形式と生成ケースへ同時に反映されます')).toHaveCount(0);
    await expect(page.getByText('名前を入れるだけ・構造は変わりません')).toHaveCount(0);

    await page.getByTestId('insertion-hotspot-below').first().click();
    await expect(page.getByTestId('variable-editor')).toBeVisible();
    await expect(page.getByTestId('type-number')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('type-string')).toContainText('String');
    await expect(page.getByTestId('type-char')).toContainText('Char');

    await page.getByTestId('name-input').fill('N');
    await expect(page.getByTestId('variable-editor')).toHaveCount(0);
    await expect(page.getByTestId('format-token-N')).toBeVisible();

    await page.getByTestId('insertion-hotspot-right').click();
    await page.getByTestId('horizontal-axis').selectOption('N');
    await chooseName(page, 'A');
    await expect(page.getByTestId('variable-editor')).toHaveCount(0);

    const firstLine = page.getByTestId('input-format-line').first();
    await expect(firstLine).toContainText('N');
    await expect(firstLine).toContainText('A');
    await expect(firstLine).toContainText('⋯');
  });

  test('uses an interval slider for Number constraints and exact numeric inputs', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'N');
    await page.getByTestId('format-token-N').click();

    await expect(page.getByTestId('node-inspector')).toBeVisible();
    await expect(page.getByTestId('number-range-control')).toBeVisible();
    await expect(page.getByTestId('range-lower-slider')).toHaveAttribute('type', 'range');
    await expect(page.getByTestId('range-upper-slider')).toHaveAttribute('type', 'range');

    await page.getByTestId('range-lower-input').fill('1');
    await page.getByTestId('range-upper-input').fill('1000000');
    await page.getByTestId('range-upper-input').press('Enter');

    await expect(page.getByTestId('constraint-item-0')).toHaveAttribute('data-constraint-status', 'completed');
    await expect(page.getByTestId('tex-constraints')).toContainText('N');
  });

  test('persists an exact lower bound when that field loses focus', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'N');
    await page.getByTestId('format-token-N').click();

    await page.getByTestId('range-lower-input').fill('2');
    await page.getByTestId('range-lower-input').press('Enter');

    await expect(page.getByTestId('constraint-item-0')).toHaveAttribute('data-constraint-status', 'completed');
    await expect(page.getByTestId('completed-constraint-0')).toContainText('2 ≤ N ≤ 100');
    await expect(page.getByTestId('range-upper-input')).toBeFocused();
  });

  test('switches String and Char to a character-set editor without Number range controls', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await page.getByTestId('type-string').click();
    await chooseName(page, 'S');
    await page.getByTestId('format-token-S').click();

    await expect(page.getByTestId('charset-control')).toBeVisible();
    await expect(page.getByTestId('number-range-control')).toHaveCount(0);
    await page.getByTestId('charset-option-digit').click();
    await expect(page.getByTestId('constraint-item-0')).toHaveAttribute('data-constraint-status', 'completed');
    await expect(page.getByTestId('string-length-control')).toBeVisible();

    await page.getByTestId('node-type-char').click();
    await expect(page.getByTestId('charset-control')).toBeVisible();
    await expect(page.getByTestId('string-length-control')).toHaveCount(0);
    await page.getByTestId('charset-option-custom').click();
    await page.getByTestId('charset-custom-input').fill('01?');
    await page.getByTestId('charset-custom-input').press('Enter');
    await expect(page.getByTestId('charset-preview')).toContainText('0');
    await expect(page.getByTestId('charset-preview')).toContainText('?');
  });

  test('uses one action to switch between input and generated cases on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const switcher = page.getByTestId('mobile-mode-switch');
    await expect(switcher).toBeVisible();
    await expect(page.getByTestId('format-pane')).toBeVisible();
    await switcher.getByRole('button', { name: '生成ケース' }).click();
    await expect(page.getByTestId('output-pane')).toBeVisible();
    await expect(page.getByTestId('format-pane')).not.toBeVisible();
  });

  test('reveals tap-sized name helpers on focus for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.getByTestId('insertion-hotspot-below').click();
    await page.getByTestId('type-number').click();

    const helper = page.getByTestId('name-helper-N');
    const editor = page.getByTestId('variable-editor');
    const helpers = page.getByLabel('名前候補');
    await expect(helper).toBeHidden();
    await page.getByTestId('name-input').focus();
    await expect(helper).toBeVisible();
    const [editorBox, helpersBox, helperBox] = await Promise.all([
      editor.boundingBox(),
      helpers.boundingBox(),
      helper.boundingBox(),
    ]);
    expect(editorBox).not.toBeNull();
    expect(helpersBox).not.toBeNull();
    expect(helperBox).not.toBeNull();
    expect(helpersBox!.x).toBeGreaterThanOrEqual(editorBox!.x);
    expect(helpersBox!.x + helpersBox!.width).toBeLessThanOrEqual(editorBox!.x + editorBox!.width);
    expect(helpersBox!.y + helpersBox!.height).toBeLessThanOrEqual(editorBox!.y + editorBox!.height);
    expect(helperBox!.height).toBeGreaterThanOrEqual(44);

    await helper.click();
    await expect(page.getByTestId('format-token-N')).toBeVisible();
  });

  test('forms a vertical matrix from the same primitive × axes editor', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'H');
    await page.getByTestId('insertion-hotspot-right').click();
    await chooseName(page, 'W');

    await page.getByTestId('insertion-hotspot-below').first().click();
    await page.getByTestId('horizontal-axis').selectOption('W');
    await page.getByTestId('vertical-axis').selectOption('H');
    await chooseName(page, 'A');

    await page.getByTestId('format-token-A').first().click();
    await expect(page.getByTestId('node-horizontal-axis')).toHaveValue('W');
    await expect(page.getByTestId('node-vertical-axis')).toHaveValue('H');
    await expect(page.getByTestId('input-format-line')).toHaveCount(5);
  });

  test('undoes, redoes, and removes a variable from its line-attached inspector', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'N');
    await page.getByTestId('insertion-hotspot-right').click();
    await page.getByTestId('horizontal-axis').selectOption('N');
    await chooseName(page, 'A');

    await page.getByTestId('format-token-A').first().click();
    await page.getByTestId('node-name-helper-B').click();
    await expect(page.getByTestId('node-edit-input')).toHaveValue('B');
    await page.getByTestId('node-name-confirm').click();
    await expect(page.getByTestId('format-token-B').first()).toBeVisible();

    await page.getByTestId('undo-button').click();
    await expect(page.getByTestId('format-token-A').first()).toBeVisible();
    await page.getByTestId('redo-button').click();
    await expect(page.getByTestId('format-token-B').first()).toBeVisible();

    await page.getByTestId('format-token-B').first().click();
    const remove = page.getByTestId('node-delete-button');
    await remove.click();
    await expect(remove).toHaveAttribute('aria-label', 'B を削除する');
    await remove.click();
    await expect(page.getByTestId('format-token-B')).toHaveCount(0);
    await expect(page.getByTestId('format-token-N')).toBeVisible();
  });

  test('regenerates with feedback while respecting the seed lock', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'N');
    await page.getByTestId('format-token-N').click();
    await page.getByTestId('range-lower-input').fill('1');
    await page.getByTestId('range-upper-input').fill('10');
    await page.getByTestId('range-upper-input').press('Enter');

    const seed = page.getByLabel('生成シード');
    const seedLock = page.getByTestId('seed-lock-button');
    const regenerate = page.getByTestId('regenerate-button');
    const initialSeed = await seed.inputValue();

    await expect(seedLock).toHaveAttribute('aria-pressed', 'true');
    await expect(seedLock).toHaveAccessibleName('シード固定を解除');
    await expect(page.getByTestId('seed-lock-checkbox')).toHaveCount(0);

    const seedBox = await seed.boundingBox();
    const lockBox = await seedLock.boundingBox();
    expect(seedBox).not.toBeNull();
    expect(lockBox).not.toBeNull();
    expect(lockBox!.x).toBeGreaterThan(seedBox!.x + seedBox!.width);
    expect(lockBox!.x - (seedBox!.x + seedBox!.width)).toBeLessThanOrEqual(8);

    await regenerate.click();
    await expect(regenerate).toHaveAttribute('aria-busy', 'true');
    await expect(seed).toHaveValue(initialSeed);
    await expect(regenerate).toHaveAttribute('aria-busy', 'false');

    await seedLock.click();
    await expect(seedLock).toHaveAttribute('aria-pressed', 'false');
    await expect(seedLock).toHaveAccessibleName('シードを固定');
    await regenerate.click();
    await expect(seed).not.toHaveValue(initialSeed);
  });

  test('selects projected notation tokens from the keyboard', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'N');

    const token = page.getByTestId('format-token-N');
    await token.focus();
    await expect(token).toBeFocused();
    await token.press('Enter');
    await expect(page.getByTestId('node-inspector')).toBeVisible();
  });

  test('announces real interval values instead of slider stop indices', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'N');
    await page.getByTestId('format-token-N').click();

    await expect(page.getByTestId('range-lower-slider')).toHaveAttribute('aria-valuetext', '1');
    await expect(page.getByTestId('range-upper-slider')).toHaveAttribute('aria-valuetext', '100');
  });

  test('opens an inactive constraint row with the keyboard', async ({ page }) => {
    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'N');
    await page.getByTestId('insertion-hotspot-right').click();
    await page.getByTestId('horizontal-axis').selectOption('N');
    await chooseName(page, 'A');

    await page.getByTestId('format-token-N').click();
    const aConstraint = page.getByTestId('constraint-item-1');
    await expect(aConstraint).toHaveAttribute('role', 'button');
    await aConstraint.focus();
    await aConstraint.press('Enter');
    await expect(page.getByTestId('node-inspector')).toHaveAttribute('aria-label', 'A の編集');
  });

  test('explains generation blockers and returns directly to their editor', async ({ page }) => {
    const regenerate = page.getByTestId('regenerate-button');
    await expect(regenerate).toBeDisabled();
    await expect(page.getByTestId('generation-blocked')).toHaveAttribute('data-blocker-kind', 'empty_input');

    await page.getByTestId('generation-focus-input').click();
    await expect(page.getByTestId('insertion-hotspot-below').first()).toBeFocused();

    await page.getByTestId('insertion-hotspot-below').first().click();
    await chooseName(page, 'N');

    const blocker = page.getByTestId('generation-blocked');
    await expect(blocker).toHaveAttribute('data-blocker-kind', 'constraints');
    await blocker.getByRole('button', { name: 'N の制約を設定' }).click();
    await expect(page.getByTestId('node-inspector')).toHaveAttribute('aria-label', 'N の編集');
  });

  test('moves output tabs with arrow keys and exposes linked tabpanels', async ({ page }) => {
    const sampleTab = page.getByTestId('output-tab-sample');
    const formatTab = page.getByTestId('output-tab-format');
    await sampleTab.focus();
    await sampleTab.press('ArrowRight');

    await expect(formatTab).toBeFocused();
    await expect(formatTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('output-panel-format')).toHaveAttribute('role', 'tabpanel');
    await expect(formatTab).toHaveAttribute('aria-controls', 'rtc-output-panel-format');
  });
});
