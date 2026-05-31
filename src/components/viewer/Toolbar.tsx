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
    <div class="toolbar flex flex-wrap items-center gap-4 border-t border-[#2a2f3a] bg-[#151922] px-4 py-2">
      <div class="toolbar-group flex items-center gap-2">
        <label class="toolbar-label text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Preset</label>
        <select
          class="toolbar-select min-w-56 rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 text-[13px] text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
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
      <div class="toolbar-group flex items-center gap-2">
        <label class="toolbar-label text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Seed</label>
        <input
          class="toolbar-input w-28 rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 font-mono text-[13px] text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
          type="number"
          min={0}
          max={4294967295}
          value={sampleSeed.value}
          onInput={(e) => {
            const val = parseInt((e.target as HTMLInputElement).value, 10);
            if (!isNaN(val) && val >= 0) sampleSeed.value = val;
          }}
        />
        <button class="toolbar-btn rounded-md border border-cyan-300 bg-cyan-300 px-3 py-1.5 text-[12px] font-semibold text-[#0f1115] transition hover:bg-sky-300" onClick={shuffleSeed}>Shuffle</button>
      </div>
      <div class="toolbar-status ml-auto text-[12px] text-slate-500">
        {documentJson.value ? 'Document loaded' : 'No document'}
      </div>
    </div>
  );
}
