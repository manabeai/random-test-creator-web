import { structureText, structureAstMode } from '../../state';

export function StructurePane() {
  return (
    <div class="pane">
      <div class="pane-header">
        <span class="pane-title">📝 入力形式</span>
        <button
          class={`toggle-btn ${structureAstMode.value ? 'active' : ''}`}
          onClick={() => {
            structureAstMode.value = !structureAstMode.value;
          }}
        >
          AST
        </button>
      </div>
      <pre class="pane-content">{structureText.value}</pre>
    </div>
  );
}
