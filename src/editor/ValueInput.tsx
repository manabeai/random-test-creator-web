/**
 * ValueInput: popup for entering constraint bound values.
 *
 * Shows a literal input field and variable options.
 */
import { projection } from './editor-state';
import {
  valueInputState,
  closeValueInput,
  constraintLower,
  constraintUpper,
  sumBoundUpper,
  type ValueInputTarget,
} from './popup-state';

interface ValueInputProps {
  target: ValueInputTarget;
  excludeNodeId?: string;  // exclude self variable
}

export function ValueInput({ target, excludeNodeId }: ValueInputProps) {
  const proj = projection.value;

  // Filter: numeric scalar variables only, excluding self.
  const filteredVars = proj.available_vars.filter(v => {
    if (excludeNodeId && v.node_id === excludeNodeId) return false;
    return v.value_type === 'number' && v.node_kind === 'scalar';
  });

  const handleLiteralConfirm = (value: string) => {
    setTargetValue(target, value);
    closeValueInput();
  };

  const handleVarSelect = (varName: string) => {
    setTargetValue(target, varName);
    closeValueInput();
  };

  return (
    <div class="value-input-popup">
      <input
        class="value-literal-input"
        data-testid="constraint-value-literal"
        type="text"
        placeholder="integer"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleLiteralConfirm((e.currentTarget as HTMLInputElement).value);
          }
        }}
        onBlur={(e) => {
          const value = (e.currentTarget as HTMLInputElement).value.trim();
          if (value) {
            handleLiteralConfirm(value);
          }
        }}
      />
      <div class="value-var-options">
        {filteredVars.map(v => (
          <button
            key={v.name}
            class="value-var-option"
            data-testid={`constraint-var-option-${v.name}`}
            onClick={() => handleVarSelect(v.name)}
          >
            {v.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function setTargetValue(target: ValueInputTarget, value: string): void {
  switch (target) {
    case 'lower':
      constraintLower.value = value;
      break;
    case 'upper':
      constraintUpper.value = value;
      break;
    case 'sumbound-upper':
      sumBoundUpper.value = value;
      break;
  }
}

/**
 * Check if value input is open for the given target.
 */
export function isValueInputOpen(target: ValueInputTarget): boolean {
  const state = valueInputState.value;
  return state.step === 'open' && state.target === target;
}
