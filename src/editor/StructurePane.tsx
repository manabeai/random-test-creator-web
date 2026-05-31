/**
 * Structure pane: renders projected nodes and hotspots.
 */
import { projection, dispatchAction } from './editor-state';
import type { Hotspot, ProjectedNode, StructureLine } from './editor-state';
import {
  openPopup,
  closePopup,
  popupState,
  nodeEditState,
  nodeEditName,
  nodeEditKind,
  nodeEditType,
  nodeEditLength,
  openNodeEdit,
  closeNodeEdit,
} from './popup-state';
import { NodePopup } from './NodePopup';
import { buildReplaceActionFromDraft } from './action-builder';
import { structureFolded, toggleStructureFold } from './fold-state';

type RenderItem =
  | { type: 'line'; line: StructureLine; nodeHotspots: Map<string, Hotspot[]> }
  | { type: 'below'; hotspot: Hotspot; depth: number };

/**
 * Build an interleaved list of nodes and deferred "below" hotspots.
 * "below" hotspots are placed after their parent's subtree ends (not inline
 * with the parent node), so that DOM order matches visual nesting order.
 */
function buildRenderItems(
  lines: StructureLine[],
  hotspotsByParent: Map<string, Hotspot[]>,
): RenderItem[] {
  const items: RenderItem[] = [];
  const pendingBelow: { depth: number; hotspot: Hotspot }[] = [];

  for (const line of lines) {
    // Flush pending "below" hotspots whose subtree just ended
    while (pendingBelow.length > 0) {
      const top = pendingBelow[pendingBelow.length - 1];
      if (top.depth >= line.depth) {
        pendingBelow.pop();
        items.push({ type: 'below', hotspot: top.hotspot, depth: top.depth + 1 });
      } else {
        break;
      }
    }

    const nodeHotspots = new Map<string, Hotspot[]>();
    const belowHotspots: { depth: number; hotspot: Hotspot }[] = [];

    for (const node of line.nodes) {
      const hotspots = hotspotsByParent.get(node.id) ?? [];
      const belowHotspot = hotspots.find(h => h.direction === 'below');
      const otherHotspots = hotspots.filter(h => h.direction !== 'below');
      nodeHotspots.set(node.id, otherHotspots);
      if (belowHotspot) {
        belowHotspots.push({ depth: line.depth, hotspot: belowHotspot });
      }
    }

    items.push({ type: 'line', line, nodeHotspots });
    pendingBelow.push(...belowHotspots);
  }

  // Flush remaining (deepest first)
  while (pendingBelow.length > 0) {
    const top = pendingBelow.pop()!;
    items.push({ type: 'below', hotspot: top.hotspot, depth: top.depth + 1 });
  }

  return items;
}

export function StructurePane() {
  const proj = projection.value;
  const visibleNodeIds = new Set(proj.nodes.map(node => node.id));
  const orphanBelowHotspots = proj.hotspots.filter(
    h => h.direction === 'below' && !visibleNodeIds.has(h.parent_id),
  );

  const hotspotsByParent = new Map<string, Hotspot[]>();
  for (const h of proj.hotspots) {
    const list = hotspotsByParent.get(h.parent_id) ?? [];
    list.push(h);
    hotspotsByParent.set(h.parent_id, list);
  }

  const lines = proj.structure_lines.length > 0 ? proj.structure_lines : proj.nodes.map(node => ({
    depth: node.depth,
    nodes: [node],
  }));

  const items = lines.length > 0
    ? buildRenderItems(lines, hotspotsByParent)
    : [];

  const folded = structureFolded.value;

  return (
    <div
      class={`pane flex min-w-0 flex-col overflow-hidden bg-[#0f1115] ${folded ? 'folded' : ''} max-md:flex-none max-md:overflow-visible`}
      data-testid="structure-pane"
      onMouseLeave={closePopup}
    >
      <div class="pane-header flex min-h-11 items-center justify-between border-b border-[#2a2f3a] bg-[#151922] px-3">
        <span class="pane-title text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Structure</span>
        <button class="fold-toggle hidden rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200 max-md:inline-flex" onClick={toggleStructureFold} aria-label={folded ? 'Expand' : 'Collapse'}>
          {folded ? '▶' : '▼'}
        </button>
      </div>
      <div class={`pane-content-scroll flex-1 overflow-auto p-3 max-md:max-h-[2000px] max-md:overflow-hidden max-md:transition-[max-height,opacity] max-md:duration-300 ${folded ? 'max-md:max-h-0 max-md:py-0 max-md:opacity-0' : 'max-md:opacity-100'}`}>
        {proj.nodes.length === 0 && (
          <div class="structure-empty p-4 text-center">
            {proj.hotspots.filter(h => h.direction === 'below').map(h => (
              <HotspotButton key={`below-${h.parent_id}`} hotspot={h} />
            ))}
          </div>
        )}
        {items.map(item => {
          if (item.type === 'line') {
            return (
              <div
                key={item.line.nodes.map(node => node.id).join('-')}
                class="structure-line flex min-h-7 items-center gap-2 py-1 pr-2"
                style={{ paddingLeft: `${item.line.depth * 1.2}rem` }}
              >
                {item.line.nodes.map(node => (
                  <StructureNodeView
                    key={node.id}
                    node={node}
                    hotspots={item.nodeHotspots.get(node.id) ?? []}
                  />
                ))}
              </div>
            );
          }
          return (
            <div key={`below-${item.hotspot.parent_id}`} class="structure-node flex min-h-7 items-center gap-2" style={{ paddingLeft: `${item.depth * 1.2}rem` }}>
              <HotspotButton hotspot={item.hotspot} />
            </div>
          );
        })}
        {proj.nodes.length > 0 && orphanBelowHotspots.map(h => (
          <div key={`orphan-below-${h.parent_id}`} class="structure-node flex min-h-7 items-center gap-2">
            <HotspotButton hotspot={h} />
          </div>
        ))}

        {popupState.value.step !== 'closed' && <NodePopup />}
      </div>
    </div>
  );
}

function StructureNodeView({ node, hotspots }: { node: ProjectedNode; hotspots: Hotspot[] }) {
  const editState = nodeEditState.value;
  const isEditing = editState.step === 'editing' && editState.nodeId === node.id;

  return (
    <div
      class="structure-node flex min-h-7 items-center gap-2"
      data-testid={`structure-node-${node.id}`}
      data-node-id={node.id}
      data-node-label={node.label}
    >
      {isEditing ? (
        <NodeInlineEdit
          nodeId={node.id}
          currentLabel={node.label}
        />
      ) : (
        <span
          class={`node-label font-mono text-[13px] text-slate-100 ${node.is_hole ? 'node-hole italic text-slate-500' : 'node-editable cursor-pointer rounded px-1 transition hover:bg-[#202633] hover:text-cyan-200'}`}
          onClick={() => {
            if (node.edit) {
              openNodeEdit(node);
            }
          }}
        >
          {node.label}
        </span>
      )}
      {hotspots.map(h => (
        <HotspotButton key={`${h.direction}-${h.parent_id}`} hotspot={h} />
      ))}
    </div>
  );
}

function NodeInlineEdit({ nodeId }: { nodeId: string; currentLabel: string }) {
  const proj = projection.value;
  const name = nodeEditName.value;
  const kind = nodeEditKind.value;
  const length = nodeEditLength.value;
  const lengthVars = proj.available_vars.filter(v => v.value_type === 'number' && v.node_kind === 'scalar');
  
  const handleConfirm = () => {
    if (name.trim() && (kind === 'scalar' || length.trim())) {
      const fields: Record<string, string> = {
        name: name.trim(),
        type: nodeEditType.value,
      };
      if (kind === 'array') fields.length = length.trim();
      dispatchAction(buildReplaceActionFromDraft(nodeId, kind, fields, proj.available_vars));
    }
    closeNodeEdit();
  };
  
  return (
    <span class="node-inline-edit node-popup inline-flex items-center rounded-lg border border-[#2a2f3a] bg-[#151922] p-3 shadow-2xl shadow-black/40">
      <span class="popup-fields flex flex-col gap-2">
        <span class="popup-field flex items-center gap-2">
          <label class="min-w-16 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Kind</label>
          <select
            class="node-edit-kind-select rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 text-[13px] text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
            data-testid="node-edit-kind-select"
            value={kind}
            onChange={(e) => { nodeEditKind.value = (e.target as HTMLSelectElement).value as 'scalar' | 'array'; }}
          >
            {projection.value.nodes.find(node => node.id === nodeId)?.edit?.allowed_kinds.map(allowed => (
              <option key={allowed} value={allowed}>{allowed === 'scalar' ? 'Scalar' : 'Array'}</option>
            ))}
          </select>
        </span>
        <span class="popup-field flex items-center gap-2">
          <label class="min-w-16 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Type</label>
          <select
            class="node-edit-type-select rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 text-[13px] text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
            data-testid="node-edit-type-select"
            value={nodeEditType.value}
            onChange={(e) => { nodeEditType.value = (e.target as HTMLSelectElement).value; }}
          >
            {projection.value.nodes.find(node => node.id === nodeId)?.edit?.allowed_types.map(allowed => (
              <option key={allowed} value={allowed}>
                {allowed === 'number' ? 'Number' : allowed === 'char' ? 'Char' : 'String'}
              </option>
            ))}
          </select>
        </span>
        <span class="popup-field flex items-center gap-2">
          <label class="min-w-16 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Name</label>
          <input
            type="text"
            class="node-edit-input w-24 rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 font-mono text-[13px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
            data-testid="node-edit-input"
            value={name}
            onInput={(e) => { nodeEditName.value = (e.target as HTMLInputElement).value; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
              if (e.key === 'Escape') closeNodeEdit();
            }}
            autoFocus
          />
        </span>
      {kind === 'array' && (
        <span class="popup-field node-edit-length flex items-center gap-2">
          <label class="min-w-16 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Length</label>
          {lengthVars.map(v => (
            <button
              key={v.node_id}
              class={`length-var-option rounded-md border border-[#384152] bg-[#18202b] px-2.5 py-1 text-left text-[12px] text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 ${length === v.name ? 'active selected border-cyan-300 bg-cyan-300 font-semibold text-[#0f1115]' : ''}`}
              data-testid={`node-edit-length-var-option-${v.name}`}
              onClick={() => { nodeEditLength.value = v.name; }}
              type="button"
            >
              {v.name}
            </button>
          ))}
          <input
            class="length-expression-input rounded-md border border-[#384152] bg-[#18202b] px-2 py-1 font-mono text-[13px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
            data-testid="node-edit-length-input"
            value={length}
            placeholder="length"
            onInput={(e) => { nodeEditLength.value = (e.target as HTMLInputElement).value; }}
          />
        </span>
      )}
      <button
        class="popup-confirm node-edit-confirm rounded-md border border-cyan-300 bg-cyan-300 px-3 py-1.5 text-[12px] font-semibold text-[#0f1115] transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:border-[#384152] disabled:bg-[#202633] disabled:text-slate-500"
        data-testid="node-edit-confirm"
        disabled={!name.trim() || (kind === 'array' && !length.trim())}
        onClick={handleConfirm}
        type="button"
      >
        Confirm
      </button>
      <button class="node-edit-cancel rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200" onClick={closeNodeEdit} type="button">Cancel</button>
      </span>
    </span>
  );
}

function HotspotButton({ hotspot }: { hotspot: Hotspot }) {
  return (
    <button
      class={`hotspot-btn hotspot-${hotspot.direction} rounded-md border border-dashed border-cyan-300/80 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300 transition hover:bg-cyan-300 hover:text-[#0f1115]`}
      data-testid={`insertion-hotspot-${hotspot.direction}`}
      data-parent-id={hotspot.parent_id}
      data-hotspot-direction={hotspot.direction}
      onMouseEnter={() => openPopup(hotspot)}
      onClick={() => openPopup(hotspot)}
    >
      {hotspot.direction === 'below' && '＋↓'}
      {hotspot.direction === 'right' && '＋→'}
      {hotspot.direction === 'inside' && '＋◇'}
      {hotspot.direction === 'variant' && '＋⑅'}
    </button>
  );
}
