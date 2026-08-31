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
  kind: 'scalar' | 'array' | 'matrix';
  name: string;
  value_type: 'number' | 'string' | 'char';
  base_type: 'number' | 'string' | 'char';
  length_expr?: string;
  allowed_kinds: string[];
  allowed_types: Array<'number' | 'string' | 'char'>;
  horizontal: AxisEditProjection;
  vertical: AxisEditProjection;
  remove?: RemoveNodeProjection;
}

export interface AxisEditProjection {
  mode: 'none' | 'repeat';
  length_expr?: string;
  options: AxisOptionProjection[];
}

export interface AxisOptionProjection {
  value: string;
  label: string;
  node_id: string;
}

export interface InputSurfaceProjection {
  name_helpers: string[];
  name_max_chars: number;
  primitive_types: Array<'number' | 'string' | 'char'>;
  axis_options: AxisOptionProjection[];
}

export interface RemoveNodeProjection {
  parent_id: string;
  slot_name: string;
  child_id: string;
}

export interface InputFormatProjection {
  lines: InputFormatLineProjection[];
}

export interface InputFormatLineProjection {
  depth: number;
  tex: string;
  node_ids: string[];
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
  commit_on_ready: boolean;
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
  | { kind: 'Range'; lower: string; upper: string; constraint_id?: string; slider: IntervalSliderProjection }
  | { kind: 'CharSet'; charset: CharSetSpec; constraint_id?: string; choices: CharSetChoiceProjection[] }
  | { kind: 'StringLength'; min: string; max: string; constraint_id?: string; slider: IntervalSliderProjection };

export interface IntervalSliderProjection {
  stops: { value: string; label: string }[];
  lower_index: number;
  upper_index: number;
}

export interface CharSetChoiceProjection {
  value: CharSetSpec['kind'] | 'Custom';
  preview: string;
}

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

export interface GenerationProjection {
  can_generate: boolean;
  blockers: GenerationBlockerProjection[];
}

export interface GenerationBlockerProjection {
  kind: 'empty_input' | 'structure' | 'constraints' | string;
  count: number;
  target_ids: string[];
  target_names: string[];
}

export interface FullProjection {
  input_format: InputFormatProjection;
  input_surface: InputSurfaceProjection;
  nodes: ProjectedNode[];
  structure_lines: StructureLine[];
  hotspots: Hotspot[];
  constraints: ProjectedConstraints;
  available_vars: ExprCandidate[];
  completeness: CompletenessSummary;
  generation: GenerationProjection;
}

// ── Signals ────────────────────────────────────────────────────────

export const documentJson = signal<string>('');
export const sampleSeed = signal<number>(42);
export const seedLocked = signal<boolean>(true);
export const editorError = signal<string>('');
const pastDocuments = signal<string[]>([]);
const futureDocuments = signal<string[]>([]);
const sampleRevision = signal<number>(0);

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
  input_format: { lines: [] },
  input_surface: {
    name_helpers: ['N', 'M', 'H', 'W', 'A', 'B', 'S', 'T', 'Q'],
    name_max_chars: 1,
    primitive_types: ['number', 'string', 'char'],
    axis_options: [],
  },
  nodes: [],
  structure_lines: [],
  hotspots: [],
  constraints: { items: [], drafts: [], completed: [] },
  available_vars: [],
  completeness: { total_holes: 0, filled_slots: 0, unsatisfied_constraints: 0, is_complete: false },
  generation: {
    can_generate: false,
    blockers: [{ kind: 'empty_input', count: 1, target_ids: [], target_names: [] }],
  },
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
  sampleRevision.value;
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
    pastDocuments.value = [];
    futureDocuments.value = [];
    editorError.value = '';
  } catch (e) {
    console.error('Failed to create new document:', e);
  }
}

export function setDocumentJson(json: string): void {
  documentJson.value = json;
  pastDocuments.value = [];
  futureDocuments.value = [];
  editorError.value = '';
}

export function dispatchAction(actionJson: string): boolean {
  return dispatchActions([actionJson]);
}

export function dispatchActions(actionJsons: string[]): boolean {
  if (actionJsons.length === 0 || !documentJson.value) return false;
  try {
    const before = documentJson.value;
    let after = before;
    for (const actionJson of actionJsons) {
      after = apply_action(after, actionJson);
    }
    if (after === before) return true;
    pastDocuments.value = [...pastDocuments.value, before].slice(-100);
    futureDocuments.value = [];
    documentJson.value = after;
    editorError.value = '';
    return true;
  } catch (e) {
    console.error('Action failed:', e, actionJsons);
    editorError.value = e instanceof Error ? e.message : String(e);
    return false;
  }
}

export const canUndo = computed(() => pastDocuments.value.length > 0);
export const canRedo = computed(() => futureDocuments.value.length > 0);

export function undoDocument(): void {
  const previous = pastDocuments.value[pastDocuments.value.length - 1];
  if (!previous) return;
  futureDocuments.value = [documentJson.value, ...futureDocuments.value].slice(0, 100);
  pastDocuments.value = pastDocuments.value.slice(0, -1);
  documentJson.value = previous;
  editorError.value = '';
}

export function redoDocument(): void {
  const next = futureDocuments.value[0];
  if (!next) return;
  pastDocuments.value = [...pastDocuments.value, documentJson.value].slice(-100);
  futureDocuments.value = futureDocuments.value.slice(1);
  documentJson.value = next;
  editorError.value = '';
}

export function resetDocument(): void {
  try {
    const fresh = new_document();
    if (documentJson.value) {
      pastDocuments.value = [...pastDocuments.value, documentJson.value].slice(-100);
    }
    futureDocuments.value = [];
    documentJson.value = fresh;
    editorError.value = '';
  } catch (e) {
    editorError.value = e instanceof Error ? e.message : String(e);
  }
}

export function shuffleSeed(): void {
  sampleSeed.value = Math.floor(Math.random() * 0xffffffff);
}

export function regenerateSample(): void {
  if (!seedLocked.value) shuffleSeed();
  sampleRevision.value += 1;
}
