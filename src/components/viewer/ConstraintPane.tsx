import { constraintText, constraintAstMode } from '../../state';

export function ConstraintPane() {
  return (
    <div class="pane flex min-w-0 flex-col overflow-hidden bg-[#0f1115]">
      <div class="pane-header flex min-h-11 items-center justify-between border-b border-[#2a2f3a] bg-[#151922] px-3">
        <span class="pane-title text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Constraints</span>
        <button
          class={`toggle-btn rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200 ${constraintAstMode.value ? 'active border-cyan-300 bg-cyan-300 text-[#0f1115]' : ''}`}
          onClick={() => {
            constraintAstMode.value = !constraintAstMode.value;
          }}
        >
          AST
        </button>
      </div>
      <pre class="pane-content flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-6 text-slate-200">{constraintText.value}</pre>
    </div>
  );
}
