/**
 * Constraint pane: displays draft and completed constraints.
 *
 * Supports:
 * - Draft constraint editing (Range, CharSet)
 * - SumBound shortcut
 * - Constraint deletion and re-editing
 */
import { useEffect, useRef } from 'preact/hooks';
import { projection, dispatchAction, type CharSetSpec } from './editor-state';
import {
  constraintEditState,
  openConstraintEditor,
  closeConstraintEditor,
  openSumBound,
  constraintLower,
  constraintUpper,
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
  buildConstraintActionsFromDraft,
  buildRemoveConstraint,
} from './action-builder';
import { ConstraintEditor } from './ConstraintEditor';
import { ValueInput, isValueInputOpen } from './ValueInput';
import { FunctionOpsPanel, FunctionOperandInput } from './ExpressionBuilder';
import { constraintFolded, toggleConstraintFold } from './fold-state';


export function ConstraintPane() {
  const proj = projection.value;
  const editState = constraintEditState.value;
  const folded = constraintFolded.value;
  const paneRef = useRef<HTMLDivElement>(null);
  const hoverDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRangeConfirm = (lower: string, upper: string) => {
    const current = constraintEditState.value;
    if (current.step === 'editing') {
      const actions = buildConstraintActionsFromDraft({
        targetId: current.targetId,
        template: current.template === 'StringLength' ? 'StringLength' : 'Range',
        existingConstraintId: current.constraintId,
        lower,
        upper,
      });
      actions.forEach(dispatchAction);
      closeConstraintEditor();
    }
  };

  const handleSumBoundConfirm = () => {
    if (sumBoundVar.value && sumBoundUpper.value) {
      const varCandidate = proj.available_vars.find(v => v.name === sumBoundVar.value);
      const targetId = varCandidate?.node_id ?? '0';
      buildConstraintActionsFromDraft({
        targetId,
        template: 'SumBound',
        overVar: sumBoundVar.value,
        upper: sumBoundUpper.value,
      }).forEach(dispatchAction);
      closeConstraintEditor();
    }
  };

  const handleCharSetConfirm = () => {
    const current = constraintEditState.value;
    if (current.step === 'charset' && charSetSelection.value) {
      let charset: CharSetSpec;
      if (charSetSelection.value === 'Custom') {
        // Build custom charset from individual chars
        const chars = customCharSetChars.value.filter(c => c.length > 0);
        if (chars.length === 0) return;
        charset = { kind: 'Custom', chars };
      } else {
        charset = { kind: charSetSelection.value as CharSetSpec['kind'] } as CharSetSpec;
      }
      buildConstraintActionsFromDraft({
        targetId: current.targetId,
        template: 'CharSet',
        existingConstraintId: current.constraintId,
        charset,
      }).forEach(dispatchAction);
      closeConstraintEditor();
    }
  };

  const commitOpenEditor = () => {
    const current = constraintEditState.value;
    if (current.step === 'editing' && constraintLower.value && constraintUpper.value) {
      handleRangeConfirm(constraintLower.value, constraintUpper.value);
      return;
    }
    if (current.step === 'charset' && charSetSelection.value) {
      handleCharSetConfirm();
      return;
    }
    if (current.step === 'sumbound' && sumBoundVar.value && sumBoundUpper.value) {
      handleSumBoundConfirm();
    }
  };

  const dismissEditor = () => {
    commitOpenEditor();
    closeConstraintEditor();
  };

  const clearHoverDismissTimer = () => {
    if (hoverDismissTimerRef.current) {
      clearTimeout(hoverDismissTimerRef.current);
      hoverDismissTimerRef.current = null;
    }
  };

  const scheduleHoverDismiss = () => {
    clearHoverDismissTimer();
    hoverDismissTimerRef.current = setTimeout(() => {
      dismissEditor();
      hoverDismissTimerRef.current = null;
    }, 400);
  };

  useEffect(() => () => clearHoverDismissTimer(), []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const pane = paneRef.current;
      if (!pane || pane.contains(event.target as Node)) return;
      dismissEditor();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  });

  return (
    <div
      ref={paneRef}
      class={`pane flex min-w:0 flex-col overflow:hidden bg:#0f1115 ${folded ? 'folded' : ''} flex:none@<768px overflow:visible@<768px`}
      data-testid="constraint-pane"
      onMouseLeave={dismissEditor}
    >
      <div class="pane-header flex min-h:44px items-center justify-between bb:1px b:#2a2f3a bg:#151922 px:12px">
        <span class="pane-title font-size:11px font-weight:600 uppercase letter-spacing:0.16em fg:legacy-slate-400">Constraints</span>
        <div class="pane-header-controls flex items-center gap:8px">
          <div class="constraint-shortcuts flex gap:6px">
            <button
              class="shortcut-btn r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover"
              data-testid="sumbound-shortcut"
              onClick={() => {
                openSumBound();
              }}
            >
              ΣBound
            </button>
          </div>
          <button class="fold-toggle hide r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover inline-flex@<768px" onClick={toggleConstraintFold} aria-label={folded ? 'Expand' : 'Collapse'}>
            {folded ? '▶' : '▼'}
          </button>
        </div>
      </div>
      <div class={`pane-content-scroll flex:1 overflow:auto p:12px max-h:2000px@<768px overflow:hidden@<768px transition-property:max-height,opacity@<768px transition-duration:300ms@<768px ${folded ? 'max-h:0px@<768px py:0px@<768px opacity:0@<768px' : 'opacity:1@<768px'}`}>
        {/* Constraint rows keep projection order, regardless of draft/completed status. */}
        {proj.constraints.items.map(item => {
          const isActiveItem = item.edit !== undefined
            && editState.step !== 'closed'
            && editState.step !== 'sumbound'
            && editState.targetId === item.target_id
            && (editState.step === 'charset'
              ? item.edit.kind === 'CharSet'
              : editState.template === item.edit.kind)
            && (!editState.constraintId || editState.constraintId === item.constraint_id);

          return (
            <div
              key={`constraint-item-${item.index}`}
              class={`constraint-interaction-region ${isActiveItem ? 'grid gap:8px pb:8px' : ''}`}
              onMouseEnter={isActiveItem ? clearHoverDismissTimer : undefined}
              onMouseLeave={isActiveItem ? scheduleHoverDismiss : undefined}
            >
              <div
                class={`constraint-item group flex cursor:pointer items-center gap:8px r:6px px:8px py:6px font-size:13px legacy-transition bg:#151922:hover ${item.status === 'draft' ? 'draft fg:legacy-slate-500' : 'completed fg:legacy-slate-100'} ${isActiveItem ? 'active bg:#202633 legacy-selection-ring ' : ''}`}
                data-testid={`constraint-item-${item.index}`}
                data-constraint-status={item.status}
                onClick={() => {
                  if (!item.edit) return;
                  openConstraintEditor(item.target_id, item.target_name, item.edit.kind, item.edit);
                }}
                onMouseEnter={() => {
                  if (!item.edit) return;
                  const current = constraintEditState.value;
                  const anotherEditorIsOpen = current.step !== 'closed'
                    && current.step !== 'sumbound'
                    && (current.targetId !== item.target_id
                      || (current.step === 'charset'
                        ? item.edit.kind !== 'CharSet'
                        : current.template !== item.edit.kind));
                  if (anotherEditorIsOpen) return;
                  clearHoverDismissTimer();
                  openConstraintEditor(item.target_id, item.target_name, item.edit.kind, item.edit);
                }}
              >
                <span class="constraint-icon font:mono font-size:11px">{item.status === 'draft' ? '○' : '●'}</span>
                <span
                  class="constraint-display flex:1 font:mono"
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
                    class="constraint-delete-btn fg:legacy-slate-500 opacity:0 legacy-transition fg:legacy-rose-300:hover legacy-group-reveal"
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

              {isActiveItem && editState.step === 'editing' && (
                <ConstraintEditor
                  targetId={editState.targetId}
                  targetName={editState.targetName}
                  onConfirm={handleRangeConfirm}
                />
              )}

              {isActiveItem && editState.step === 'charset' && (
                <CharSetEditor onConfirm={handleCharSetConfirm} />
              )}
            </div>
          );
        })}

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

const charSetOptionBase = 'charset-option r:6px b:1px b:#384152 bg:#18202b px:10px py:4px text-left font-size:12px legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover';

function charSetOptionClass(isSelected: boolean): string {
  return isSelected
    ? `${charSetOptionBase} active selected b:legacy-cyan-300 bg:legacy-cyan-300 font-weight:600 fg:#0f1115`
    : `${charSetOptionBase} fg:legacy-slate-200`;
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

  return (
    <div class="charset-options flex flex-col gap:8px p:8px">
      <div class="constraint-editor-label mb:8px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Select Character Set</div>
      <div class="charset-presets flex flex-wrap gap:6px">
        <button
          class={charSetOptionClass(selected === 'LowerAlpha')}
          data-testid="charset-option-lowercase"
          onClick={() => {
            charSetSelection.value = 'LowerAlpha';
            onConfirm();
          }}
        >
          a-z (lowercase)
        </button>
        <button
          class={charSetOptionClass(selected === 'UpperAlpha')}
          data-testid="charset-option-uppercase"
          onClick={() => {
            charSetSelection.value = 'UpperAlpha';
            onConfirm();
          }}
        >
          A-Z (uppercase)
        </button>
        <button
          class={charSetOptionClass(selected === 'Digit')}
          data-testid="charset-option-digit"
          onClick={() => {
            charSetSelection.value = 'Digit';
            onConfirm();
          }}
        >
          0-9 (digit)
        </button>
        <button
          class={charSetOptionClass(selected === 'Alpha')}
          data-testid="charset-option-alpha"
          onClick={() => {
            charSetSelection.value = 'Alpha';
            onConfirm();
          }}
        >
          a-zA-Z (letters)
        </button>
        <button
          class={charSetOptionClass(selected === 'AlphaNumeric')}
          data-testid="charset-option-alphanumeric"
          onClick={() => {
            charSetSelection.value = 'AlphaNumeric';
            onConfirm();
          }}
        >
          a-zA-Z0-9
        </button>
        <button
          class={charSetOptionClass(selected === 'Custom')}
          data-testid="charset-option-custom"
          onClick={() => { charSetSelection.value = 'Custom'; }}
        >
          Custom
        </button>
      </div>

      {selected === 'Custom' && (
        <div class="charset-custom-editor mt:8px r:8px b:1px b:#2a2f3a bg:#151922 p:8px">
          <div class="charset-custom-label mb:8px font-size:12px fg:legacy-slate-500">Enter characters:</div>
          <div class="charset-custom-inputs flex flex-wrap items-center gap:6px">
            {customChars.map((char, index) => (
              <div key={index} class="charset-char-input-group flex items-center gap:4px">
                <input
                  type="text"
                  class="charset-char-input h:32px w:32px r:6px b:1px b:#384152 bg:#18202b px:8px py:4px text-center font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
                  data-testid={`charset-char-input-${index}`}
                  value={char}
                  maxLength={1}
                  placeholder="?"
                  onInput={(e) => updateCustomChar(index, (e.target as HTMLInputElement).value)}
                />
                {customChars.length > 1 && (
                  <button
                    class="fg:legacy-slate-500 opacity:0 legacy-transition fg:legacy-rose-300:hover legacy-group-reveal"
                    onClick={() => removeCustomChar(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              class="h:32px w:32px r:6px b:1px border-style:dashed b:legacy-cyan-300/0.8 px:6px py:2px font:mono font-size:11px fg:legacy-cyan-300 legacy-transition bg:legacy-cyan-300:hover fg:#0f1115:hover"
              data-testid="charset-add-char"
              onClick={addCustomChar}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SumBoundEditor({ onConfirm }: { onConfirm: () => void }) {
  const proj = projection.value;
  const upper = sumBoundUpper.value;
  const bExprState = boundExprState.value;

  return (
    <div class="sumbound-editor my:8px r:8px b:1px b:#2a2f3a bg:#151922 p:12px">
      <div class="constraint-editor-label mb:8px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">SumBound</div>
      <div class="sumbound-row mb:8px flex items-center gap:8px">
        <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Variable</label>
        <select
          class="r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font-size:13px fg:legacy-slate-100 outline:none legacy-transition b:legacy-cyan-300:focus legacy-focus-ring "
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
      <div class="sumbound-row mb:8px flex items-center gap:8px">
        <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Upper Bound</label>
        <div
          class="bound-input flex min-h:32px cursor:pointer items-center r:6px b:1px b:#384152 bg:#18202b px:8px py:4px legacy-transition b:legacy-cyan-300/0.7:hover"
          data-testid="sumbound-upper-input"
          onClick={() => {
            if (!upper) openValueInput('sumbound-upper');
          }}
        >
          {upper ? (
            <span
              class="bound-expression font:mono font-size:13px fg:legacy-cyan-300"
              data-testid="sumbound-upper-expression"
              onClick={(e) => {
                e.stopPropagation();
                openBoundFnSelect('sumbound-upper');
              }}
            >
              {upper}
            </span>
          ) : (
            <span class="bound-placeholder font-size:12px fg:legacy-slate-600">upper...</span>
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
    </div>
  );
}
