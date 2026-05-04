/**
 * Popup state management for the editor.
 *
 * Manages node creation wizards, constraint editing, and expression building.
 */
import { signal } from '@preact/signals';
import type { Hotspot, ExprCandidate, ProjectedNode, ConstraintEditProjection } from './editor-state';

// ── Node Popup State ───────────────────────────────────────────────

export type PopupPhase =
  | { step: 'closed' }
  | { step: 'candidates'; hotspot: Hotspot }
  | { step: 'fields'; hotspot: Hotspot; candidate: string };

export const popupState = signal<PopupPhase>({ step: 'closed' });

// ── Node Edit State ────────────────────────────────────────────────

export type NodeEditPhase =
  | { step: 'closed' }
  | { step: 'editing'; nodeId: string; currentLabel: string };

export const nodeEditState = signal<NodeEditPhase>({ step: 'closed' });
export const nodeEditName = signal('');
export const nodeEditKind = signal<'scalar' | 'array'>('scalar');
export const nodeEditType = signal('number');
export const nodeEditLength = signal('');

export function openNodeEdit(node: ProjectedNode): void {
  if (!node.edit) return;
  nodeEditState.value = { step: 'editing', nodeId: node.id, currentLabel: node.label };
  nodeEditName.value = node.edit.name;
  nodeEditKind.value = node.edit.kind;
  nodeEditType.value = node.edit.value_type;
  nodeEditLength.value = node.edit.length_expr ?? '';
}

export function closeNodeEdit(): void {
  nodeEditState.value = { step: 'closed' };
}

// Popup field values
export const popupName = signal('');
export const popupType = signal('number');
export const popupLengthVar = signal('');
export const popupLengthVar2 = signal(''); // second length (grid cols)
export const popupWeightName = signal('');
export const popupVariantTag = signal('');

export function openPopup(hotspot: Hotspot): void {
  if (hotspot.direction === 'variant') {
    popupState.value = { step: 'fields', hotspot, candidate: 'variant' };
  } else {
    popupState.value = { step: 'candidates', hotspot };
  }
  popupName.value = '';
  popupType.value = 'number';
  popupLengthVar.value = '';
  popupLengthVar2.value = '';
  popupWeightName.value = '';
  popupVariantTag.value = '';
  countExprState.value = { step: 'idle', value: '' };
}

/** Candidate hovered in the wizard (step 1 preview). */
export const hoveredCandidate = signal<string | null>(null);

export function selectCandidate(candidate: string): void {
  const cur = popupState.value;
  if (cur.step === 'candidates' || cur.step === 'fields') {
    popupState.value = { step: 'fields', hotspot: cur.hotspot, candidate };
    // Reset field values when switching candidates
    popupName.value = '';
    popupType.value = 'number';
    popupLengthVar.value = '';
    popupLengthVar2.value = '';
    popupWeightName.value = '';
    countExprState.value = { step: 'idle', value: '' };
  }
}

export function closePopup(): void {
  popupState.value = { step: 'closed' };
}

// ── Count Expression Builder State ─────────────────────────────────

export type CountExprPhase =
  | { step: 'idle'; value: string }
  | { step: 'var-list' }
  | { step: 'built'; varName: string; nodeId: string; displayValue: string }
  | { step: 'fn-select'; varName: string; nodeId: string; displayValue: string }
  | { step: 'fn-operand'; varName: string; nodeId: string; displayValue: string; op: string };

export const countExprState = signal<CountExprPhase>({ step: 'idle', value: '' });

export function openCountVarList(): void {
  countExprState.value = { step: 'var-list' };
}

export function selectCountVar(v: ExprCandidate): void {
  countExprState.value = { step: 'built', varName: v.name, nodeId: v.node_id, displayValue: v.name };
}

export function setCountExprValue(value: string): void {
  countExprState.value = { step: 'idle', value };
}

export function openCountFnSelect(varName: string, nodeId: string, displayValue: string): void {
  countExprState.value = { step: 'fn-select', varName, nodeId, displayValue };
}

export function selectCountFnOp(op: string): void {
  const cur = countExprState.value;
  if (cur.step !== 'fn-select') return;
  countExprState.value = { step: 'fn-operand', varName: cur.varName, nodeId: cur.nodeId, displayValue: cur.displayValue, op };
}

export function applyCountFnOperand(operand: string): void {
  const cur = countExprState.value;
  if (cur.step !== 'fn-operand') return;
  const expr = evaluateExpression(cur.displayValue, cur.op, operand);
  countExprState.value = { step: 'built', varName: cur.varName, nodeId: cur.nodeId, displayValue: expr };
}

// ── Constraint Editing State ───────────────────────────────────────

export type ConstraintEditPhase =
  | { step: 'closed' }
  | { step: 'editing'; targetId: string; targetName: string; template: string; constraintId?: string }
  | { step: 'sumbound' }
  | { step: 'charset'; targetId: string; targetName: string; constraintId?: string };

export const constraintEditState = signal<ConstraintEditPhase>({ step: 'closed' });

export const constraintLower = signal('');
export const constraintUpper = signal('');
export const sumBoundVar = signal('');
export const sumBoundUpper = signal('');

// ── Value Input State (for constraint bounds) ──────────────────────

export type ValueInputTarget = 'lower' | 'upper' | 'sumbound-upper';

export type ValueInputPhase =
  | { step: 'closed' }
  | { step: 'open'; target: ValueInputTarget };

export const valueInputState = signal<ValueInputPhase>({ step: 'closed' });

export function openValueInput(target: ValueInputTarget): void {
  valueInputState.value = { step: 'open', target };
}

export function closeValueInput(): void {
  valueInputState.value = { step: 'closed' };
}

// ── Bound Expression State (for applying functions to bound values) ──

export type BoundExprPhase =
  | { step: 'idle' }
  | { step: 'fn-select'; target: ValueInputTarget }
  | { step: 'fn-operand'; target: ValueInputTarget; op: string };

export const boundExprState = signal<BoundExprPhase>({ step: 'idle' });

export function openBoundFnSelect(target: ValueInputTarget): void {
  boundExprState.value = { step: 'fn-select', target };
}

export function selectBoundFnOp(op: string): void {
  const cur = boundExprState.value;
  if (cur.step !== 'fn-select') return;
  boundExprState.value = { step: 'fn-operand', target: cur.target, op };
}

export function applyBoundFnOperand(operand: string): void {
  const cur = boundExprState.value;
  if (cur.step !== 'fn-operand') return;

  const target = cur.target;
  if (target === 'lower') {
    constraintLower.value = evaluateExpression(constraintLower.value, cur.op, operand);
  } else if (target === 'upper') {
    constraintUpper.value = evaluateExpression(constraintUpper.value, cur.op, operand);
  } else if (target === 'sumbound-upper') {
    sumBoundUpper.value = evaluateExpression(sumBoundUpper.value, cur.op, operand);
  }
  boundExprState.value = { step: 'idle' };
}

export const charSetSelection = signal('');
export const customCharSetChars = signal<string[]>(['']);

export function openConstraintEditor(
  targetId: string,
  targetName: string,
  template: string,
  edit?: ConstraintEditProjection,
): void {
  if (template === 'CharSet') {
    constraintEditState.value = { step: 'charset', targetId, targetName, constraintId: edit?.constraint_id };
    if (edit?.kind === 'CharSet') {
      charSetSelection.value = edit.charset.kind;
      customCharSetChars.value = edit.charset.kind === 'Custom' ? edit.charset.chars : [''];
    } else {
      charSetSelection.value = '';
      customCharSetChars.value = [''];
    }
  } else {
    constraintEditState.value = { step: 'editing', targetId, targetName, template, constraintId: edit?.constraint_id };
  }
  constraintLower.value = edit?.kind === 'Range'
    ? edit.lower
    : edit?.kind === 'StringLength'
      ? edit.min
      : '';
  constraintUpper.value = edit?.kind === 'Range'
    ? edit.upper
    : edit?.kind === 'StringLength'
      ? edit.max
      : '';
  boundExprState.value = { step: 'idle' };
  valueInputState.value = template === 'CharSet' || constraintLower.value
    ? { step: 'closed' }
    : { step: 'open', target: 'lower' };
}

export function openSumBound(): void {
  constraintEditState.value = { step: 'sumbound' };
  sumBoundVar.value = '';
  sumBoundUpper.value = '';
  boundExprState.value = { step: 'idle' };
  valueInputState.value = { step: 'closed' };
}

export function closeConstraintEditor(): void {
  constraintEditState.value = { step: 'closed' };
  boundExprState.value = { step: 'idle' };
  valueInputState.value = { step: 'closed' };
}

// ── Expression Evaluation ──────────────────────────────────────────

export function evaluateExpression(base: string, op: string, operand: string): string {
  const baseNum = Number(base);
  const opNum = Number(operand);
  const bothNumeric = !isNaN(baseNum) && !isNaN(opNum) && base.trim() !== '' && operand.trim() !== '';

  if (bothNumeric) {
    switch (op) {
      case 'add': return String(baseNum + opNum);
      case 'subtract': return String(baseNum - opNum);
      case 'multiply': return String(baseNum * opNum);
      case 'divide': return opNum !== 0 ? String(Math.floor(baseNum / opNum)) : base;
      case 'power': return String(Math.pow(baseNum, opNum));
      case 'min': return String(Math.min(baseNum, opNum));
      case 'max': return String(Math.max(baseNum, opNum));
    }
  }

  // symbolic
  const opSymbol: Record<string, string> = {
    add: '+', subtract: '-', multiply: '*', divide: '/',
    power: '^', min: 'min', max: 'max',
  };
  const sym = opSymbol[op] ?? op;
  if (sym === 'min' || sym === 'max') {
    return `${sym}(${base},${operand})`;
  }
  return `${base}${sym}${operand}`;
}
