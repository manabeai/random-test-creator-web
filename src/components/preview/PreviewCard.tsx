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
    <div class="preview-card" onClick={handleClick}>
      <div class="card-header">
        <span class="card-title">📝 {preset.description}</span>
        <span class="card-name">{preset.name}</span>
      </div>
      <div class="card-section">
        <div class="card-section-label">Structure</div>
        <pre class="card-content">{data.structure}</pre>
      </div>
      <div class="card-section">
        <div class="card-section-label">Constraints</div>
        <pre class="card-content">{data.constraints}</pre>
      </div>
      <div class="card-section">
        <div class="card-section-label">Sample (seed=0)</div>
        <SamplePreviewBlock preview={data.sample} contentClass="card-content" />
      </div>
    </div>
  );
}
