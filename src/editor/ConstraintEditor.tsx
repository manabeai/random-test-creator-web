/**
 * Constraint editor: editing a draft Range constraint (lower/upper bounds).
 *
 * Supports bound editing with ValueInput popup and function application.
 */
import { useEffect, useRef } from 'preact/hooks';
import {
  constraintLower,
  constraintUpper,
  openValueInput,
  valueInputState,
  boundExprState,
  openBoundFnSelect,
  selectBoundFnOp,
  applyBoundFnOperand,
  type ValueInputTarget,
} from './popup-state';
import { ValueInput, isValueInputOpen } from './ValueInput';
import { FunctionOpsPanel, FunctionOperandInput } from './ExpressionBuilder';

interface ConstraintEditorProps {
  targetId: string;
  targetName: string;
  onConfirm: (lower: string, upper: string) => void;
}

export function ConstraintEditor({ targetId, targetName, onConfirm }: ConstraintEditorProps) {
  const lower = constraintLower.value;
  const upper = constraintUpper.value;
  const initialLower = useRef(lower);
  const initialUpper = useRef(upper);

  // Auto-open upper input after lower is filled (with delay to not interfere with E2E tests)
  useEffect(() => {
    if (lower && !upper && valueInputState.value.step === 'closed') {
      const timer = setTimeout(() => {
        if (constraintLower.value && !constraintUpper.value && valueInputState.value.step === 'closed') {
          openValueInput('upper');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [lower, upper]);

  const bothFilled = lower && upper;

  useEffect(() => {
    if (!bothFilled) return;
    if (lower === initialLower.current && upper === initialUpper.current) return;
    if (boundExprState.value.step !== 'idle') return;
    const timer = setTimeout(() => {
      if (boundExprState.value.step === 'idle') {
        onConfirm(constraintLower.value, constraintUpper.value);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [bothFilled, lower, upper, onConfirm]);

  return (
    <div class="constraint-editor r:8px b:1px b:#2a2f3a bg:#151922 p:12px shadow:0|20px|25px|-5px|rgb(0|0|0/0.25),0|8px|10px|-6px|rgb(0|0|0/0.25) ">
      <div class="constraint-editor-label mb:8px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">
        Constraint for <strong>{targetName}</strong>
      </div>

      <div class="constraint-bound-row flex flex-wrap items-center gap:8px">
        <BoundArea label="Lower" target="lower" value={lower} excludeNodeId={targetId} />
        <span class="constraint-sep white-space:nowrap font-size:13px fg:legacy-slate-500">≤ {targetName} ≤</span>
        <BoundArea label="Upper" target="upper" value={upper} excludeNodeId={targetId} />
      </div>

      <BoundExpressionUI />
    </div>
  );
}

function BoundArea({ label, target, value, excludeNodeId }: { label: string; target: ValueInputTarget; value: string; excludeNodeId?: string }) {
  const isOpen = isValueInputOpen(target);

  return (
    <div class="bound-area rel min-w:80px flex:1">
      <div
        class="bound-input flex min-h:32px cursor:pointer items-center r:6px b:1px b:#384152 bg:#18202b px:8px py:4px legacy-transition b:legacy-cyan-300/0.7:hover"
        data-testid={`constraint-${target}-input`}
        onClick={() => {
          if (!value) openValueInput(target);
        }}
      >
        {value ? (
          <span
            class="bound-expression font:mono font-size:13px fg:legacy-cyan-300"
            data-testid={`constraint-${target}-expression`}
            onClick={(e) => {
              e.stopPropagation();
              openBoundFnSelect(target);
            }}
          >
            {value}
          </span>
        ) : (
          <span class="bound-placeholder font-size:12px fg:legacy-slate-600">{label}...</span>
        )}
      </div>
      {isOpen && <ValueInput target={target} excludeNodeId={excludeNodeId} />}
    </div>
  );
}

function BoundExpressionUI() {
  const state = boundExprState.value;
  if (state.step === 'idle') return null;

  return (
    <div class="bound-expr-ui mt:8px">
      {state.step === 'fn-select' && (
        <FunctionOpsPanel onSelectOp={selectBoundFnOp} />
      )}
      {state.step === 'fn-operand' && (
        <FunctionOperandInput onConfirm={applyBoundFnOperand} />
      )}
    </div>
  );
}
