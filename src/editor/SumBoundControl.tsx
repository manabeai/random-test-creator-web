import { useState } from 'preact/hooks';
import { buildConstraintActionsFromDraft } from './action-builder';
import { dispatchActions, documentJson, editorError, projection, type ConstraintItem } from './editor-state';
import { ConstraintExpressionTools } from './ConstraintExpressionTools';

export function SumBoundControl({ item, onCommitted }: { item?: ConstraintItem; onCommitted?: () => void }) {
  const candidates = projection.value.constraints.sum_bound_targets;
  const [targetName, setTargetName] = useState(item?.target_name ?? '');
  const [upper, setUpper] = useState(item?.edit?.kind === 'SumBound' ? item.edit.upper : '');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [error, setError] = useState('');
  const target = candidates.find(candidate => candidate.name === targetName);
  const variables = item?.expression_variables ?? projection.value.constraints.items.find(row => row.target_id === target?.node_id)?.expression_variables ?? [];

  const commit = () => {
    if (!target) { setError('総和の対象を選んでください'); return; }
    try {
      const actions = buildConstraintActionsFromDraft({
        targetId: target.node_id, template: 'SumBound', existingConstraintId: item?.constraint_id,
        overVar: target.name, upper,
      }, documentJson.value);
      if (!dispatchActions(actions)) { setError(editorError.value); return; }
      setError('');
      onCommitted?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div class="rtc-sum-editor" onClick={event => event.stopPropagation()}>
      <div class="rtc-sum-control">
        <label>
          <span>総和の対象</span>
          {item ? <span class="rtc-sum-target">Σ {item.target_name}</span> : (
            <select data-testid="sumbound-var-select" aria-label="総和対象" value={targetName}
              onChange={event => { setTargetName(event.currentTarget.value); setError(''); }}>
              <option value="">対象を選択</option>
              {candidates.map(candidate => <option key={candidate.node_id} value={candidate.name}>{candidate.name}</option>)}
            </select>
          )}
        </label>
        <span aria-hidden="true">≤</span>
        <label>
          <span>上限の数式</span>
          <input data-testid={item ? 'sumbound-edit-upper-input' : 'sumbound-upper-input'}
            aria-label="総和の上限" value={upper} placeholder="2 * 10^5" aria-invalid={!!error}
            onInput={event => { setUpper(event.currentTarget.value); setError(''); }}
            onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); commit(); } }} />
        </label>
      </div>
      <div class="rtc-expression-actions">
        <button type="button" class="rtc-expression-toggle" aria-expanded={toolsOpen} onClick={() => setToolsOpen(open => !open)}>変数・演算から入力</button>
        <button type="button" class="rtc-expression-commit" data-testid={item ? 'sumbound-edit-apply' : 'sumbound-apply'} onClick={commit}>
          {item ? '変更を適用' : '総和を追加'}
        </button>
      </div>
      {toolsOpen && <ConstraintExpressionTools key={targetName} label="総和の上限" value={upper} onChange={setUpper} variables={variables} />}
      {error && <p class="rtc-expression-error" role="alert" data-testid="constraint-expression-error">{error}</p>}
    </div>
  );
}
