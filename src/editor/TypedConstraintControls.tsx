import { useMemo, useRef, useState } from 'preact/hooks';
import {
  dispatchAction,
  dispatchActions,
  projection,
  type CharSetChoiceProjection,
  type CharSetSpec,
  type ConstraintItem,
  type IntervalSliderProjection,
} from './editor-state';
import {
  buildAddConstraintProperty,
  buildConstraintActionsFromDraft,
  buildRemoveConstraint,
} from './action-builder';
import { WorkbenchIcon } from './WorkbenchIcon';

export function TypedConstraintControls({ selectedId, onSelectNode }: {
  selectedId: string;
  onSelectNode: (nodeId: string) => void;
}) {
  const items = projection.value.constraints.items;
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [sumOpen, setSumOpen] = useState(false);
  const [sumVar, setSumVar] = useState('');
  const [sumUpper, setSumUpper] = useState('');
  const numberVars = projection.value.available_vars.filter(
    variable => variable.value_type === 'number' && variable.node_kind === 'scalar',
  );

  const commitSum = (nextUpper = sumUpper) => {
    if (!sumVar || !nextUpper.trim()) return;
    const variable = numberVars.find(candidate => candidate.name === sumVar);
    if (!variable) return;
    dispatchActions(buildConstraintActionsFromDraft({
      targetId: variable.node_id,
      template: 'SumBound',
      overVar: sumVar,
      upper: nextUpper.trim(),
    }));
    setSumOpen(false);
    setSumUpper('');
  };

  return (
    <section class="rtc-constraint-pane" data-testid="constraint-pane" aria-label="制約">
      <div class="rtc-constraint-toolbar">
        <button
          type="button"
          data-testid="property-shortcut"
          aria-label="性質を追加"
          aria-expanded={propertyOpen}
          onClick={() => {
            setPropertyOpen(open => !open);
            setSumOpen(false);
          }}
        >
          <WorkbenchIcon name="property" />
        </button>
        <button
          type="button"
          data-testid="sumbound-shortcut"
          aria-label="総和制約を追加"
          aria-expanded={sumOpen}
          onClick={() => {
            setSumOpen(open => !open);
            setPropertyOpen(false);
          }}
        >
          <WorkbenchIcon name="sigma" />
        </button>
      </div>

      {propertyOpen && (
        <div class="rtc-property-options">
          {['tree', 'connected', 'simple'].map(property => (
            <button
              type="button"
              key={property}
              data-testid={`property-option-${property}`}
              onClick={() => {
                const rootTarget = projection.value.nodes[0]?.id ?? selectedId;
                dispatchAction(buildAddConstraintProperty(rootTarget, capitalize(property)));
                setPropertyOpen(false);
              }}
            >
              {capitalize(property)}
            </button>
          ))}
        </div>
      )}

      {sumOpen && (
        <div class="rtc-sum-control">
          <select
            data-testid="sumbound-var-select"
            aria-label="総和対象"
            value={sumVar}
            onChange={event => setSumVar(event.currentTarget.value)}
          >
            <option value="">Σ</option>
            {numberVars.map(variable => (
              <option key={variable.node_id} value={variable.name}>{variable.name}</option>
            ))}
          </select>
          <span aria-hidden="true">≤</span>
          <input
            data-testid="sumbound-upper-input"
            aria-label="総和の上限"
            value={sumUpper}
            inputMode="numeric"
            onInput={event => setSumUpper(event.currentTarget.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
            onBlur={event => commitSum(event.currentTarget.value)}
          />
        </div>
      )}

      <div class="rtc-constraint-list">
        {items.map(item => {
          const active = item.target_id === selectedId;
          return (
            <div
              key={`${item.target_id}-${item.index}`}
              class={`rtc-constraint-item ${active ? 'is-active' : ''}`}
              data-testid={`constraint-item-${item.index}`}
              data-constraint-status={item.status}
              data-constraint-active={active ? 'true' : 'false'}
              data-constraint-target={item.target_id}
              role={active ? undefined : 'button'}
              tabIndex={active ? undefined : 0}
              aria-label={active ? undefined : `${item.target_name} の制約を編集`}
              onClick={() => {
                if (!active) onSelectNode(item.target_id);
              }}
              onKeyDown={event => {
                if (active || (event.key !== 'Enter' && event.key !== ' ')) return;
                event.preventDefault();
                onSelectNode(item.target_id);
              }}
            >
              <div class="rtc-constraint-summary">
                <span class={`rtc-constraint-state rtc-constraint-state--${item.status}`} aria-hidden="true" />
                <span
                  class="rtc-constraint-formula"
                  data-testid={item.status === 'draft'
                    ? `draft-constraint-${item.draft_index}`
                    : `completed-constraint-${item.completed_index}`}
                >
                  {item.display}
                </span>
                {item.status === 'completed' && item.constraint_id && (
                  <button
                    type="button"
                    data-testid={`delete-constraint-${item.completed_index ?? item.index}`}
                    aria-label="制約を削除"
                    onClick={event => {
                      event.stopPropagation();
                      dispatchAction(buildRemoveConstraint(item.constraint_id!));
                    }}
                  >
                    <WorkbenchIcon name="close" />
                  </button>
                )}
              </div>
              {active && item.edit && (
                <TypedControl
                  key={`${item.target_id}-${item.constraint_id ?? 'draft'}-${item.edit.kind}`}
                  item={item}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TypedControl({ item }: { item: ConstraintItem }) {
  if (!item.edit) return null;
  if (item.edit.kind === 'Range') {
    return (
      <IntervalControl
        item={item}
        lower={item.edit.lower}
        upper={item.edit.upper}
        slider={item.edit.slider}
        template="Range"
        testId="number-range-control"
      />
    );
  }
  if (item.edit.kind === 'StringLength') {
    return (
      <IntervalControl
        item={item}
        lower={item.edit.min}
        upper={item.edit.max}
        slider={item.edit.slider}
        template="StringLength"
        testId="string-length-control"
      />
    );
  }
  return (
    <CharSetControl
      item={item}
      charset={item.edit.charset}
      choices={item.edit.choices}
    />
  );
}

function IntervalControl({ item, lower: projectedLower, upper: projectedUpper, slider, template, testId }: {
  item: ConstraintItem;
  lower: string;
  upper: string;
  slider: IntervalSliderProjection;
  template: 'Range' | 'StringLength';
  testId: 'number-range-control' | 'string-length-control';
}) {
  const [lower, setLower] = useState(projectedLower || slider.stops[slider.lower_index]?.value || '1');
  const [upper, setUpper] = useState(projectedUpper || slider.stops[slider.upper_index]?.value || '100');
  const [lowerIndex, setLowerIndex] = useState(slider.lower_index);
  const [upperIndex, setUpperIndex] = useState(slider.upper_index);
  const committing = useRef(false);
  const focusUpperAfterCommit = useRef(false);

  const commit = (nextLower = lower, nextUpper = upper) => {
    if (committing.current || !nextLower.trim() || !nextUpper.trim()) return;
    committing.current = true;
    const dispatched = dispatchActions(buildConstraintActionsFromDraft({
      targetId: item.target_id,
      template,
      existingConstraintId: item.constraint_id,
      lower: nextLower.trim(),
      upper: nextUpper.trim(),
    }));
    if (!dispatched) committing.current = false;
  };

  const updateLowerFromSlider = (index: number, shouldCommit: boolean) => {
    const nextIndex = Math.min(index, upperIndex);
    const value = slider.stops[nextIndex].value;
    setLowerIndex(nextIndex);
    setLower(value);
    if (shouldCommit) commit(value, upper);
  };
  const updateUpperFromSlider = (index: number, shouldCommit: boolean) => {
    const nextIndex = Math.max(index, lowerIndex);
    const value = slider.stops[nextIndex].value;
    setUpperIndex(nextIndex);
    setUpper(value);
    if (shouldCommit) commit(lower, value);
  };
  const rangeTestPrefix = template === 'Range' ? 'range' : 'string-length';

  return (
    <div class="rtc-interval-control" data-testid={testId} onClick={event => event.stopPropagation()}>
      <WorkbenchIcon name="range" />
      <div
        class="rtc-double-range"
        style={`--rtc-range-start:${(lowerIndex / (slider.stops.length - 1)) * 100}%;--rtc-range-end:${(upperIndex / (slider.stops.length - 1)) * 100}%`}
      >
        <span class="rtc-range-track" aria-hidden="true" />
        <input
          type="range"
          min="0"
          max={slider.stops.length - 1}
          value={lowerIndex}
          data-testid={`${rangeTestPrefix}-lower-slider`}
          aria-label="下限"
          aria-valuetext={slider.stops[lowerIndex]?.value ?? lower}
          onInput={event => updateLowerFromSlider(Number(event.currentTarget.value), false)}
          onChange={event => updateLowerFromSlider(Number(event.currentTarget.value), true)}
        />
        <input
          type="range"
          min="0"
          max={slider.stops.length - 1}
          value={upperIndex}
          data-testid={`${rangeTestPrefix}-upper-slider`}
          aria-label="上限"
          aria-valuetext={slider.stops[upperIndex]?.value ?? upper}
          onInput={event => updateUpperFromSlider(Number(event.currentTarget.value), false)}
          onChange={event => updateUpperFromSlider(Number(event.currentTarget.value), true)}
        />
      </div>
      <div class="rtc-bound-pair">
        <label data-testid="constraint-lower-input">
          <input
            value={lower}
            data-testid={`${rangeTestPrefix}-lower-input`}
            aria-label="下限の正確な値"
            onInput={event => setLower(event.currentTarget.value)}
            onKeyDown={event => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              focusUpperAfterCommit.current = true;
              event.currentTarget.blur();
            }}
            onBlur={event => {
              const shouldFocusUpper = focusUpperAfterCommit.current;
              focusUpperAfterCommit.current = false;
              commit(event.currentTarget.value, upper);
              if (shouldFocusUpper) {
                window.requestAnimationFrame(() => {
                  document.querySelector<HTMLInputElement>(
                    `.rtc-constraint-item[data-constraint-active="true"] [data-testid="${rangeTestPrefix}-upper-input"]`,
                  )?.focus();
                });
              }
            }}
          />
        </label>
        <span aria-hidden="true">≤ {item.target_name} ≤</span>
        <label data-testid="constraint-upper-input">
          <input
            value={upper}
            data-testid={`${rangeTestPrefix}-upper-input`}
            aria-label="上限の正確な値"
            onInput={event => setUpper(event.currentTarget.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
            onBlur={event => commit(lower, event.currentTarget.value)}
          />
        </label>
      </div>
    </div>
  );
}

function CharSetControl({ item, charset, choices }: {
  item: ConstraintItem;
  charset: CharSetSpec;
  choices: CharSetChoiceProjection[];
}) {
  const initialCustom = charset.kind === 'Custom' ? charset.chars.join('') : '';
  const [customOpen, setCustomOpen] = useState(charset.kind === 'Custom');
  const [custom, setCustom] = useState(initialCustom);
  const activeKind = item.status === 'completed' ? charset.kind : null;
  const preview = useMemo(
    () => customOpen && custom ? Array.from(new Set(Array.from(custom))).join(' ') : choices.find(choice => choice.value === activeKind)?.preview ?? '',
    [activeKind, choices, custom, customOpen],
  );

  const commit = (next: CharSetSpec) => {
    dispatchActions(buildConstraintActionsFromDraft({
      targetId: item.target_id,
      template: 'CharSet',
      existingConstraintId: item.constraint_id,
      charset: next,
    }));
  };
  const commitCustom = (nextCustom = custom) => {
    const chars = Array.from(new Set(Array.from(nextCustom))).filter(Boolean);
    if (chars.length > 0) commit({ kind: 'Custom', chars });
  };

  return (
    <div class="rtc-charset-control" data-testid="charset-control" onClick={event => event.stopPropagation()}>
      <WorkbenchIcon name="charset" />
      <div class="rtc-charset-options">
        {choices.map(choice => {
          const testId = charsetTestId(choice.value);
          return (
            <button
              type="button"
              key={choice.value}
              class={activeKind === choice.value || (choice.value === 'Custom' && customOpen) ? 'is-active' : ''}
              data-testid={testId}
              aria-pressed={activeKind === choice.value || (choice.value === 'Custom' && customOpen)}
              onClick={() => {
                if (choice.value === 'Custom') {
                  setCustomOpen(true);
                  return;
                }
                setCustomOpen(false);
                commit({ kind: choice.value } as CharSetSpec);
              }}
            >
              {choice.preview}
            </button>
          );
        })}
      </div>
      {customOpen && (
        <input
          class="rtc-charset-custom-input"
          data-testid="charset-custom-input"
          value={custom}
          aria-label="使用できる文字"
          autocomplete="off"
          onInput={event => setCustom(event.currentTarget.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          onBlur={event => commitCustom(event.currentTarget.value)}
        />
      )}
      <output class="rtc-charset-preview" data-testid="charset-preview">{preview}</output>
    </div>
  );
}

function charsetTestId(value: CharSetChoiceProjection['value']): string {
  const suffix: Record<string, string> = {
    LowerAlpha: 'lowercase',
    UpperAlpha: 'uppercase',
    Alpha: 'alpha',
    Digit: 'digit',
    AlphaNumeric: 'alphanumeric',
    Custom: 'custom',
  };
  return `charset-option-${suffix[value] ?? value.toLowerCase()}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
