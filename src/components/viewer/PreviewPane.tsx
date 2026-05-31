import { useMemo } from 'preact/hooks';
import {
  activePreviewTab,
  inputTexString,
  constraintsTexString,
  samplePreview,
} from '../../state';
import { SamplePreviewBlock } from '../SamplePreviewBlock';
import { renderInputTex, renderConstraintsTex } from '../../tex-renderer';

function TexTab() {
  const inputHtml = useMemo(
    () => renderInputTex(inputTexString.value),
    [inputTexString.value],
  );
  const constraintsHtml = useMemo(
    () => renderConstraintsTex(constraintsTexString.value),
    [constraintsTexString.value],
  );

  return (
    <div class="tex-tab py-2">
      {inputHtml && (
        <div class="tex-section mb-4">
          <h4 class="tex-section-label mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Input</h4>
          <div dangerouslySetInnerHTML={{ __html: inputHtml }} />
        </div>
      )}
      {constraintsHtml && (
        <div class="tex-section mb-4">
          <h4 class="tex-section-label mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Constraints</h4>
          <div dangerouslySetInnerHTML={{ __html: constraintsHtml }} />
        </div>
      )}
    </div>
  );
}

function SampleTab() {
  return <SamplePreviewBlock preview={samplePreview.value} />;
}

export function PreviewPane() {
  return (
    <div class="pane flex min-w-0 flex-col overflow-hidden bg-[#0f1115]">
      <div class="pane-header flex min-h-11 items-center justify-between border-b border-[#2a2f3a] bg-[#151922] px-3">
        <span class="pane-title text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Preview</span>
        <div class="tab-buttons flex gap-1.5">
          <button
            class={`tab-btn rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200 ${activePreviewTab.value === 'tex' ? 'active border-cyan-300 bg-cyan-300 text-[#0f1115]' : ''}`}
            onClick={() => { activePreviewTab.value = 'tex'; }}
          >
            TeX
          </button>
          <button
            class={`tab-btn rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200 ${activePreviewTab.value === 'sample' ? 'active border-cyan-300 bg-cyan-300 text-[#0f1115]' : ''}`}
            onClick={() => { activePreviewTab.value = 'sample'; }}
          >
            Sample
          </button>
        </div>
      </div>
      <div class="pane-content-scroll flex-1 overflow-auto p-3">
        {activePreviewTab.value === 'tex' ? <TexTab /> : <SampleTab />}
      </div>
    </div>
  );
}
