import { useMemo } from 'preact/hooks';
import {
  activePreset,
  sampleSeed,
  loadPreset,
  shuffleSeed,
  documentJson,
} from '../../state';
import { list_presets } from '../../wasm';

interface PresetInfo {
  name: string;
  description: string;
}

export function Toolbar() {
  const presets: PresetInfo[] = useMemo(() => JSON.parse(list_presets()), []);

  return (
    <div class="toolbar">
      <div class="toolbar-group">
        <label class="toolbar-label">Preset:</label>
        <select
          class="toolbar-select"
          value={activePreset.value}
          onChange={(e) => loadPreset((e.target as HTMLSelectElement).value)}
        >
          {presets.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} — {p.description}
            </option>
          ))}
        </select>
      </div>
      <div class="toolbar-group">
        <label class="toolbar-label">Seed:</label>
        <input
          class="toolbar-input"
          type="number"
          min={0}
          max={4294967295}
          value={sampleSeed.value}
          onInput={(e) => {
            const val = parseInt((e.target as HTMLInputElement).value, 10);
            if (!isNaN(val) && val >= 0) sampleSeed.value = val;
          }}
        />
        <button class="toolbar-btn" onClick={shuffleSeed}>🔀 Shuffle</button>
      </div>
      <div class="toolbar-status">
        {documentJson.value ? '✓ Document loaded' : '— No document'}
      </div>
    </div>
  );
}
