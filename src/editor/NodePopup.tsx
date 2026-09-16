/**
 * Node creation wizard popup.
 *
 * 2-step inline wizard with candidate preview:
 *   Step 1 — choose a candidate (left list + hover preview on right)
 *   Step 2 — fill in fields (left list with selection + fields panel on right)
 *
 * Variant hotspots skip the wizard and go directly to the fields panel.
 */
import { useEffect } from 'preact/hooks';
import { projection, dispatchAction, type ExprCandidate } from './editor-state';
import {
  popupState,
  selectCandidate,
  closePopup,
  hoveredCandidate,
  popupName,
  popupType,
  popupLengthVar,
  popupLengthVar2,
  popupWeightName,
  popupVariantTag,
  popupCommitted,
} from './popup-state';
import {
  buildHotspotActionFromDraft,
} from './action-builder';
import { CountField, getCountExprValue } from './ExpressionBuilder';
import { selectedNodeId } from './workbench-state';

export function NodePopup() {
  const state = popupState.value;
  if (state.step === 'closed') return null;

  // Variant bypasses the wizard layout
  if (state.step === 'fields' && state.candidate === 'variant') {
    return (
      <div class="node-popup r:8px b:1px b:#2a2f3a bg:#151922 p:12px shadow:0|25px|50px|-12px|rgb(0|0|0/0.4) " data-testid="node-popup">
        <VariantFieldsPanel />
      </div>
    );
  }

  const candidates = state.hotspot.candidates;
  const candidateDetails = new Map(state.hotspot.candidate_details.map(detail => [detail.kind, detail]));
  const activeStep = state.step === 'candidates' ? 1 : 2;
  const selectedCandidate = state.step === 'fields' ? state.candidate : null;

  return (
    <div class="node-popup r:8px b:1px b:#2a2f3a bg:#151922 p:12px shadow:0|25px|50px|-12px|rgb(0|0|0/0.4) " data-testid="node-popup">
      <StepIndicator active={activeStep} />
      <div class="popup-wizard grid grid-template-columns:9rem|1fr gap:12px grid-cols:1@<768px">
        <div class="popup-candidate-list flex flex-col gap:6px flex-row@<768px flex-wrap@<768px">
          {candidates.map(c => (
            <button
              key={c}
              class={`popup-option r:6px b:1px b:#384152 bg:#18202b px:10px py:4px text-left font-size:12px fg:legacy-slate-200 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover ${selectedCandidate === c ? 'selected b:legacy-cyan-300 bg:legacy-cyan-300 font-weight:600 fg:#0f1115' : ''}`}
              data-testid={`popup-option-${c}`}
              onClick={() => selectCandidate(c)}
              onMouseEnter={() => { hoveredCandidate.value = c; }}
              onMouseLeave={() => { hoveredCandidate.value = null; }}
            >
              {candidateDetails.get(c)?.label ?? c}
            </button>
          ))}
        </div>
        <div class="popup-right-panel flex min-h:80px flex-col">
          {state.step === 'candidates' && <PreviewPanel />}
          {state.step === 'fields' && <FieldsPanel />}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ active }: { active: number }) {
  return (
    <div class="popup-step-indicator mb:8px flex items-center gap:6px font-size:12px">
      <span class={active === 1 ? 'step-active font-weight:600 fg:legacy-cyan-300' : 'step-inactive fg:legacy-slate-600'}>01 Choose</span>
      <span class="step-arrow fg:legacy-slate-600">/</span>
      <span class={active === 2 ? 'step-active font-weight:600 fg:legacy-cyan-300' : 'step-inactive fg:legacy-slate-600'}>02 Configure</span>
    </div>
  );
}

function PreviewPanel() {
  const hovered = hoveredCandidate.value;
  const state = popupState.value;
  if (!hovered) {
    return <div class="popup-preview popup-preview-empty flex flex:1 items-center justify-center r:6px b:1px border-style:dashed b:#384152 bg:#101318 p:8px font-size:12px fg:legacy-slate-500">Hover to preview fields</div>;
  }
  const detail = state.step === 'closed'
    ? undefined
    : state.hotspot.candidate_details.find(candidate => candidate.kind === hovered);
  const fields = detail?.fields ?? [];
  return (
    <div class="popup-preview flex flex:1 flex-col gap:8px r:6px b:1px border-style:dashed b:#384152 bg:#101318 p:8px">
      <div class="preview-title font-size:12px font-weight:600 fg:legacy-cyan-300">{detail?.label ?? hovered}</div>
      <div class="preview-fields flex flex-wrap gap:6px">
        {fields.map(f => (
          <span key={f.name} class="preview-field-tag r:4px b:1px b:#384152 bg:#151922 px:6px py:2px font-size:11px fg:legacy-slate-400">{f.label}</span>
        ))}
      </div>
    </div>
  );
}

function VariantFieldsPanel() {
  const state = popupState.value;
  if (state.step !== 'fields') return null;

  const handleCommit = () => {
    if (popupCommitted.value) return;
    if (!isVariantValid()) return;
    popupCommitted.value = true;
    const before = new Set(projection.value.nodes.map(node => node.id));
    const actionJson = buildHotspotActionFromDraft(
      state.hotspot,
      'variant',
      { tag: popupVariantTag.value, name: popupName.value },
      projection.value.available_vars,
    );
    if (dispatchAction(actionJson)) {
      selectedNodeId.value = projection.value.nodes.find(node => !before.has(node.id) && node.edit)?.id
        ?? projection.value.nodes.find(node => node.edit)?.id
        ?? null;
    }
    closePopup();
  };

  const isVariantValid = () => popupVariantTag.value.trim() !== '' && popupName.value.trim() !== '';
  return (
    <div
      class="popup-fields flex flex-col gap:8px"
      onMouseLeave={handleCommit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCommit();
      }}
    >
      <div class="popup-field flex items-center gap:8px">
        <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Tag Value</label>
        <input
          type="text"
          class="r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
          data-testid="variant-tag-input"
          value={popupVariantTag.value}
          onInput={(e) => { popupVariantTag.value = (e.target as HTMLInputElement).value; }}
          autoFocus
        />
      </div>
      <div class="popup-field flex items-center gap:8px">
        <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Name</label>
        <input
          type="text"
          class="r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
          data-testid="name-input"
          value={popupName.value}
          onInput={(e) => { popupName.value = (e.target as HTMLInputElement).value; }}
        />
      </div>
    </div>
  );
}

function FieldsPanel() {
  const state = popupState.value;
  if (state.step !== 'fields') return null;

  const candidate = state.candidate;
  const proj = projection.value;
  const availableVars = proj.available_vars;
  const lengthVars = availableVars.filter(isIntScalarVar);
  const candidateDetail = state.hotspot.candidate_details.find(detail => detail.kind === candidate);
  const fields = candidateDetail?.fields ?? [];
  const hasField = (name: string) => fields.some(field => field.name === name);
  const hasFieldType = (fieldType: string) => fields.some(field => field.field_type === fieldType);

  const needsType = hasField('type');
  const needsName = hasField('name');
  const needsLength = hasField('length');
  const needsGridLength = hasField('rows') || hasField('cols');
  const needsCountExpr = hasFieldType('count_expr');
  const needsWeightName = hasField('weight_name');

  const handleCommit = () => {
    if (popupCommitted.value) return;
    if (!isValid()) return;
    popupCommitted.value = true;
    const before = new Set(proj.nodes.map(node => node.id));
    const countExpr = needsCountExpr ? (getCountExprValue() || popupLengthVar.value) : '';
    try {
      const actionJson = buildHotspotActionFromDraft(
        state.hotspot,
        candidate,
        buildDraftFields({
          name: popupName.value,
          type: popupType.value,
          length: popupLengthVar.value,
          rows: popupLengthVar.value,
          cols: popupLengthVar2.value,
          count: countExpr,
          weight_name: popupWeightName.value,
        }),
        availableVars,
      );
      if (dispatchAction(actionJson)) {
        selectedNodeId.value = projection.value.nodes.find(node => !before.has(node.id) && node.edit)?.id
          ?? projection.value.nodes.find(node => node.edit)?.id
          ?? null;
      }
      closePopup();
    } catch (error) {
      console.error('Draft action build failed:', error);
      popupCommitted.value = false;
    }
  };

  const hasLength = popupLengthVar.value.trim() !== '';
  const hasSecondLength = popupLengthVar2.value.trim() !== '';
  const hasCount = (getCountExprValue() || popupLengthVar.value).trim() !== '';
  const isValid = () => {
    if (needsName && popupName.value.trim() === '') return false;
    if (needsLength && !hasLength) return false;
    if (needsGridLength && (!hasLength || !hasSecondLength)) return false;
    if (needsCountExpr && !hasCount) return false;
    if (needsWeightName && popupWeightName.value.trim() === '') return false;
    return true;
  };

  useEffect(() => {
    if (!isValid()) return;
    if (candidateDetail?.commit_on_ready) {
      handleCommit();
    }
  });

  return (
    <div
      class="popup-fields flex flex-col gap:8px"
      onMouseLeave={handleCommit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCommit();
      }}
    >
      {needsType && (
        <div class="popup-field flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Type</label>
          <div class="type-buttons flex flex-wrap gap:6px">
            {['number', 'string', 'char'].map(t => (
              <button
                key={t}
                type="button"
                class={`type-btn r:6px b:1px b:#384152 bg:#18202b px:10px py:4px text-left font-size:12px fg:legacy-slate-200 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover ${popupType.value === t ? 'active selected b:legacy-cyan-300 bg:legacy-cyan-300 font-weight:600 fg:#0f1115' : ''}`}
                onClick={() => { popupType.value = t; }}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Hidden select for E2E test compatibility */}
          <select
            data-testid="type-select"
            value={popupType.value}
            onChange={(e) => { popupType.value = (e.target as HTMLSelectElement).value; }}
            class="abs h:1px w:1px overflow:hidden opacity:0"
          >
            <option value="number">number</option>
            <option value="string">string</option>
            <option value="char">char</option>
          </select>
        </div>
      )}

      {needsName && (
        <div class="popup-field flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Name</label>
          <input
            type="text"
            class="r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
            data-testid="name-input"
            value={popupName.value}
            onInput={(e) => { popupName.value = (e.target as HTMLInputElement).value; }}
            onBlur={() => {
              if (candidate === 'scalar') handleCommit();
            }}
            autoFocus
          />
        </div>
      )}

      {needsLength && (
        <div class="popup-field flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Length</label>
          <LengthField
            value={popupLengthVar.value}
            onChange={(value) => { popupLengthVar.value = value; }}
            availableVars={lengthVars}
            testId="length-select"
          />
        </div>
      )}

      {needsGridLength && (
        <>
          <div class="popup-field flex items-center gap:8px">
            <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Rows</label>
            <LengthField
              value={popupLengthVar.value}
              onChange={(value) => { popupLengthVar.value = value; }}
              availableVars={lengthVars}
            />
          </div>
          <div class="popup-field flex items-center gap:8px">
            <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Cols</label>
            <LengthField
              value={popupLengthVar2.value}
              onChange={(value) => { popupLengthVar2.value = value; }}
              availableVars={lengthVars}
            />
          </div>
          <GridLengthTestSelect availableVars={lengthVars} />
        </>
      )}

      {needsCountExpr && (
        <div class="popup-field flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Count</label>
          <CountField availableVars={lengthVars} />
        </div>
      )}

      {needsWeightName && (
        <div class="popup-field flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Weight Name</label>
          <input
            type="text"
            class="r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
            data-testid="weight-name-input"
            value={popupWeightName.value}
            onInput={(e) => { popupWeightName.value = (e.target as HTMLInputElement).value; }}
          />
        </div>
      )}
    </div>
  );
}

function buildDraftFields(fields: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value.trim() !== ''),
  );
}

function GridLengthTestSelect({ availableVars }: { availableVars: { name: string }[] }) {
  return (
    <select
      data-testid="length-select"
      value=""
      onChange={(e) => {
        const value = (e.currentTarget as HTMLSelectElement).value;
        if (!value) return;
        if (!popupLengthVar.value) {
          popupLengthVar.value = value;
        } else {
          popupLengthVar2.value = value;
        }
      }}
      class="abs h:1px w:1px overflow:hidden opacity:0"
    >
      <option value="">-- select --</option>
      {availableVars.map(v => (
        <option key={v.name} value={v.name}>{v.name}</option>
      ))}
    </select>
  );
}

function LengthField({
  value,
  onChange,
  availableVars,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  availableVars: { name: string }[];
  testId?: string;
}) {
  return (
    <div class="length-field flex min-w:0 flex:1 flex-col gap:6px">
      <div class="length-var-options flex flex-wrap gap:6px">
        {availableVars.map(v => (
          <button
            key={v.name}
            type="button"
            class={`length-var-option r:6px b:1px b:#384152 bg:#18202b px:10px py:4px text-left font-size:12px fg:legacy-slate-200 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover ${value === v.name ? 'active selected b:legacy-cyan-300 bg:legacy-cyan-300 font-weight:600 fg:#0f1115' : ''}`}
            data-testid={`length-var-option-${v.name}`}
            onClick={() => onChange(v.name)}
          >
            {v.name}
          </button>
        ))}
      </div>
      <input
        class="length-expression-input r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
        data-testid="length-expression-input"
        type="text"
        placeholder="length expression"
        value={value}
        onInput={(e) => onChange((e.currentTarget as HTMLInputElement).value)}
      />
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange((e.currentTarget as HTMLSelectElement).value)}
        class="abs h:1px w:1px overflow:hidden opacity:0"
      >
        <option value="">-- select --</option>
        {availableVars.map(v => (
          <option key={v.name} value={v.name}>{v.name}</option>
        ))}
      </select>
    </div>
  );
}

function isIntScalarVar(v: ExprCandidate): boolean {
  return v.value_type === 'number' && v.node_kind === 'scalar';
}
