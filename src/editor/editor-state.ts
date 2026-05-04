/**
 * Editor state management using Preact signals.
 *
 * TEA Pattern:
 *   documentJson (Signal)  = Model
 *   apply_action() (WASM)  = Update
 *   project_full() (WASM)  = View
 */
import { signal, computed } from '@preact/signals';
import {
  new_document,
  project_full,
  apply_action,
  render_input_tex,
  render_constraints_tex,
  generate_sample,
} from '../wasm';
import { buildSamplePreview, samplePreviewText } from '../sample-preview';

// ── Types (mirrors FullProjectionDto from Rust) ────────────────────

export interface ProjectedNode {
  id: string;
  label: string;
  depth: number;
  is_hole: boolean;
  edit?: NodeEditProjection;
}

export interface NodeEditProjection {
  kind: 'scalar' | 'array';
  name: string;
  value_type: 'number' | 'string' | 'char';
  length_expr?: string;
  allowed_kinds: string[];
  allowed_types: string[];
}

export interface StructureLine {
  depth: number;
  nodes: ProjectedNode[];
}

export interface Hotspot {
  parent_id: string;
  direction: 'below' | 'right' | 'inside' | 'variant';
  candidates: string[];
  candidate_details: CandidateDetail[];
  action: HotspotAction;
}

export interface HotspotAction {
  kind: 'add_slot_element' | 'add_sibling' | 'fill_hole' | 'add_choice_variant';
  target_id: string;
  slot_name?: string;
}

export interface CandidateDetail {
  kind: string;
  label: string;
  fields: CandidateField[];
}

export interface CandidateField {
  name: string;
  field_type: 'type' | 'identifier' | 'length' | 'count_expr' | string;
  label: string;
  required: boolean;
  options?: string[];
  default_value?: string;
}

export interface DraftConstraint {
  index: number;
  target_id: string;
  target_name: string;
  display: string;
  template: string;
}

export interface CompletedConstraint {
  index: number;
  constraint_id: string;
  display: string;
}

export interface ProjectedConstraints {
  items: ConstraintItem[];
  drafts: DraftConstraint[];
  completed: CompletedConstraint[];
}

export interface ConstraintItem {
  index: number;
  status: 'draft' | 'completed';
  target_id: string;
  target_name: string;
  display: string;
  template?: string;
  constraint_id?: string;
  draft_index?: number;
  completed_index?: number;
  edit?: ConstraintEditProjection;
}

export type ConstraintEditProjection =
  | { kind: 'Range'; lower: string; upper: string; constraint_id?: string }
  | { kind: 'CharSet'; charset: CharSetSpec; constraint_id?: string }
  | { kind: 'StringLength'; min: string; max: string; constraint_id?: string };

export type CharSetSpec =
  | { kind: 'LowerAlpha' }
  | { kind: 'UpperAlpha' }
  | { kind: 'Alpha' }
  | { kind: 'Digit' }
  | { kind: 'AlphaNumeric' }
  | { kind: 'Custom'; chars: string[] }
  | { kind: 'Range'; from: string; to: string };

export interface ExprCandidate {
  name: string;
  node_id: string;
  value_type: 'number' | 'string' | 'char';
  node_kind: 'scalar' | 'array' | 'matrix' | string;
}

export interface CompletenessSummary {
  total_holes: number;
  filled_slots: number;
  unsatisfied_constraints: number;
  is_complete: boolean;
}

export interface FullProjection {
  nodes: ProjectedNode[];
  structure_lines: StructureLine[];
  hotspots: Hotspot[];
  constraints: ProjectedConstraints;
  available_vars: ExprCandidate[];
  completeness: CompletenessSummary;
}

// ── Signals ────────────────────────────────────────────────────────

export const documentJson = signal<string>('');
export const sampleSeed = signal<number>(42);

// ── Derived state ──────────────────────────────────────────────────

function safeCall<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (e) {
    console.error(e);
    return fallback;
  }
}

const emptyProjection: FullProjection = {
  nodes: [],
  structure_lines: [],
  hotspots: [],
  constraints: { items: [], drafts: [], completed: [] },
  available_vars: [],
  completeness: { total_holes: 0, filled_slots: 0, unsatisfied_constraints: 0, is_complete: false },
};

export const projection = computed<FullProjection>(() => {
  if (!documentJson.value) return emptyProjection;
  return safeCall(() => JSON.parse(project_full(documentJson.value)) as FullProjection, emptyProjection);
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
  const currentDocumentJson = documentJson.value;
  return buildSamplePreview({
    documentJson: currentDocumentJson,
    seed: sampleSeed.value,
    generateSample: generate_sample,
    project: (json) => JSON.parse(project_full(json)),
    draftConstraints: currentDocumentJson ? projection.value.constraints.drafts : undefined,
  });
});

export const sampleText = computed(() => {
  return samplePreviewText(samplePreview.value);
});

// ── Actions ────────────────────────────────────────────────────────

export function initEditor(): void {
  try {
    documentJson.value = new_document();
  } catch (e) {
    console.error('Failed to create new document:', e);
  }
}

export function setDocumentJson(json: string): void {
  documentJson.value = json;
}

export function dispatchAction(actionJson: string): void {
  try {
    documentJson.value = apply_action(documentJson.value, actionJson);
  } catch (e) {
    console.error('Action failed:', e, actionJson);
  }
}

export function shuffleSeed(): void {
  sampleSeed.value = Math.floor(Math.random() * 0xffffffff);
}
