import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('Char/String constraints and stable constraint rows', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('Char scalar creates a CharSet draft and keeps row position after confirm', async () => {
    await editor.addScalar('c', 'char');

    const firstRow = editor.page.getByTestId('constraint-item-0');
    await expect(firstRow).toContainText('charset(c)');
    await expect(firstRow).toHaveAttribute('data-constraint-status', 'draft');

    await firstRow.click();
    await editor.page.getByTestId('charset-option-lowercase').click();
    await editor.confirmConstraint();

    await expect(firstRow).toHaveAttribute('data-constraint-status', 'completed');
    await expect(firstRow).toContainText('charset(c)');
    await expect(firstRow).toContainText('lowercase');
  });

  test('String scalar creates CharSet and StringLength drafts', async () => {
    await editor.addScalar('N');
    await editor.addScalar('S', 'string');

    await expect(editor.page.getByTestId('constraint-item-1')).toContainText('charset(S)');
    await expect(editor.page.getByTestId('constraint-item-2')).toContainText('len(S)');

    await editor.page.getByTestId('constraint-item-2').click();
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundVar('upper', 'N');
    await editor.confirmConstraint();

    await expect(editor.page.getByTestId('constraint-item-2')).toHaveAttribute('data-constraint-status', 'completed');
    await expect(editor.page.getByTestId('constraint-item-2')).toContainText('len(S)');
  });

  test('completed numeric range stays in the same constraint slot', async () => {
    await editor.addScalar('N');
    const firstRow = editor.page.getByTestId('constraint-item-0');
    await expect(firstRow).toHaveAttribute('data-constraint-status', 'draft');

    await firstRow.click();
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.confirmConstraint();

    await expect(firstRow).toHaveAttribute('data-constraint-status', 'completed');
    await expect(firstRow).toContainText('N');
  });
});
