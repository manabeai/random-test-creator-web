import { useMemo } from 'preact/hooks';
import { list_presets } from '../../wasm';
import { PreviewCard } from './PreviewCard';

interface PresetInfo {
  name: string;
  description: string;
}

export function PreviewPage() {
  const presets: PresetInfo[] = useMemo(() => JSON.parse(list_presets()), []);

  return (
    <div class="preview-page">
      <div class="preview-grid">
        {presets.map((p) => (
          <PreviewCard key={p.name} preset={p} />
        ))}
      </div>
    </div>
  );
}
