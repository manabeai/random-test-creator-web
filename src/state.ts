import { signal, computed } from '@preact/signals';
import {
  render_input_format,
  render_structure_tree,
  render_constraints_text,
  render_constraint_tree,
  render_input_tex,
  render_constraints_tex,
  generate_sample,
  get_preset,
} from './wasm';
import { buildSamplePreview, samplePreviewText } from './sample-preview';

// ── Page routing ────────────────────────────────────────────────────

function resolveHash(): 'editor' | 'viewer' | 'preview' {
  const h = window.location.hash;
  if (h === '#/viewer') return 'viewer';
  if (h === '#/preview') return 'preview';
  return 'editor';
}

export const currentPage = signal<'editor' | 'viewer' | 'preview'>(resolveHash());

window.addEventListener('hashchange', () => {
  currentPage.value = resolveHash();
});

// ── Viewer state ────────────────────────────────────────────────────

export const documentJson = signal<string>('');
export const activePreset = signal<string>('scalar_array');
export const sampleSeed = signal<number>(0);
export const activePreviewTab = signal<'tex' | 'sample'>('tex');
export const structureAstMode = signal<boolean>(false);
export const constraintAstMode = signal<boolean>(false);

// ── Derived state ───────────────────────────────────────────────────

function safeCall<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (e) {
    console.error(e);
    return fallback;
  }
}

export const structureText = computed(() => {
  if (!documentJson.value) return '';
  return safeCall(
    () =>
      structureAstMode.value
        ? render_structure_tree(documentJson.value)
        : render_input_format(documentJson.value),
    'Error rendering structure',
  );
});

export const constraintText = computed(() => {
  if (!documentJson.value) return '';
  return safeCall(
    () =>
      constraintAstMode.value
        ? render_constraint_tree(documentJson.value)
        : render_constraints_text(documentJson.value),
    'Error rendering constraints',
  );
});

export const inputTexString = computed(() => {
  if (!documentJson.value) return '';
  return safeCall(() => render_input_tex(documentJson.value), '');
});

export const constraintsTexString = computed(() => {
  if (!documentJson.value) return '';
  return safeCall(() => render_constraints_tex(documentJson.value), '');
});

export const samplePreview = computed(() => {
  return buildSamplePreview({
    documentJson: documentJson.value,
    seed: sampleSeed.value,
    generateSample: generate_sample,
  });
});

export const sampleText = computed(() => {
  return samplePreviewText(samplePreview.value);
});

// ── Actions ─────────────────────────────────────────────────────────

export function loadPreset(name: string): void {
  try {
    documentJson.value = get_preset(name);
    activePreset.value = name;
  } catch (e) {
    console.error('Failed to load preset:', e);
  }
}

export function shuffleSeed(): void {
  sampleSeed.value = Math.floor(Math.random() * 0xffffffff);
}
