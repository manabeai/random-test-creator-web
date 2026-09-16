import { useMemo } from 'preact/hooks';
import {
  get_preset,
  render_input_format,
  render_constraints_text,
  generate_sample,
} from '../../wasm';
import { loadPreset } from '../../state';
import {
  buildSamplePreview,
  samplePreviewFromGenerationError,
  type SamplePreview,
} from '../../sample-preview';
import { SamplePreviewBlock } from '../SamplePreviewBlock';

interface PresetInfo {
  name: string;
  description: string;
}

export function PreviewCard({ preset }: { preset: PresetInfo }) {
  const data = useMemo<{
    structure: string;
    constraints: string;
    sample: SamplePreview;
  }>(() => {
    try {
      const json = get_preset(preset.name);
      return {
        structure: render_input_format(json),
        constraints: render_constraints_text(json),
        sample: buildSamplePreview({
          documentJson: json,
          seed: 0,
          generateSample: generate_sample,
        }),
      };
    } catch (e) {
      return {
        structure: `Error: ${e}`,
        constraints: '',
        sample: samplePreviewFromGenerationError(e),
      };
    }
  }, [preset.name]);

  const handleClick = () => {
    loadPreset(preset.name);
    window.location.hash = '#/viewer';
  };

  return (
    <div class="preview-card cursor:pointer overflow:hidden r:8px b:1px b:#2a2f3a bg:#151922 legacy-transition translate:0|-2px:hover b:legacy-cyan-300/0.7:hover shadow:0|20px|25px|-5px|rgb(0|0|0/0.3),0|8px|10px|-6px|rgb(0|0|0/0.3):hover " onClick={handleClick}>
      <div class="card-header flex items-center justify-between bb:1px b:#2a2f3a bg:#18202b px:12px py:8px">
        <span class="card-title font-size:13px font-weight:600 fg:legacy-slate-100">{preset.description}</span>
        <span class="card-name font:mono font-size:11px fg:legacy-slate-500">{preset.name}</span>
      </div>
      <div class="card-section bb:1px b:#2a2f3a px:12px py:8px">
        <div class="card-section-label mb:4px font-size:11px font-weight:600 uppercase letter-spacing:0.14em fg:legacy-slate-500">Structure</div>
        <pre class="card-content max-h:96px overflow:hidden white-space:pre-wrap font:mono font-size:12px line-height:20px fg:legacy-slate-300">{data.structure}</pre>
      </div>
      <div class="card-section bb:1px b:#2a2f3a px:12px py:8px">
        <div class="card-section-label mb:4px font-size:11px font-weight:600 uppercase letter-spacing:0.14em fg:legacy-slate-500">Constraints</div>
        <pre class="card-content max-h:96px overflow:hidden white-space:pre-wrap font:mono font-size:12px line-height:20px fg:legacy-slate-300">{data.constraints}</pre>
      </div>
      <div class="card-section px:12px py:8px">
        <div class="card-section-label mb:4px font-size:11px font-weight:600 uppercase letter-spacing:0.14em fg:legacy-slate-500">Sample (seed=0)</div>
        <SamplePreviewBlock preview={data.sample} contentClass="card-content max-h:96px overflow:hidden white-space:pre-wrap font:mono font-size:12px line-height:20px fg:legacy-slate-300" />
      </div>
    </div>
  );
}
