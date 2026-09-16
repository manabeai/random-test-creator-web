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
    <div class={`pane flex min-w:0 flex-col overflow:hidden bg:#0f1115 ${folded ? 'folded' : ''} flex:none@<768px overflow:visible@<768px`} data-testid="preview-pane">
      <div class="pane-header flex min-h:44px items-center justify-between bb:1px b:#2a2f3a bg:#151922 px:12px">
        <span class="pane-title font-size:11px font-weight:600 uppercase letter-spacing:0.16em fg:legacy-slate-400">Preview</span>
        <div class="pane-header-controls flex items-center gap:8px">
          <button class="toggle-btn r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover" onClick={() => shuffleSeed()}>
            Resample
          </button>
          <button class="fold-toggle hide r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover inline-flex@<768px" onClick={togglePreviewFold} aria-label={folded ? 'Expand' : 'Collapse'}>
            {folded ? '▶' : '▼'}
          </button>
        </div>
      </div>
      <div class={`pane-content-scroll flex:1 overflow:auto p:12px max-h:2000px@<768px overflow:hidden@<768px transition-property:max-height,opacity@<768px transition-duration:300ms@<768px ${folded ? 'max-h:0px@<768px py:0px@<768px opacity:0@<768px' : 'opacity:1@<768px'}`}>
        <div class="tex-section mb:16px">
          <div class="tex-section-label mb:8px font-size:11px font-weight:600 uppercase letter-spacing:0.14em fg:legacy-slate-500">Input Format</div>
          <div
            data-testid="tex-input-format"
            dangerouslySetInnerHTML={{ __html: renderInputTex(inputTex) }}
          />
        </div>
        <div class="tex-section mb:16px">
          <div class="tex-section-label mb:8px font-size:11px font-weight:600 uppercase letter-spacing:0.14em fg:legacy-slate-500">Constraints</div>
          <div
            data-testid="tex-constraints"
            dangerouslySetInnerHTML={{ __html: renderConstraintsTex(constraintsTex) }}
          />
        </div>
        <div class="tex-section mb:16px">
          <div class="tex-section-label mb:8px font-size:11px font-weight:600 uppercase letter-spacing:0.14em fg:legacy-slate-500">Sample</div>
          <SamplePreviewBlock preview={samplePreview.value} contentClass="sample-output white-space:pre-wrap font:mono font-size:13px line-height:24px fg:legacy-slate-100" />
        </div>
      </div>
    </div>
  );
}
