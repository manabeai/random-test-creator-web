import { useState } from 'preact/hooks';
import { compose_constraint_expression } from '../wasm';
import { projection, type ExprCandidate } from './editor-state';

/** Local expression drafts only; Rust composes and serializes their AST. */
export function ConstraintExpressionTools({ value, onChange, variables, label }: {
  value: string;
  onChange: (value: string) => void;
  variables: ExprCandidate[];
  label: string;
}) {
  const [operation, setOperation] = useState('');
  const [operand, setOperand] = useState('');
  const [error, setError] = useState('');
  const operations = projection.value.constraints.expression_operations;
  const selectedOperation = operations.find(item => item.value === operation);
  const apply = () => {
    try {
      onChange(compose_constraint_expression(value, operation, operand));
      setOperation('');
      setOperand('');
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div class="rtc-expression-tools" data-testid="constraint-expression-tools">
      <span class="rtc-expression-label">{label}を組み立てる</span>
      {variables.length > 0 && (
        <div class="rtc-expression-choices" role="group" aria-label="参照する変数">
          <span>変数</span>
          {variables.map(variable => (
            <button type="button" key={variable.node_id} data-testid={`expression-variable-${variable.name}`}
              onClick={() => { onChange(variable.name); setError(''); }}>
              {variable.name}
            </button>
          ))}
        </div>
      )}
      <div class="rtc-expression-choices" role="group" aria-label="式全体に適用する演算">
        <span>演算</span>
        {operations.map(item => (
          <button type="button" key={item.value} data-testid={`expression-operation-${item.value}`}
            aria-pressed={operation === item.value} onClick={() => { setOperation(item.value); setError(''); }}>
            {item.label}
          </button>
        ))}
      </div>
      {selectedOperation && (
        <div class="rtc-expression-operand">
          <span class="rtc-expression-base" title={value}>{value || '式'}</span>
          <span>{selectedOperation.label}</span>
          <input key={operation} autoFocus data-testid="expression-operand-input" aria-label="演算の引数"
            placeholder="1、N、10^5" value={operand} onInput={event => setOperand(event.currentTarget.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') { event.preventDefault(); apply(); }
              if (event.key === 'Escape') { event.stopPropagation(); setOperation(''); }
            }} />
          <button type="button" data-testid="expression-operation-apply" onClick={apply}>式に反映</button>
        </div>
      )}
      {error && <p class="rtc-expression-error" role="alert">{error}</p>}
    </div>
  );
}
