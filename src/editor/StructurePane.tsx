/**
 * Structure pane: renders projected nodes and hotspots.
 */
import { projection, dispatchAction } from './editor-state';
import type { Hotspot, ProjectedNode, StructureLine } from './editor-state';
import {
  openPopup,
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
import { buildArrayFill, buildReplaceNode, buildScalarFill } from './action-builder';
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
    <div class={`pane ${folded ? 'folded' : ''}`} data-testid="structure-pane">
      <div class="pane-header">
        <span class="pane-title">Structure</span>
        <button class="fold-toggle" onClick={toggleStructureFold} aria-label={folded ? 'Expand' : 'Collapse'}>
          {folded ? '▶' : '▼'}
        </button>
      </div>
      <div class="pane-content-scroll">
        {proj.nodes.length === 0 && (
          <div class="structure-empty">
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
                class="structure-line"
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
            <div key={`below-${item.hotspot.parent_id}`} class="structure-node" style={{ paddingLeft: `${item.depth * 1.2}rem` }}>
              <HotspotButton hotspot={item.hotspot} />
            </div>
          );
        })}
        {proj.nodes.length > 0 && orphanBelowHotspots.map(h => (
          <div key={`orphan-below-${h.parent_id}`} class="structure-node">
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
      class="structure-node"
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
          class={`node-label ${node.is_hole ? 'node-hole' : 'node-editable'}`}
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
      const fill = kind === 'array'
        ? buildArrayFill(name.trim(), nodeEditType.value, length.trim(), proj.available_vars)
        : buildScalarFill(name.trim(), nodeEditType.value);
      dispatchAction(buildReplaceNode(nodeId, fill));
    }
    closeNodeEdit();
  };
  
  return (
    <span class="node-inline-edit node-popup">
      <span class="popup-fields">
        <span class="popup-field">
          <label>Kind</label>
          <select
            class="node-edit-kind-select"
            data-testid="node-edit-kind-select"
            value={kind}
            onChange={(e) => { nodeEditKind.value = (e.target as HTMLSelectElement).value as 'scalar' | 'array'; }}
          >
            {projection.value.nodes.find(node => node.id === nodeId)?.edit?.allowed_kinds.map(allowed => (
              <option key={allowed} value={allowed}>{allowed === 'scalar' ? 'Scalar' : 'Array'}</option>
            ))}
          </select>
        </span>
        <span class="popup-field">
          <label>Type</label>
          <select
            class="node-edit-type-select"
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
        <span class="popup-field">
          <label>Name</label>
          <input
            type="text"
            class="node-edit-input"
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
        <span class="popup-field node-edit-length">
          <label>Length</label>
          {lengthVars.map(v => (
            <button
              key={v.node_id}
              class={`length-var-option ${length === v.name ? 'active' : ''}`}
              data-testid={`node-edit-length-var-option-${v.name}`}
              onClick={() => { nodeEditLength.value = v.name; }}
              type="button"
            >
              {v.name}
            </button>
          ))}
          <input
            class="length-expression-input"
            data-testid="node-edit-length-input"
            value={length}
            placeholder="length"
            onInput={(e) => { nodeEditLength.value = (e.target as HTMLInputElement).value; }}
          />
        </span>
      )}
      <button
        class="popup-confirm node-edit-confirm"
        data-testid="node-edit-confirm"
        disabled={!name.trim() || (kind === 'array' && !length.trim())}
        onClick={handleConfirm}
        type="button"
      >
        Confirm
      </button>
      <button class="node-edit-cancel" onClick={closeNodeEdit} type="button">Cancel</button>
      </span>
    </span>
  );
}

function HotspotButton({ hotspot }: { hotspot: Hotspot }) {
  return (
    <button
      class={`hotspot-btn hotspot-${hotspot.direction}`}
      data-testid={`insertion-hotspot-${hotspot.direction}`}
      data-parent-id={hotspot.parent_id}
      data-hotspot-direction={hotspot.direction}
      onClick={() => openPopup(hotspot)}
    >
      {hotspot.direction === 'below' && '＋↓'}
      {hotspot.direction === 'right' && '＋→'}
      {hotspot.direction === 'inside' && '＋◇'}
      {hotspot.direction === 'variant' && '＋⑅'}
    </button>
  );
}
