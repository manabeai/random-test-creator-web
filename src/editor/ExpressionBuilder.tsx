/**
 * Expression builder component for count fields and function operations.
 *
 * Used in two contexts:
 * 1. Count fields in node popup (edge-list count expression)
 * 2. Bound expression modification (constraint bounds)
 */

import type { ExprCandidate } from './editor-state';

// ── Function Operations Popup ──────────────────────────────────────

const FUNCTION_OPS = [
  { id: 'subtract', label: '−' },
  { id: 'add', label: '+' },
  { id: 'multiply', label: '×' },
  { id: 'divide', label: '÷' },
  { id: 'power', label: '^' },
  { id: 'min', label: 'min' },
  { id: 'max', label: 'max' },
];

interface FunctionOpsPanelProps {
  onSelectOp: (op: string) => void;
}

export function FunctionOpsPanel({ onSelectOp }: FunctionOpsPanelProps) {
  return (
    <div class="fn-ops-panel flex flex-wrap gap:6px">
      {FUNCTION_OPS.map(op => (
        <button
          key={op.id}
          class="fn-op-btn r:6px b:1px b:#384152 bg:#18202b px:10px py:4px text-left font-size:12px fg:legacy-slate-200 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover"
          data-testid={`function-op-${op.id}`}
          onClick={() => onSelectOp(op.id)}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}

interface FunctionOperandInputProps {
  onConfirm: (operand: string) => void;
}

export function FunctionOperandInput({ onConfirm }: FunctionOperandInputProps) {
  return (
    <input
      class="fn-operand-input w:96px r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
      data-testid="function-operand-input"
      type="text"
      placeholder="operand"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onConfirm((e.currentTarget as HTMLInputElement).value);
        }
      }}
    />
  );
}

// ── Count Field Expression Builder ─────────────────────────────────

import {
  countExprState,
  selectCountVar,
  setCountExprValue,
  openCountFnSelect,
  selectCountFnOp,
  applyCountFnOperand,
} from './popup-state';

interface CountFieldProps {
  availableVars: ExprCandidate[];
}

export function CountField({ availableVars }: CountFieldProps) {
  const state = countExprState.value;
  const value = getCountExprValue();
  const countVars = availableVars.filter(v => v.value_type === 'number' && v.node_kind === 'scalar');

  return (
    <div class="count-field-container flex flex:1 flex-col gap:6px">
      <div
        class="count-field flex min-h:32px cursor:pointer items-center r:6px b:1px b:#384152 bg:#18202b px:8px py:4px"
        data-testid="count-field"
      >
        {state.step === 'idle' && <span class="count-placeholder font-size:12px fg:legacy-slate-600">select count...</span>}
        {(state.step === 'built' || state.step === 'fn-select' || state.step === 'fn-operand') && (
          <span
            class="expression-element cursor:pointer r:4px px:4px font:mono font-size:13px fg:legacy-cyan-300 legacy-transition bg:#202633:hover"
            data-testid={`expression-element-${state.varName}`}
            onClick={(e) => {
              e.stopPropagation();
              if (state.step === 'built') {
                openCountFnSelect(state.varName, state.nodeId, state.displayValue);
              }
            }}
          >
            {state.displayValue}
          </span>
        )}
      </div>
      <div class="length-var-options flex flex-wrap gap:6px">
        {countVars.map(v => (
          <button
            key={v.name}
            type="button"
            class={`length-var-option r:6px b:1px b:#384152 bg:#18202b px:10px py:4px text-left font-size:12px fg:legacy-slate-200 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover ${value === v.name ? 'active selected b:legacy-cyan-300 bg:legacy-cyan-300 font-weight:600 fg:#0f1115' : ''}`}
            data-testid={`count-var-option-${v.name}`}
            onClick={() => selectCountVar(v)}
          >
            {v.name}
          </button>
        ))}
      </div>
      <input
        class="length-expression-input r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
        data-testid="count-expression-input"
        type="text"
        placeholder="count expression"
        value={value}
        onInput={(e) => setCountExprValue((e.currentTarget as HTMLInputElement).value)}
      />

      {state.step === 'fn-select' && (
        <FunctionOpsPanel onSelectOp={selectCountFnOp} />
      )}
      {state.step === 'fn-operand' && (
        <FunctionOperandInput onConfirm={applyCountFnOperand} />
      )}
    </div>
  );
}

/**
 * Get the resolved count expression value for action building.
 */
export function getCountExprValue(): string {
  const state = countExprState.value;
  if (state.step === 'built' || state.step === 'fn-select' || state.step === 'fn-operand') {
    return state.displayValue;
  }
  if (state.step === 'idle') return state.value;
  return '';
}
