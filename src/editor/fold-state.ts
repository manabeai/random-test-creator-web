/**
 * Fold state for SP (mobile) responsive layout.
 * Each pane has a signal controlling its collapsed state.
 * On mobile, panes can be toggled between open/collapsed.
 */
import { signal } from '@preact/signals';

// All panes default to open (not folded)
export const structureFolded = signal(false);
export const constraintFolded = signal(false);
export const previewFolded = signal(false);

export function toggleStructureFold() {
  structureFolded.value = !structureFolded.value;
}

export function toggleConstraintFold() {
  constraintFolded.value = !constraintFolded.value;
}

export function togglePreviewFold() {
  previewFolded.value = !previewFolded.value;
}
