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
    <div class="fn-ops-panel flex flex-wrap gap-1.5">
      {FUNCTION_OPS.map(op => (
        <button
          key={op.id}
          class="fn-op-btn rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
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
      class="fn-operand-input w-24 rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 font-mono text-[13px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
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
    <div class="count-field-container flex flex-1 flex-col gap-1.5">
      <div
        class="count-field flex min-h-8 cursor-pointer items-center rounded-md border border-[#384152] bg-[#18202b] px-2 py-1"
        data-testid="count-field"
      >
        {state.step === 'idle' && <span class="count-placeholder text-[12px] text-slate-600">select count...</span>}
        {(state.step === 'built' || state.step === 'fn-select' || state.step === 'fn-operand') && (
          <span
            class="expression-element cursor-pointer rounded px-1 font-mono text-[13px] text-cyan-300 transition hover:bg-[#202633]"
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
      <div class="length-var-options flex flex-wrap gap-1.5">
        {countVars.map(v => (
          <button
            key={v.name}
            type="button"
            class={`length-var-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 ${value === v.name ? 'active selected border-cyan-300 bg-cyan-300 font-semibold text-[#0f1115]' : ''}`}
            data-testid={`count-var-option-${v.name}`}
            onClick={() => selectCountVar(v)}
          >
            {v.name}
          </button>
        ))}
      </div>
      <input
        class="length-expression-input rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 font-mono text-[13px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
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
