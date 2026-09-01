import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('Web editor consistency', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('app title and workbench identity are exposed accessibly', async () => {
    const description = '競プロのランダムテストノーコードで作ろう';
    const siteUrl = 'https://random-test-creator.matsu-devtool.workers.dev/';
    const ogImageUrl = `${siteUrl}ogp.png`;

    await expect(editor.page).toHaveTitle('ランダムテスト');
    await expect(editor.page.getByRole('heading', { level: 1 })).toHaveText('ランダムテスト');
    await expect(editor.page.locator('meta[name="application-name"]')).toHaveAttribute('content', 'ランダムテスト');
    await expect(editor.page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    await expect(editor.page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f7fafb');
    await expect(editor.page.locator('link[rel="canonical"]')).toHaveAttribute('href', siteUrl);
    await expect(editor.page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');

    await expect(editor.page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(editor.page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'ja_JP');
    await expect(editor.page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'ランダムテスト');
    await expect(editor.page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'ランダムテスト');
    await expect(editor.page.locator('meta[property="og:description"]')).toHaveAttribute('content', description);
    await expect(editor.page.locator('meta[property="og:url"]')).toHaveAttribute('content', siteUrl);
    await expect(editor.page.locator('meta[property="og:image"]')).toHaveAttribute('content', ogImageUrl);
    await expect(editor.page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/png');
    await expect(editor.page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(editor.page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(editor.page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', description);

    await expect(editor.page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(editor.page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', 'ランダムテスト');
    await expect(editor.page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description);
    await expect(editor.page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', ogImageUrl);
    await expect(editor.page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', description);

    const ogImage = await editor.page.request.get('/ogp.png');
    expect(ogImage.ok()).toBe(true);
    expect(ogImage.headers()['content-type']).toBe('image/png');

    const favicon = await editor.page.request.get('/favicon.svg');
    expect(favicon.ok()).toBe(true);
    expect(favicon.headers()['content-type']).toContain('image/svg+xml');
  });

  test('shared state with min expression restores and shows sample', async () => {
    const state = 'H4sIAAAAAAAAA62TzW7CMBCE32VOreQDSeHiG1IvlXqiPxeEIuMsIapZU8ehoMjvXjlQJRSo2opT5Pibnclq0qDSS1qpbEOuKi1DJgK51fWK2EM2qLyrta8dxYOz1kNiAAGmrc_KHBJ3EFCOWEFOG7SvIvBWch41-yee6L0m1gQBvSxN7oghp0ggkGIWgjhIkzNSrYxy0VOtCBKMDk9P8bFzatfRYwgY4sIve8xrO8_Rglwb6uimVHNDE1rEGTan7JArhBBmQUBbrrxTJfsq6rpFjM4vouN7Ns-7Nd2TNhDwyhXkfxdBgLZr0p7i-YE9jhd3Nav0R6v0ktVEcUF__iRjP8j14MfSQ2CjTE2QSRCo1-sfgEEIQXBtzFe84dXipf-Kd7lcL-yosmZDedfPVck3LEa3-34JzHdZDNB2qL-ob8Wbtt2Kv45ojhKfcFE6xCzOLoydKwM5nYUQPgFNgdDW-wMAAA';

    await editor.page.goto(`/?state=${state}`);

    await expect(editor.structurePane).toContainText('n');
    await expect(editor.structurePane).toContainText('A');
    await expect(editor.getSampleOutput()).not.toBeEmpty();
  });

  test('shared state with min multiplication and division restores and shows sample', async () => {
    const state = 'H4sIAAAAAAAAA62SX2vCMBTFv8t52kZga0VweRP2MtiT-_MiRWJ61bJ406WpUyTffaQKrVPHNnxpSfo795xezhaVXtBSTVbkqsIyZCKQW10viT3kFpV3tfa1o3hw1npI3EGAae0nRQ6JHgSUI1aQ4y2aqwi8F5xHze6NZ_qoiTVBQC8KkztiyDESCKTIQhB7aXJCqpVRLnqqJUGC0eLpMT50Tm1aeggBQzz3iw7z1sxzNCPXhDr4UqipoRHN4gyb02SfK4QQsiCgLVfeqYJ9FXXtIu5PL6LlOzYvm5IeSBsIeOXm5H8XQYDWJWlP8fzIHoeLu5hVetqKa2M6j71z_5zzSPGc_vyHxn6S68BPhYfASpmaIJMgUJflD8BdOAi6zzi4WMb0XxnPF-6VHVXWrChvO7ss-IpF__omve3teicw3UxiiKZb3Y19K-S46VwfWSxGN_URF6UDZHH23NipMpDjLITwBYw0tnITBAAA';

    await editor.page.goto(`/?state=${state}`);

    await expect(editor.structurePane).toContainText('n');
    await expect(editor.structurePane).toContainText('A');
    await expect(editor.getSampleOutput()).not.toBeEmpty();
  });

  test('draft constraints suppress sample until required bounds are filled', async () => {
    await editor.addScalar('N');

    await expect(editor.getDraftConstraints()).toHaveCount(1);
    await expect(editor.getSampleOutput()).toBeEmpty();
    await expect(editor.page.getByTestId('generation-blocked')).toHaveAttribute('data-blocker-count', '1');

    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '2');
    await editor.fillBoundLiteral('upper', '2');
    await editor.confirmConstraint();

    await expect(editor.getSampleOutput()).not.toBeEmpty();
    await expect(editor.page.getByTestId('generation-blocked')).toHaveCount(0);
  });

  test('length and count variable pickers only show Int scalar variables', async () => {
    await editor.addScalar('N');
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '3');
    await editor.confirmConstraint();

    await editor.addScalar('C', 'char');
    await editor.page.getByTestId('constraint-item-1').click();
    await editor.page.getByTestId('charset-option-lowercase').click();
    await editor.confirmConstraint();

    await editor.clickHotspot('below');
    await editor.selectPopupOption('array');
    await expect(editor.page.getByTestId('horizontal-axis').locator('option[value="N"]')).toHaveCount(1);
    await expect(editor.page.getByTestId('horizontal-axis').locator('option[value="C"]')).toHaveCount(0);
    await editor.closePopupByEscape();

    await editor.clickHotspot('below');
    await editor.selectPopupOption('repeat');
    await expect(editor.page.getByTestId('count-var-option-N')).toBeVisible();
    await expect(editor.page.getByTestId('count-var-option-C')).toHaveCount(0);
  });

  test('completed constraints can be edited and deleted back to draft slots', async () => {
    await editor.addScalar('N');
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '3');
    await editor.confirmConstraint();

    await expect(editor.page.getByTestId('constraint-item-0')).toHaveAttribute('data-constraint-status', 'completed');

    await editor.page.getByTestId('completed-constraint-0').click();
    await editor.page.getByTestId('range-lower-input').fill('2');
    await editor.page.getByTestId('range-lower-input').press('Enter');
    await editor.confirmConstraint();

    await expect(editor.page.getByTestId('constraint-item-0')).toContainText('2');

    await editor.page.getByTestId('delete-constraint-0').click();
    await expect(editor.page.getByTestId('constraint-item-0')).toHaveAttribute('data-constraint-status', 'draft');
    await expect(editor.getSampleOutput()).toBeEmpty();
    await expect(editor.page.getByTestId('generation-blocked')).toHaveAttribute('data-blocker-count', '1');
  });

  test('function expressions in constraints still allow sample generation', async () => {
    await editor.addScalar('N');
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '3');
    await editor.confirmConstraint();

    await editor.addScalarRight('M');
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'N');
    await editor.applyBoundFunction('upper', 'add', '2');
    await editor.confirmConstraint();

    await expect(editor.getSampleOutput()).not.toBeEmpty();
  });

  test('min function expressions in constraints still allow sample generation', async () => {
    await editor.addScalar('n');
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.confirmConstraint();

    await editor.addArray('A', 'n');
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'n');
    await editor.applyBoundFunction('upper', 'min', '5');
    await editor.confirmConstraint();

    await expect(editor.getSampleOutput()).not.toBeEmpty();
  });

  test('header reset clears the current document', async () => {
    await editor.addScalar('N');
    await expect(editor.structurePane).toContainText('N');

    const resetButton = editor.page.getByTestId('reset-document-button');
    await expect(resetButton).toHaveAccessibleName('リセット');
    await resetButton.click();

    await expect(editor.structurePane).not.toContainText('N');
    await expect(editor.insertionHotspots.first()).toBeVisible();

    await editor.page.getByTestId('undo-button').click();
    await expect(editor.structurePane).toContainText('N');
  });
});
