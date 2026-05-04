import { constraintText, constraintAstMode } from '../../state';

export function ConstraintPane() {
  return (
    <div class="pane">
      <div class="pane-header">
        <span class="pane-title">📋 制約</span>
        <button
          class={`toggle-btn ${constraintAstMode.value ? 'active' : ''}`}
          onClick={() => {
            constraintAstMode.value = !constraintAstMode.value;
          }}
        >
          AST
        </button>
      </div>
      <pre class="pane-content">{constraintText.value}</pre>
    </div>
  );
}
