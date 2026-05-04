/**
 * Constraint pane: displays draft and completed constraints.
 *
 * Supports:
 * - Draft constraint editing (Range, CharSet)
 * - Property shortcut
 * - SumBound shortcut
 * - Constraint deletion and re-editing
 */
import { signal } from '@preact/signals';
import { projection, dispatchAction, type CharSetSpec } from './editor-state';
import {
  constraintEditState,
  openConstraintEditor,
  closeConstraintEditor,
  openSumBound,
  sumBoundVar,
  sumBoundUpper,
  openValueInput,
  boundExprState,
  openBoundFnSelect,
  selectBoundFnOp,
  applyBoundFnOperand,
  charSetSelection,
  customCharSetChars,
} from './popup-state';
import {
  buildAddConstraintRange,
  buildAddConstraintStringLength,
  buildAddConstraintProperty,
  buildAddConstraintSumBound,
  buildAddConstraintCharSet,
  buildRemoveConstraint,
} from './action-builder';
import { ConstraintEditor } from './ConstraintEditor';
import { ValueInput, isValueInputOpen } from './ValueInput';
import { FunctionOpsPanel, FunctionOperandInput } from './ExpressionBuilder';
import { constraintFolded, toggleConstraintFold } from './fold-state';

const showPropertyOptions = signal(false);

export function ConstraintPane() {
  const proj = projection.value;
  const editState = constraintEditState.value;
  const folded = constraintFolded.value;

  const handleRangeConfirm = (lower: string, upper: string) => {
    if (editState.step === 'editing') {
      if (editState.constraintId) {
        dispatchAction(buildRemoveConstraint(editState.constraintId));
      }
      const actionJson = editState.template === 'StringLength'
        ? buildAddConstraintStringLength(editState.targetId, lower, upper)
        : buildAddConstraintRange(editState.targetId, lower, upper);
      dispatchAction(actionJson);
      closeConstraintEditor();
    }
  };

  const handlePropertySelect = (tag: string) => {
    // Property applies to the root structure node
    const targetId = proj.nodes[0]?.id ?? '0';
    const actionJson = buildAddConstraintProperty(targetId, tag);
    dispatchAction(actionJson);
    showPropertyOptions.value = false;
  };

  const handleSumBoundConfirm = () => {
    if (sumBoundVar.value && sumBoundUpper.value) {
      const varCandidate = proj.available_vars.find(v => v.name === sumBoundVar.value);
      const targetId = varCandidate?.node_id ?? '0';
      const actionJson = buildAddConstraintSumBound(targetId, sumBoundVar.value, sumBoundUpper.value);
      dispatchAction(actionJson);
      closeConstraintEditor();
    }
  };

  const handleCharSetConfirm = () => {
    if (editState.step === 'charset' && charSetSelection.value) {
      if (editState.constraintId) {
        dispatchAction(buildRemoveConstraint(editState.constraintId));
      }
      let charset: CharSetSpec;
      if (charSetSelection.value === 'Custom') {
        // Build custom charset from individual chars
        const chars = customCharSetChars.value.filter(c => c.length > 0);
        if (chars.length === 0) return;
        charset = { kind: 'Custom', chars };
      } else {
        charset = { kind: charSetSelection.value as CharSetSpec['kind'] } as CharSetSpec;
      }
      const actionJson = buildAddConstraintCharSet(editState.targetId, charset);
      dispatchAction(actionJson);
      closeConstraintEditor();
    }
  };

  return (
    <div class={`pane ${folded ? 'folded' : ''}`} data-testid="constraint-pane">
      <div class="pane-header">
        <span class="pane-title">Constraints</span>
        <div class="pane-header-controls">
          <div class="constraint-shortcuts">
            <button
              class="shortcut-btn"
              data-testid="property-shortcut"
              onClick={() => {
                closeConstraintEditor();
                showPropertyOptions.value = !showPropertyOptions.value;
              }}
            >
              Property
            </button>
            <button
              class="shortcut-btn"
              data-testid="sumbound-shortcut"
              onClick={() => {
                showPropertyOptions.value = false;
                openSumBound();
              }}
            >
              ΣBound
            </button>
          </div>
          <button class="fold-toggle" onClick={toggleConstraintFold} aria-label={folded ? 'Expand' : 'Collapse'}>
            {folded ? '▶' : '▼'}
          </button>
        </div>
      </div>
      <div class="pane-content-scroll">
        {/* Property options (signal-driven visibility) */}
        {showPropertyOptions.value && (
          <PropertyOptions onSelect={handlePropertySelect} />
        )}

        {/* Constraint rows keep projection order, regardless of draft/completed status. */}
        {proj.constraints.items.map(item => (
          <div
            key={`constraint-item-${item.index}`}
            class={`constraint-item ${item.status} ${editState.step !== 'closed' && editState.step !== 'sumbound' && editState.targetId === item.target_id ? 'active' : ''}`}
            data-testid={`constraint-item-${item.index}`}
            data-constraint-status={item.status}
            onClick={() => {
              if (!item.edit) return;
              showPropertyOptions.value = false;
              openConstraintEditor(item.target_id, item.target_name, item.edit.kind, item.edit);
            }}
          >
            <span class="constraint-icon">{item.status === 'draft' ? '○' : '●'}</span>
            <span
              class="constraint-display"
              data-testid={
                item.status === 'draft' && item.draft_index !== undefined
                  ? `draft-constraint-${item.draft_index}`
                  : item.status === 'completed' && item.completed_index !== undefined
                    ? `completed-constraint-${item.completed_index}`
                    : undefined
              }
            >
              {item.display}
            </span>
            {item.status === 'completed' && item.constraint_id && (
              <button
                class="constraint-delete-btn"
                data-testid={`delete-constraint-${item.completed_index ?? item.index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  const actionJson = buildRemoveConstraint(item.constraint_id!);
                  dispatchAction(actionJson);
                }}
                title="Delete constraint"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Constraint Editor */}
        {editState.step === 'editing' && (
          <ConstraintEditor
            targetId={editState.targetId}
            targetName={editState.targetName}
            onConfirm={handleRangeConfirm}
          />
        )}

        {/* CharSet Editor: select charset then confirm */}
        {editState.step === 'charset' && (
          <CharSetEditor onConfirm={handleCharSetConfirm} />
        )}

        {/* SumBound Editor */}
        {editState.step === 'sumbound' && (
          <SumBoundEditor
            onConfirm={handleSumBoundConfirm}
          />
        )}
      </div>
    </div>
  );
}

function PropertyOptions({ onSelect }: { onSelect: (tag: string) => void }) {
  return (
    <div class="property-options visible">
      <button
        class="property-option"
        data-testid="property-option-tree"
        onClick={() => onSelect('Tree')}
      >
        Tree
      </button>
      <button
        class="property-option"
        data-testid="property-option-connected"
        onClick={() => onSelect('Connected')}
      >
        Connected
      </button>
      <button
        class="property-option"
        data-testid="property-option-simple"
        onClick={() => onSelect('Simple')}
      >
        Simple
      </button>
    </div>
  );
}

function CharSetEditor({ onConfirm }: { onConfirm: () => void }) {
  const selected = charSetSelection.value;
  const customChars = customCharSetChars.value;

  const addCustomChar = () => {
    customCharSetChars.value = [...customChars, ''];
  };

  const updateCustomChar = (index: number, value: string) => {
    const newChars = [...customChars];
    newChars[index] = value.slice(0, 1); // Only keep first character
    customCharSetChars.value = newChars;
  };

  const removeCustomChar = (index: number) => {
    if (customChars.length > 1) {
      const newChars = customChars.filter((_, i) => i !== index);
      customCharSetChars.value = newChars;
    }
  };

  const hasValidCustomChars = customChars.some(c => c.length > 0);

  return (
    <div class="charset-options">
      <div class="constraint-editor-label">Select Character Set</div>
      <div class="charset-presets">
        <button
          class={`charset-option ${selected === 'LowerAlpha' ? 'active' : ''}`}
          data-testid="charset-option-lowercase"
          onClick={() => { charSetSelection.value = 'LowerAlpha'; }}
        >
          a-z (lowercase)
        </button>
        <button
          class={`charset-option ${selected === 'UpperAlpha' ? 'active' : ''}`}
          data-testid="charset-option-uppercase"
          onClick={() => { charSetSelection.value = 'UpperAlpha'; }}
        >
          A-Z (uppercase)
        </button>
        <button
          class={`charset-option ${selected === 'Digit' ? 'active' : ''}`}
          data-testid="charset-option-digit"
          onClick={() => { charSetSelection.value = 'Digit'; }}
        >
          0-9 (digit)
        </button>
        <button
          class={`charset-option ${selected === 'Alpha' ? 'active' : ''}`}
          data-testid="charset-option-alpha"
          onClick={() => { charSetSelection.value = 'Alpha'; }}
        >
          a-zA-Z (letters)
        </button>
        <button
          class={`charset-option ${selected === 'AlphaNumeric' ? 'active' : ''}`}
          data-testid="charset-option-alphanumeric"
          onClick={() => { charSetSelection.value = 'AlphaNumeric'; }}
        >
          a-zA-Z0-9
        </button>
        <button
          class={`charset-option ${selected === 'Custom' ? 'active' : ''}`}
          data-testid="charset-option-custom"
          onClick={() => { charSetSelection.value = 'Custom'; }}
        >
          Custom
        </button>
      </div>

      {selected === 'Custom' && (
        <div class="charset-custom-editor">
          <div class="charset-custom-label">Enter characters:</div>
          <div class="charset-custom-inputs">
            {customChars.map((char, index) => (
              <div key={index} class="charset-char-input-group">
                <input
                  type="text"
                  class="charset-char-input"
                  data-testid={`charset-char-input-${index}`}
                  value={char}
                  maxLength={1}
                  placeholder="?"
                  onInput={(e) => updateCustomChar(index, (e.target as HTMLInputElement).value)}
                />
                {customChars.length > 1 && (
                  <button
                    class="charset-char-remove"
                    onClick={() => removeCustomChar(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              class="charset-add-btn"
              data-testid="charset-add-char"
              onClick={addCustomChar}
            >
              +
            </button>
          </div>
        </div>
      )}

      <button
        class="constraint-confirm-btn"
        data-testid="constraint-confirm"
        onClick={onConfirm}
        disabled={selected === 'Custom' && !hasValidCustomChars}
      >
        Confirm CharSet
      </button>
    </div>
  );
}

function SumBoundEditor({ onConfirm }: { onConfirm: () => void }) {
  const proj = projection.value;
  const upper = sumBoundUpper.value;
  const bExprState = boundExprState.value;

  return (
    <div class="sumbound-editor">
      <div class="constraint-editor-label">SumBound</div>
      <div class="sumbound-row">
        <label>Variable</label>
        <select
          data-testid="sumbound-var-select"
          value={sumBoundVar.value}
          onChange={(e) => { sumBoundVar.value = (e.target as HTMLSelectElement).value; }}
        >
          <option value="">-- select --</option>
          {proj.available_vars.map(v => (
            <option key={v.name} value={v.name}>{v.name}</option>
          ))}
        </select>
      </div>
      <div class="sumbound-row">
        <label>Upper Bound</label>
        <div
          class="bound-input"
          data-testid="sumbound-upper-input"
          onClick={() => {
            if (!upper) openValueInput('sumbound-upper');
          }}
        >
          {upper ? (
            <span
              class="bound-expression"
              data-testid="sumbound-upper-expression"
              onClick={(e) => {
                e.stopPropagation();
                openBoundFnSelect('sumbound-upper');
              }}
            >
              {upper}
            </span>
          ) : (
            <span class="bound-placeholder">upper...</span>
          )}
        </div>
        {isValueInputOpen('sumbound-upper') && <ValueInput target="sumbound-upper" />}
      </div>

      {bExprState.step === 'fn-select' && bExprState.target === 'sumbound-upper' && (
        <FunctionOpsPanel onSelectOp={selectBoundFnOp} />
      )}
      {bExprState.step === 'fn-operand' && bExprState.target === 'sumbound-upper' && (
        <FunctionOperandInput onConfirm={applyBoundFnOperand} />
      )}

      <button
        class="constraint-confirm-btn"
        data-testid="constraint-confirm"
        onClick={onConfirm}
      >
        Confirm SumBound
      </button>
    </div>
  );
}
