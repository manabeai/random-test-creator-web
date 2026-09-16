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
    <div class="toolbar flex flex-wrap items-center gap:16px bt:1px b:#2a2f3a bg:#151922 px:16px py:8px">
      <div class="toolbar-group flex items-center gap:8px">
        <label class="toolbar-label font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Preset</label>
        <select
          class="toolbar-select min-w:224px r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font-size:13px fg:legacy-slate-100 outline:none legacy-transition b:legacy-cyan-300:focus legacy-focus-ring "
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
      <div class="toolbar-group flex items-center gap:8px">
        <label class="toolbar-label font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Seed</label>
        <input
          class="toolbar-input w:112px r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition b:legacy-cyan-300:focus legacy-focus-ring "
          type="number"
          min={0}
          max={4294967295}
          value={sampleSeed.value}
          onInput={(e) => {
            const val = parseInt((e.target as HTMLInputElement).value, 10);
            if (!isNaN(val) && val >= 0) sampleSeed.value = val;
          }}
        />
        <button class="toolbar-btn r:6px b:1px b:legacy-cyan-300 bg:legacy-cyan-300 px:12px py:6px font-size:12px font-weight:600 fg:#0f1115 legacy-transition bg:legacy-sky-300:hover" onClick={shuffleSeed}>Shuffle</button>
      </div>
      <div class="toolbar-status ml:auto font-size:12px fg:legacy-slate-500">
        {documentJson.value ? 'Document loaded' : 'No document'}
      </div>
    </div>
  );
}
