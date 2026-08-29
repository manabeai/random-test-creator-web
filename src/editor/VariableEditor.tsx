import { useState } from 'preact/hooks';
import type { AxisOptionProjection, Hotspot } from './editor-state';
import { dispatchAction, projection } from './editor-state';
import { buildDirectHotspotActionFromDraft } from './action-builder';
import { closePopup, selectCandidate } from './popup-state';
import { selectedNodeId } from './workbench-state';
import { WorkbenchIcon } from './WorkbenchIcon';

type BaseType = 'number' | 'string' | 'char';
const TYPE_PRESENTATION: Record<BaseType, { label: string; mark: string }> = {
  number: { label: 'Number', mark: '#' },
  string: { label: 'String', mark: '"…"' },
  char: { label: 'Char', mark: "'a'" },
};

export function VariableEditor({ hotspot }: { hotspot: Hotspot }) {
  const [baseType, setBaseType] = useState<BaseType>('number');
  const [name, setName] = useState('');
  const [horizontal, setHorizontal] = useState('none');
  const [vertical, setVertical] = useState('none');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const variables = projection.value.available_vars;
  const surface = projection.value.input_surface;

  const commit = (nextName = name) => {
    const trimmedName = nextName.trim();
    if (!trimmedName) return;
    const before = new Set(projection.value.nodes.map(node => node.id));
    const action = buildDirectHotspotActionFromDraft(hotspot, {
      name: trimmedName,
      type: baseType,
      horizontal,
      vertical,
    }, variables);
    if (!dispatchAction(action)) return;
    const created = projection.value.nodes.find(node => !before.has(node.id) && node.edit?.name === trimmedName)
      ?? projection.value.nodes.slice().reverse().find(node => node.edit?.name === trimmedName);
    selectedNodeId.value = created?.id ?? null;
    closePopup();
  };

  return (
    <section class="rtc-variable-popover" data-testid="node-popup" aria-label="変数を追加">
      <div class="rtc-variable-editor" data-testid="variable-editor">
        <div class="rtc-popover-topline">
          <div class="rtc-type-switch" role="group" aria-label="型">
            {surface.primitive_types.map(value => (
              <TypeButton
                key={value}
                value={value}
                label={TYPE_PRESENTATION[value].label}
                mark={TYPE_PRESENTATION[value].mark}
                active={baseType === value}
                onSelect={setBaseType}
              />
            ))}
          </div>
          <button class="rtc-icon-button rtc-icon-button--compact" type="button" onClick={closePopup} aria-label="閉じる">
            <WorkbenchIcon name="close" />
          </button>
        </div>

        <select
          class="rtc-visually-hidden"
          data-testid="type-select"
          value={baseType}
          onChange={event => setBaseType(event.currentTarget.value as BaseType)}
          aria-hidden="true"
          tabIndex={-1}
        >
          {surface.primitive_types.map(value => <option key={value} value={value}>{value}</option>)}
        </select>

        <div class="rtc-name-composer">
          <WorkbenchIcon name="tag" />
          <input
            type="text"
            value={name}
            data-testid="name-input"
            aria-label="名前"
            autocomplete="off"
            onInput={event => setName(event.currentTarget.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') commit(event.currentTarget.value);
              if (event.key === 'Escape') closePopup();
            }}
          />
          <div class="rtc-name-chips" aria-label="名前候補">
            {surface.name_helpers.map(helper => (
              <button
                type="button"
                key={helper}
                data-testid={`name-helper-${helper}`}
                aria-label={`${helper} を入力`}
                onClick={() => { setName(helper); }}
              >
                {helper}
              </button>
            ))}
          </div>
          <button
            class="rtc-commit-icon"
            type="button"
            data-testid="confirm-button"
            disabled={!name.trim() || (vertical !== 'none' && horizontal === 'none')}
            onClick={() => commit()}
            aria-label="追加"
          >
            <WorkbenchIcon name="check" />
          </button>
        </div>

        <div class="rtc-axis-composer" aria-label="構造">
          <AxisSelect
            testId="horizontal-axis"
            label="横方向"
            value={horizontal}
            options={surface.axis_options}
            onChange={value => {
              setHorizontal(value);
              if (value === 'none') setVertical('none');
            }}
          />
          <span class="rtc-product-mark" aria-hidden="true">×</span>
          <AxisSelect
            testId="vertical-axis"
            label="縦方向"
            value={vertical}
            options={surface.axis_options}
            disabled={horizontal === 'none'}
            onChange={setVertical}
          />
          <button
            class={`rtc-more-button ${advancedOpen ? 'is-active' : ''}`}
            type="button"
            data-testid="advanced-structure-toggle"
            aria-label="高度な構造"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen(open => !open)}
          >
            <WorkbenchIcon name="more" />
          </button>
        </div>

        {advancedOpen && (
          <div class="rtc-advanced-structures" aria-label="高度な構造">
            {hotspot.candidate_details
              .filter(candidate => !['scalar', 'array', 'matrix'].includes(candidate.kind))
              .map(candidate => (
                <button
                  type="button"
                  key={candidate.kind}
                  data-testid={`popup-option-${candidate.kind}`}
                  onClick={() => selectCandidate(candidate.kind)}
                >
                  {candidate.label}
                </button>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TypeButton({ value, label, mark, active, onSelect }: {
  value: BaseType;
  label: string;
  mark: string;
  active: boolean;
  onSelect: (value: BaseType) => void;
}) {
  return (
    <button
      type="button"
      class={active ? 'is-active' : ''}
      data-testid={`type-${value}`}
      aria-pressed={active}
      onClick={() => onSelect(value)}
    >
      <span aria-hidden="true">{mark}</span>
      {label}
    </button>
  );
}

function AxisSelect({ testId, label, value, options, disabled = false, onChange }: {
  testId: string;
  label: string;
  value: string;
  options: AxisOptionProjection[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label class="rtc-axis-select">
      <span>{label}</span>
      <select
        data-testid={testId}
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.currentTarget.value)}
      >
        <option value="none">—</option>
        {options.map(option => <option key={option.node_id} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
