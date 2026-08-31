import { useState } from 'preact/hooks';
import type { AxisOptionProjection, ProjectedNode } from './editor-state';
import { dispatchAction, projection } from './editor-state';
import { buildDirectReplaceActionFromDraft, buildRemoveNodeAction } from './action-builder';
import { selectedNodeId } from './workbench-state';
import { TypedConstraintControls } from './TypedConstraintControls';
import { WorkbenchIcon } from './WorkbenchIcon';

type BaseType = 'number' | 'string' | 'char';
const TYPE_PRESENTATION: Record<BaseType, { label: string; mark: string }> = {
  number: { label: 'Number', mark: '#' },
  string: { label: 'String', mark: '"…"' },
  char: { label: 'Char', mark: "'a'" },
};

export function NodeInspector({ node, anchorOffset }: { node: ProjectedNode; anchorOffset?: number }) {
  const edit = node.edit;
  const [name, setName] = useState(edit?.name ?? '');
  const [baseType, setBaseType] = useState<BaseType>(edit?.base_type ?? 'number');
  const [horizontal, setHorizontal] = useState(edit?.horizontal.length_expr ?? 'none');
  const [vertical, setVertical] = useState(edit?.vertical.length_expr ?? 'none');
  const [deleteArmed, setDeleteArmed] = useState(false);

  if (!edit) return null;

  const commitReplacement = (next: {
    name?: string;
    baseType?: BaseType;
    horizontal?: string;
    vertical?: string;
  } = {}) => {
    const nextName = (next.name ?? name).trim();
    const nextType = next.baseType ?? baseType;
    const nextHorizontal = next.horizontal ?? horizontal;
    const nextVertical = nextHorizontal === 'none' ? 'none' : (next.vertical ?? vertical);
    if (!nextName || (nextVertical !== 'none' && nextHorizontal === 'none')) return;

    const action = buildDirectReplaceActionFromDraft(node.id, {
      name: nextName,
      type: nextType,
      horizontal: nextHorizontal,
      vertical: nextVertical,
    }, projection.value.available_vars);
    if (dispatchAction(action)) {
      setName(nextName);
      setBaseType(nextType);
      setHorizontal(nextHorizontal);
      setVertical(nextVertical);
    }
  };

  return (
    <section
      class="rtc-node-inspector"
      data-testid="node-inspector"
      aria-label={`${edit.name} の編集`}
      style={`--rtc-inspector-anchor-x:${anchorOffset ?? 57}px`}
    >
      <header class="rtc-inspector-header">
        <strong>{edit.name}</strong>
        <button type="button" class="rtc-icon-button rtc-icon-button--compact" onClick={() => { selectedNodeId.value = null; }} aria-label="閉じる">
          <WorkbenchIcon name="close" />
        </button>
      </header>

      <div class="rtc-inspector-name-row">
        <WorkbenchIcon name="tag" />
        <input
          type="text"
          value={name}
          maxLength={projection.value.input_surface.name_max_chars}
          data-testid="node-edit-input"
          aria-label="名前"
          autocomplete="off"
          onInput={event => setName(event.currentTarget.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') commitReplacement({ name: event.currentTarget.value });
            if (event.key === 'Escape') selectedNodeId.value = null;
          }}
          onBlur={event => {
            const nextName = event.currentTarget.value.trim();
            if (nextName && nextName !== edit.name) commitReplacement({ name: nextName });
          }}
        />
        <div class="rtc-name-chips rtc-name-chips--inspector" aria-label="名前候補">
          {projection.value.input_surface.name_helpers.map(helper => (
            <button
              type="button"
              key={helper}
              class={name === helper ? 'is-active' : ''}
              data-testid={`node-name-helper-${helper}`}
              onClick={() => { setName(helper); }}
              aria-label={`${helper} を入力`}
            >
              {helper}
            </button>
          ))}
        </div>
        <button
          class="rtc-commit-icon"
          type="button"
          data-testid="node-name-confirm"
          disabled={!name.trim() || name.trim() === edit.name}
          onClick={() => commitReplacement({ name })}
          aria-label="名前を適用"
        >
          <WorkbenchIcon name="check" />
        </button>
      </div>

      <div class="rtc-structure-equation">
        <div class="rtc-type-switch rtc-type-switch--inspector" role="group" aria-label="基本型">
          {edit.allowed_types.map(value => (
            <InspectorType
              key={value}
              value={value}
              label={TYPE_PRESENTATION[value].label}
              mark={TYPE_PRESENTATION[value].mark}
              active={baseType === value}
              onSelect={nextValue => commitReplacement({ baseType: nextValue })}
            />
          ))}
        </div>
        <span class="rtc-product-mark" aria-hidden="true">×</span>
        <AxisSelect
          testId="node-horizontal-axis"
          label="横"
          value={horizontal}
          options={edit.horizontal.options}
          onChange={value => commitReplacement({ horizontal: value, vertical: value === 'none' ? 'none' : vertical })}
        />
        <span class="rtc-product-mark" aria-hidden="true">×</span>
        <AxisSelect
          testId="node-vertical-axis"
          label="縦"
          value={vertical}
          options={edit.vertical.options}
          disabled={horizontal === 'none'}
          onChange={value => commitReplacement({ vertical: value })}
        />
      </div>

      <select
        class="rtc-visually-hidden"
        data-testid="node-edit-type-select"
        value={baseType}
        onChange={event => commitReplacement({ baseType: event.currentTarget.value as BaseType })}
      >
        {edit.allowed_types.map(value => <option key={value} value={value}>{value}</option>)}
      </select>

      <TypedConstraintControls
        selectedId={node.id}
        onSelectNode={id => { selectedNodeId.value = id; }}
      />

      {edit.remove && (
        <div class={`rtc-delete-zone ${deleteArmed ? 'is-armed' : ''}`}>
          <button
            type="button"
            data-testid="node-delete-button"
            aria-label={deleteArmed ? `${edit.name} を削除する` : '削除'}
            onClick={() => {
              if (!deleteArmed) {
                setDeleteArmed(true);
                return;
              }
              if (dispatchAction(buildRemoveNodeAction(edit.remove!))) selectedNodeId.value = null;
            }}
          >
            <WorkbenchIcon name="trash" />
            {deleteArmed && <span>{edit.name}</span>}
          </button>
          {deleteArmed && (
            <button type="button" onClick={() => setDeleteArmed(false)} aria-label="削除を取り消す">
              <WorkbenchIcon name="close" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function InspectorType({ value, label, mark, active, onSelect }: {
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
      data-testid={`node-type-${value}`}
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
    <label class="rtc-axis-select rtc-axis-select--compact">
      <span>{label}</span>
      <select data-testid={testId} value={value} disabled={disabled} onChange={event => onChange(event.currentTarget.value)}>
        <option value="none">—</option>
        {options.map(option => <option key={option.node_id} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
