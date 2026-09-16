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
    <div class="tex-tab py:8px">
      {inputHtml && (
        <div class="tex-section mb:16px">
          <h4 class="tex-section-label mb:8px font-size:11px font-weight:600 uppercase letter-spacing:0.14em fg:legacy-slate-500">Input</h4>
          <div dangerouslySetInnerHTML={{ __html: inputHtml }} />
        </div>
      )}
      {constraintsHtml && (
        <div class="tex-section mb:16px">
          <h4 class="tex-section-label mb:8px font-size:11px font-weight:600 uppercase letter-spacing:0.14em fg:legacy-slate-500">Constraints</h4>
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
    <div class="pane flex min-w:0 flex-col overflow:hidden bg:#0f1115">
      <div class="pane-header flex min-h:44px items-center justify-between bb:1px b:#2a2f3a bg:#151922 px:12px">
        <span class="pane-title font-size:11px font-weight:600 uppercase letter-spacing:0.16em fg:legacy-slate-400">Preview</span>
        <div class="tab-buttons flex gap:6px">
          <button
            class={`tab-btn r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover ${activePreviewTab.value === 'tex' ? 'active b:legacy-cyan-300 bg:legacy-cyan-300 fg:#0f1115' : ''}`}
            onClick={() => { activePreviewTab.value = 'tex'; }}
          >
            TeX
          </button>
          <button
            class={`tab-btn r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover ${activePreviewTab.value === 'sample' ? 'active b:legacy-cyan-300 bg:legacy-cyan-300 fg:#0f1115' : ''}`}
            onClick={() => { activePreviewTab.value = 'sample'; }}
          >
            Sample
          </button>
        </div>
      </div>
      <div class="pane-content-scroll flex:1 overflow:auto p:12px">
        {activePreviewTab.value === 'tex' ? <TexTab /> : <SampleTab />}
      </div>
    </div>
  );
}
