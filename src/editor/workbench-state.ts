import { signal } from '@preact/signals';

export const selectedNodeId = signal<string | null>(null);
export const mobileWorkbenchView = signal<'format' | 'output'>('format');
export const outputTab = signal<'sample' | 'format' | 'constraints'>('sample');

export function clearWorkbenchSelection(): void {
  selectedNodeId.value = null;
}
