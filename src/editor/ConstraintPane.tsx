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
  buildAddConstraintProperty,
  buildRemoveConstraint,
} from './action-builder';
import { ConstraintEditor } from './ConstraintEditor';
import { ValueInput, isValueInputOpen } from './ValueInput';
import { FunctionOpsPanel, FunctionOperandInput } from './ExpressionBuilder';
import { constraintFolded, toggleConstraintFold } from './fold-state';

const showPropertyOptions = signal(false);
let hoverDismissTimer: ReturnType<typeof setTimeout> | null = null;

function clearHoverDismissTimer() {
  if (hoverDismissTimer) {
    clearTimeout(hoverDismissTimer);
    hoverDismissTimer = null;
  }
}

export function ConstraintPane() {
  const proj = projection.value;
  const editState = constraintEditState.value;
  const folded = constraintFolded.value;
  const paneRef = useRef<HTMLDivElement>(null);

  const handleRangeConfirm = (lower: string, upper: string) => {
    if (editState.step === 'editing') {
      const actions = buildConstraintActionsFromDraft({
        targetId: editState.targetId,
        template: editState.template === 'StringLength' ? 'StringLength' : 'Range',
        existingConstraintId: editState.constraintId,
        lower,
        upper,
      });
      actions.forEach(dispatchAction);
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
    if (editState.step === 'charset' && charSetSelection.value) {
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
        targetId: editState.targetId,
        template: 'CharSet',
        existingConstraintId: editState.constraintId,
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
    showPropertyOptions.value = false;
  };

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
      class={`pane flex min-w-0 flex-col overflow-hidden bg-[#0f1115] ${folded ? 'folded' : ''} max-md:flex-none max-md:overflow-visible`}
      data-testid="constraint-pane"
      onMouseLeave={dismissEditor}
    >
      <div class="pane-header flex min-h-11 items-center justify-between border-b border-[#2a2f3a] bg-[#151922] px-3">
        <span class="pane-title text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Constraints</span>
        <div class="pane-header-controls flex items-center gap-2">
          <div class="constraint-shortcuts flex gap-1.5">
            <button
              class="shortcut-btn rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200"
              data-testid="property-shortcut"
              onClick={() => {
                closeConstraintEditor();
                showPropertyOptions.value = !showPropertyOptions.value;
              }}
            >
              Property
            </button>
            <button
              class="shortcut-btn rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200"
              data-testid="sumbound-shortcut"
              onClick={() => {
                showPropertyOptions.value = false;
                openSumBound();
              }}
            >
              ΣBound
            </button>
          </div>
          <button class="fold-toggle hidden rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200 max-md:inline-flex" onClick={toggleConstraintFold} aria-label={folded ? 'Expand' : 'Collapse'}>
            {folded ? '▶' : '▼'}
          </button>
        </div>
      </div>
      <div class={`pane-content-scroll flex-1 overflow-auto p-3 max-md:max-h-[2000px] max-md:overflow-hidden max-md:transition-[max-height,opacity] max-md:duration-300 ${folded ? 'max-md:max-h-0 max-md:py-0 max-md:opacity-0' : 'max-md:opacity-100'}`}>
        {/* Property options (signal-driven visibility) */}
        {showPropertyOptions.value && (
          <PropertyOptions onSelect={handlePropertySelect} />
        )}

        {/* Constraint rows keep projection order, regardless of draft/completed status. */}
        {proj.constraints.items.map(item => (
          <div
            key={`constraint-item-${item.index}`}
            class={`constraint-item group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition hover:bg-[#151922] ${item.status === 'draft' ? 'draft text-slate-500' : 'completed text-slate-100'} ${editState.step !== 'closed' && editState.step !== 'sumbound' && editState.targetId === item.target_id ? 'active bg-[#202633] ring-1 ring-cyan-300/15' : ''}`}
            data-testid={`constraint-item-${item.index}`}
            data-constraint-status={item.status}
            onClick={() => {
              if (!item.edit) return;
              showPropertyOptions.value = false;
              openConstraintEditor(item.target_id, item.target_name, item.edit.kind, item.edit);
            }}
            onMouseEnter={() => {
              clearHoverDismissTimer();
              if (!item.edit) return;
              showPropertyOptions.value = false;
              openConstraintEditor(item.target_id, item.target_name, item.edit.kind, item.edit);
            }}
            onMouseLeave={() => {
              hoverDismissTimer = setTimeout(() => {
                closeConstraintEditor();
              }, 120);
            }}
          >
            <span class="constraint-icon font-mono text-[11px]">{item.status === 'draft' ? '○' : '●'}</span>
            <span
              class="constraint-display flex-1 font-mono"
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
                class="constraint-delete-btn text-slate-500 opacity-0 transition hover:text-rose-300 group-hover:opacity-100"
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
            onMouseEnter={clearHoverDismissTimer}
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
    <div class="property-options visible mb-2 flex flex-wrap gap-1.5 p-2">
      <button
        class="property-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
        data-testid="property-option-tree"
        onClick={() => onSelect('Tree')}
      >
        Tree
      </button>
      <button
        class="property-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
        data-testid="property-option-connected"
        onClick={() => onSelect('Connected')}
      >
        Connected
      </button>
      <button
        class="property-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
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

  return (
    <div class="charset-options flex flex-col gap-2 p-2">
      <div class="constraint-editor-label mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Select Character Set</div>
      <div class="charset-presets flex flex-wrap gap-1.5">
        <button
          class={`charset-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 ${selected === 'LowerAlpha' ? 'active selected border-cyan-300 bg-cyan-300 font-semibold text-[#0f1115]' : ''}`}
          data-testid="charset-option-lowercase"
          onClick={() => {
            charSetSelection.value = 'LowerAlpha';
            onConfirm();
          }}
        >
          a-z (lowercase)
        </button>
        <button
          class={`charset-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 ${selected === 'UpperAlpha' ? 'active selected border-cyan-300 bg-cyan-300 font-semibold text-[#0f1115]' : ''}`}
          data-testid="charset-option-uppercase"
          onClick={() => {
            charSetSelection.value = 'UpperAlpha';
            onConfirm();
          }}
        >
          A-Z (uppercase)
        </button>
        <button
          class={`charset-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 ${selected === 'Digit' ? 'active selected border-cyan-300 bg-cyan-300 font-semibold text-[#0f1115]' : ''}`}
          data-testid="charset-option-digit"
          onClick={() => {
            charSetSelection.value = 'Digit';
            onConfirm();
          }}
        >
          0-9 (digit)
        </button>
        <button
          class={`charset-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 ${selected === 'Alpha' ? 'active selected border-cyan-300 bg-cyan-300 font-semibold text-[#0f1115]' : ''}`}
          data-testid="charset-option-alpha"
          onClick={() => {
            charSetSelection.value = 'Alpha';
            onConfirm();
          }}
        >
          a-zA-Z (letters)
        </button>
        <button
          class={`charset-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 ${selected === 'AlphaNumeric' ? 'active selected border-cyan-300 bg-cyan-300 font-semibold text-[#0f1115]' : ''}`}
          data-testid="charset-option-alphanumeric"
          onClick={() => {
            charSetSelection.value = 'AlphaNumeric';
            onConfirm();
          }}
        >
          a-zA-Z0-9
        </button>
        <button
          class={`charset-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 ${selected === 'Custom' ? 'active selected border-cyan-300 bg-cyan-300 font-semibold text-[#0f1115]' : ''}`}
          data-testid="charset-option-custom"
          onClick={() => { charSetSelection.value = 'Custom'; }}
        >
          Custom
        </button>
      </div>

      {selected === 'Custom' && (
        <div class="charset-custom-editor mt-2 rounded-lg border border-[#2a2f3a] bg-[#151922] p-2">
          <div class="charset-custom-label mb-2 text-[12px] text-slate-500">Enter characters:</div>
          <div class="charset-custom-inputs flex flex-wrap items-center gap-1.5">
            {customChars.map((char, index) => (
              <div key={index} class="charset-char-input-group flex items-center gap-1">
                <input
                  type="text"
                  class="charset-char-input h-8 w-8 rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 text-center font-mono text-[13px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
                  data-testid={`charset-char-input-${index}`}
                  value={char}
                  maxLength={1}
                  placeholder="?"
                  onInput={(e) => updateCustomChar(index, (e.target as HTMLInputElement).value)}
                />
                {customChars.length > 1 && (
                  <button
                    class="text-slate-500 opacity-0 transition hover:text-rose-300 group-hover:opacity-100"
                    onClick={() => removeCustomChar(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              class="h-8 w-8 rounded-md border border-dashed border-cyan-300/80 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300 transition hover:bg-cyan-300 hover:text-[#0f1115]"
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
    <div class="sumbound-editor my-2 rounded-lg border border-[#2a2f3a] bg-[#151922] p-3">
      <div class="constraint-editor-label mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">SumBound</div>
      <div class="sumbound-row mb-2 flex items-center gap-2">
        <label class="min-w-16 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Variable</label>
        <select
          class="rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 text-[13px] text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
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
      <div class="sumbound-row mb-2 flex items-center gap-2">
        <label class="min-w-16 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Upper Bound</label>
        <div
          class="bound-input flex min-h-8 cursor-pointer items-center rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 transition hover:border-cyan-300/70"
          data-testid="sumbound-upper-input"
          onClick={() => {
            if (!upper) openValueInput('sumbound-upper');
          }}
        >
          {upper ? (
            <span
              class="bound-expression font-mono text-[13px] text-cyan-300"
              data-testid="sumbound-upper-expression"
              onClick={(e) => {
                e.stopPropagation();
                openBoundFnSelect('sumbound-upper');
              }}
            >
              {upper}
            </span>
          ) : (
            <span class="bound-placeholder text-[12px] text-slate-600">upper...</span>
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
