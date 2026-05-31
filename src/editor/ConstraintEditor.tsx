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
  closeConstraintEditor,
  type ValueInputTarget,
} from './popup-state';
import { ValueInput, isValueInputOpen } from './ValueInput';
import { FunctionOpsPanel, FunctionOperandInput } from './ExpressionBuilder';

interface ConstraintEditorProps {
  targetId: string;
  targetName: string;
  onConfirm: (lower: string, upper: string) => void;
  onMouseEnter?: () => void;
}

export function ConstraintEditor({ targetId, targetName, onConfirm, onMouseEnter }: ConstraintEditorProps) {
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

  const commitIfChanged = () => {
    if (!bothFilled) {
      closeConstraintEditor();
      return;
    }
    if (lower === initialLower.current && upper === initialUpper.current) {
      closeConstraintEditor();
      return;
    }
    onConfirm(lower, upper);
  };

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
    <div class="constraint-editor" onMouseEnter={onMouseEnter} onMouseLeave={commitIfChanged}>
      <div class="constraint-editor-label">
        Constraint for <strong>{targetName}</strong>
      </div>

      <div class="constraint-bound-row">
        <BoundArea label="Lower" target="lower" value={lower} excludeNodeId={targetId} />
        <span class="constraint-sep">≤ {targetName} ≤</span>
        <BoundArea label="Upper" target="upper" value={upper} excludeNodeId={targetId} />
      </div>

      <BoundExpressionUI />
    </div>
  );
}

function BoundArea({ label, target, value, excludeNodeId }: { label: string; target: ValueInputTarget; value: string; excludeNodeId?: string }) {
  const isOpen = isValueInputOpen(target);

  return (
    <div class="bound-area">
      <div
        class="bound-input"
        data-testid={`constraint-${target}-input`}
        onClick={() => {
          if (!value) openValueInput(target);
        }}
      >
        {value ? (
          <span
            class="bound-expression"
            data-testid={`constraint-${target}-expression`}
            onClick={(e) => {
              e.stopPropagation();
              openBoundFnSelect(target);
            }}
          >
            {value}
          </span>
        ) : (
          <span class="bound-placeholder">{label}...</span>
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
    <div class="bound-expr-ui">
      {state.step === 'fn-select' && (
        <FunctionOpsPanel onSelectOp={selectBoundFnOp} />
      )}
      {state.step === 'fn-operand' && (
        <FunctionOperandInput onConfirm={applyBoundFnOperand} />
      )}
    </div>
  );
}
