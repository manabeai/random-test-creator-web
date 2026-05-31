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
    <div class="preview-card cursor-pointer overflow-hidden rounded-lg border border-[#2a2f3a] bg-[#151922] transition hover:-translate-y-0.5 hover:border-cyan-300/70 hover:shadow-xl hover:shadow-black/30" onClick={handleClick}>
      <div class="card-header flex items-center justify-between border-b border-[#2a2f3a] bg-[#18202b] px-3 py-2">
        <span class="card-title text-[13px] font-semibold text-slate-100">{preset.description}</span>
        <span class="card-name font-mono text-[11px] text-slate-500">{preset.name}</span>
      </div>
      <div class="card-section border-b border-[#2a2f3a] px-3 py-2">
        <div class="card-section-label mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Structure</div>
        <pre class="card-content max-h-24 overflow-hidden whitespace-pre-wrap font-mono text-[12px] leading-5 text-slate-300">{data.structure}</pre>
      </div>
      <div class="card-section border-b border-[#2a2f3a] px-3 py-2">
        <div class="card-section-label mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Constraints</div>
        <pre class="card-content max-h-24 overflow-hidden whitespace-pre-wrap font-mono text-[12px] leading-5 text-slate-300">{data.constraints}</pre>
      </div>
      <div class="card-section px-3 py-2">
        <div class="card-section-label mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Sample (seed=0)</div>
        <SamplePreviewBlock preview={data.sample} contentClass="card-content max-h-24 overflow-hidden whitespace-pre-wrap font-mono text-[12px] leading-5 text-slate-300" />
      </div>
    </div>
  );
}
