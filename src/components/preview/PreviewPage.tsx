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
    <div class="preview-page h:100% overflow:auto bg:#0f1115 p:16px">
      <div class="preview-grid grid grid-template-columns:repeat(auto-fill,minmax(350px,1fr)) gap:16px">
        {presets.map((p) => (
          <PreviewCard key={p.name} preset={p} />
        ))}
      </div>
    </div>
  );
}
