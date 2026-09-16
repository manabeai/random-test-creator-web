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
    <div class="value-input-popup mt:6px r:8px b:1px b:#2a2f3a bg:#151922 p:8px shadow:0|20px|25px|-5px|rgb(0|0|0/0.3),0|8px|10px|-6px|rgb(0|0|0/0.3) ">
      <input
        class="value-literal-input mb:8px w:100% r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
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
      <div class="value-var-options flex flex-wrap gap:6px">
        {filteredVars.map(v => (
          <button
            key={v.name}
            class="value-var-option r:6px b:1px b:#384152 bg:#18202b px:10px py:4px text-left font-size:12px fg:legacy-slate-200 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover"
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
