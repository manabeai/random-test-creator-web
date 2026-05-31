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
    <div class="preview-page h-full overflow-auto bg-[#0f1115] p-4">
      <div class="preview-grid grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
        {presets.map((p) => (
          <PreviewCard key={p.name} preset={p} />
        ))}
      </div>
    </div>
  );
}
