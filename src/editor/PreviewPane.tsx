/**
 * Preview pane: renders TeX input format, TeX constraints, and sample output.
 */
import { SamplePreviewBlock } from '../components/SamplePreviewBlock';
import { inputTexString, constraintsTexString, samplePreview, shuffleSeed } from './editor-state';
import { renderInputTex, renderConstraintsTex } from '../tex-renderer';
import { previewFolded, togglePreviewFold } from './fold-state';

export function PreviewPane() {
  const inputTex = inputTexString.value;
  const constraintsTex = constraintsTexString.value;
  const folded = previewFolded.value;

  return (
    <div class={`pane flex min-w-0 flex-col overflow-hidden bg-[#0f1115] ${folded ? 'folded' : ''} max-md:flex-none max-md:overflow-visible`} data-testid="preview-pane">
      <div class="pane-header flex min-h-11 items-center justify-between border-b border-[#2a2f3a] bg-[#151922] px-3">
        <span class="pane-title text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Preview</span>
        <div class="pane-header-controls flex items-center gap-2">
          <button class="toggle-btn rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200" onClick={() => shuffleSeed()}>
            Resample
          </button>
          <button class="fold-toggle hidden rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200 max-md:inline-flex" onClick={togglePreviewFold} aria-label={folded ? 'Expand' : 'Collapse'}>
            {folded ? '▶' : '▼'}
          </button>
        </div>
      </div>
      <div class={`pane-content-scroll flex-1 overflow-auto p-3 max-md:max-h-[2000px] max-md:overflow-hidden max-md:transition-[max-height,opacity] max-md:duration-300 ${folded ? 'max-md:max-h-0 max-md:py-0 max-md:opacity-0' : 'max-md:opacity-100'}`}>
        <div class="tex-section mb-4">
          <div class="tex-section-label mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Input Format</div>
          <div
            data-testid="tex-input-format"
            dangerouslySetInnerHTML={{ __html: renderInputTex(inputTex) }}
          />
        </div>
        <div class="tex-section mb-4">
          <div class="tex-section-label mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Constraints</div>
          <div
            data-testid="tex-constraints"
            dangerouslySetInnerHTML={{ __html: renderConstraintsTex(constraintsTex) }}
          />
        </div>
        <div class="tex-section mb-4">
          <div class="tex-section-label mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Sample</div>
          <SamplePreviewBlock preview={samplePreview.value} contentClass="sample-output whitespace-pre-wrap font-mono text-[13px] leading-6 text-slate-100" />
        </div>
      </div>
    </div>
  );
}
