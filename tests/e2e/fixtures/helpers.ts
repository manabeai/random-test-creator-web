import { expect, type Locator } from '@playwright/test';
import type { EditorPage } from './editor-page';

/**
 * Assert the right pane has non-empty content in all three sections:
 * TeX input format, TeX constraints, and sample output.
 */
export async function expectRightPanePopulated(
  editor: EditorPage,
): Promise<void> {
  await expect(editor.getTexInputFormat()).not.toBeEmpty();
  await expect(editor.getTexConstraints()).not.toBeEmpty();
  await expect(editor.getSampleOutput()).not.toBeEmpty();
}

/**
 * Assert that at least `minCount` draft constraints exist.
 */
export async function expectDraftCount(
  editor: EditorPage,
  minCount: number,
): Promise<void> {
  const drafts = editor.getDraftConstraints();
  await expect(drafts).toHaveCount(minCount, { timeout: 5000 });
}

/**
 * Assert the structure pane displays expected text content (substring match).
 */
export async function expectStructureContains(
  editor: EditorPage,
  text: string,
): Promise<void> {
  await expect(editor.structurePane).toContainText(text);
}

/**
 * Assert that sample output has at least `minLines` non-empty lines.
 */
export async function expectSampleLines(
  editor: EditorPage,
  minLines: number,
): Promise<void> {
  const sampleLocator = editor.getSampleOutput();
  const content = await sampleLocator.textContent();
  const lines = (content ?? '')
    .trim()
    .split('\n')
    .filter((l) => l.length > 0);
  expect(lines.length).toBeGreaterThanOrEqual(minLines);
}
