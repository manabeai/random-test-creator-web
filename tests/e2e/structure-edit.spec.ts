import { test, expect } from '@playwright/test';
import { EditorPage } from './fixtures/editor-page';

test.describe('Structure node editing', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('existing Scalar can be converted to Array with length variable', async () => {
    await editor.addScalar('N');

    await editor.getStructureNodeByLabel('N').getByText('N').click();
    await editor.page.getByTestId('node-edit-kind-select').selectOption('array');
    await editor.page.getByTestId('node-edit-input').fill('A');
    await editor.page.getByTestId('node-edit-length-var-option-N').click();
    await editor.page.getByTestId('node-edit-confirm').click();

    await expect(editor.structurePane).toContainText('A');
    await expect(editor.structurePane).not.toContainText('N');
    await expect(editor.getDraftConstraints()).toHaveCount(1);
  });

  test('changing ranged Int scalar to Char removes range and creates CharSet draft', async () => {
    await editor.addScalar('N');
    await editor.openDraft(0);
    await editor.fillBoundLiteral('lower', '1');
    await editor.fillBoundLiteral('upper', '10');
    await editor.confirmConstraint();

    await editor.getStructureNodeByLabel('N').getByText('N').click();
    await editor.page.getByTestId('node-edit-type-select').selectOption('char');
    await editor.page.getByTestId('node-edit-input').fill('c');
    await editor.page.getByTestId('node-edit-confirm').click();

    await expect(editor.getCompletedConstraints()).toHaveCount(0);
    await expect(editor.page.getByTestId('constraint-item-0')).toHaveAttribute('data-constraint-status', 'draft');
    await expect(editor.page.getByTestId('constraint-item-0')).toContainText('charset(c)');
  });
});
