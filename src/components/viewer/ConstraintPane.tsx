import { constraintText, constraintAstMode } from '../../state';

export function ConstraintPane() {
  return (
    <div class="pane flex min-w:0 flex-col overflow:hidden bg:#0f1115">
      <div class="pane-header flex min-h:44px items-center justify-between bb:1px b:#2a2f3a bg:#151922 px:12px">
        <span class="pane-title font-size:11px font-weight:600 uppercase letter-spacing:0.16em fg:legacy-slate-400">Constraints</span>
        <button
          class={`toggle-btn r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover ${constraintAstMode.value ? 'active b:legacy-cyan-300 bg:legacy-cyan-300 fg:#0f1115' : ''}`}
          onClick={() => {
            constraintAstMode.value = !constraintAstMode.value;
          }}
        >
          AST
        </button>
      </div>
      <pre class="pane-content flex:1 overflow:auto white-space:pre-wrap overflow-wrap:break-word p:12px font:mono font-size:13px line-height:24px fg:legacy-slate-200">{constraintText.value}</pre>
    </div>
  );
}
