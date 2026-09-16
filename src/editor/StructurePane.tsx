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
      class={`pane flex min-w:0 flex-col overflow:hidden bg:#0f1115 ${folded ? 'folded' : ''} flex:none@<768px overflow:visible@<768px`}
      data-testid="structure-pane"
      onMouseLeave={closePopup}
    >
      <div class="pane-header flex min-h:44px items-center justify-between bb:1px b:#2a2f3a bg:#151922 px:12px">
        <span class="pane-title font-size:11px font-weight:600 uppercase letter-spacing:0.16em fg:legacy-slate-400">Structure</span>
        <button class="fold-toggle hide r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover inline-flex@<768px" onClick={toggleStructureFold} aria-label={folded ? 'Expand' : 'Collapse'}>
          {folded ? '▶' : '▼'}
        </button>
      </div>
      <div class={`pane-content-scroll flex:1 overflow:auto p:12px max-h:2000px@<768px overflow:hidden@<768px transition-property:max-height,opacity@<768px transition-duration:300ms@<768px ${folded ? 'max-h:0px@<768px py:0px@<768px opacity:0@<768px' : 'opacity:1@<768px'}`}>
        {proj.nodes.length === 0 && (
          <div class="structure-empty p:16px text-center">
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
                class="structure-line flex min-h:28px items-center gap:8px py:4px pr:8px"
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
            <div key={`below-${item.hotspot.parent_id}`} class="structure-node flex min-h:28px items-center gap:8px" style={{ paddingLeft: `${item.depth * 1.2}rem` }}>
              <HotspotButton hotspot={item.hotspot} />
            </div>
          );
        })}
        {proj.nodes.length > 0 && orphanBelowHotspots.map(h => (
          <div key={`orphan-below-${h.parent_id}`} class="structure-node flex min-h:28px items-center gap:8px">
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
      class="structure-node flex min-h:28px items-center gap:8px"
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
          class={`node-label font:mono font-size:13px fg:legacy-slate-100 ${node.is_hole ? 'node-hole italic fg:legacy-slate-500' : 'node-editable cursor:pointer r:4px px:4px legacy-transition bg:#202633:hover fg:legacy-cyan-200:hover'}`}
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
    <span class="node-inline-edit node-popup inline-flex items-center r:8px b:1px b:#2a2f3a bg:#151922 p:12px shadow:0|25px|50px|-12px|rgb(0|0|0/0.4) ">
      <span class="popup-fields flex flex-col gap:8px">
        <span class="popup-field flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Kind</label>
          <select
            class="node-edit-kind-select r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font-size:13px fg:legacy-slate-100 outline:none legacy-transition b:legacy-cyan-300:focus legacy-focus-ring "
            data-testid="node-edit-kind-select"
            value={kind}
            onChange={(e) => { nodeEditKind.value = (e.target as HTMLSelectElement).value as 'scalar' | 'array'; }}
          >
            {projection.value.nodes.find(node => node.id === nodeId)?.edit?.allowed_kinds.map(allowed => (
              <option key={allowed} value={allowed}>{allowed === 'scalar' ? 'Scalar' : 'Array'}</option>
            ))}
          </select>
        </span>
        <span class="popup-field flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Type</label>
          <select
            class="node-edit-type-select r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font-size:13px fg:legacy-slate-100 outline:none legacy-transition b:legacy-cyan-300:focus legacy-focus-ring "
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
        <span class="popup-field flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Name</label>
          <input
            type="text"
            class="node-edit-input w:96px r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
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
        <span class="popup-field node-edit-length flex items-center gap:8px">
          <label class="min-w:64px font-size:11px font-weight:600 uppercase letter-spacing:0.12em fg:legacy-slate-500">Length</label>
          {lengthVars.map(v => (
            <button
              key={v.node_id}
              class={`length-var-option r:6px b:1px b:#384152 bg:#18202b px:10px py:4px text-left font-size:12px fg:legacy-slate-200 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover ${length === v.name ? 'active selected b:legacy-cyan-300 bg:legacy-cyan-300 font-weight:600 fg:#0f1115' : ''}`}
              data-testid={`node-edit-length-var-option-${v.name}`}
              onClick={() => { nodeEditLength.value = v.name; }}
              type="button"
            >
              {v.name}
            </button>
          ))}
          <input
            class="length-expression-input r:6px b:1px b:#384152 bg:#18202b px:8px py:4px font:mono font-size:13px fg:legacy-slate-100 outline:none legacy-transition fg:legacy-slate-600::placeholder b:legacy-cyan-300:focus legacy-focus-ring "
            data-testid="node-edit-length-input"
            value={length}
            placeholder="length"
            onInput={(e) => { nodeEditLength.value = (e.target as HTMLInputElement).value; }}
          />
        </span>
      )}
      <button
        class="popup-confirm node-edit-confirm r:6px b:1px b:legacy-cyan-300 bg:legacy-cyan-300 px:12px py:6px font-size:12px font-weight:600 fg:#0f1115 legacy-transition bg:legacy-sky-300:hover cursor:not-allowed:disabled b:#384152:disabled bg:#202633:disabled fg:legacy-slate-500:disabled"
        data-testid="node-edit-confirm"
        disabled={!name.trim() || (kind === 'array' && !length.trim())}
        onClick={handleConfirm}
        type="button"
      >
        Confirm
      </button>
      <button class="node-edit-cancel r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover" onClick={closeNodeEdit} type="button">Cancel</button>
      </span>
    </span>
  );
}

function HotspotButton({ hotspot }: { hotspot: Hotspot }) {
  return (
    <button
      class={`hotspot-btn hotspot-${hotspot.direction} r:6px b:1px border-style:dashed b:legacy-cyan-300/0.8 px:6px py:2px font:mono font-size:11px fg:legacy-cyan-300 legacy-transition bg:legacy-cyan-300:hover fg:#0f1115:hover`}
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
