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
    <div class="tex-tab">
      {inputHtml && (
        <div class="tex-section">
          <h4 class="tex-section-label">入力</h4>
          <div dangerouslySetInnerHTML={{ __html: inputHtml }} />
        </div>
      )}
      {constraintsHtml && (
        <div class="tex-section">
          <h4 class="tex-section-label">制約</h4>
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
    <div class="pane">
      <div class="pane-header">
        <span class="pane-title">Preview</span>
        <div class="tab-buttons">
          <button
            class={`tab-btn ${activePreviewTab.value === 'tex' ? 'active' : ''}`}
            onClick={() => { activePreviewTab.value = 'tex'; }}
          >
            TeX
          </button>
          <button
            class={`tab-btn ${activePreviewTab.value === 'sample' ? 'active' : ''}`}
            onClick={() => { activePreviewTab.value = 'sample'; }}
          >
            Sample
          </button>
        </div>
      </div>
      <div class="pane-content-scroll">
        {activePreviewTab.value === 'tex' ? <TexTab /> : <SampleTab />}
      </div>
    </div>
  );
}
