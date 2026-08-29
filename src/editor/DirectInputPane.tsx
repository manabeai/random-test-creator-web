import type { JSX } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  projection,
  type Hotspot,
  type InputFormatLineProjection,
  type ProjectedNode,
} from './editor-state';
import { popupState, openPopup, closePopup } from './popup-state';
import { selectedNodeId } from './workbench-state';
import { renderEditableInputLine } from '../tex-renderer';
import { VariableEditor } from './VariableEditor';
import { NodeInspector } from './NodeInspector';
import { NodePopup } from './NodePopup';
import { WorkbenchIcon } from './WorkbenchIcon';

export function DirectInputPane() {
  const proj = projection.value;
  const selectedId = selectedNodeId.value;
  const selectedNode = selectedId ? proj.nodes.find(node => node.id === selectedId) : undefined;
  const visibleNodeIds = new Set(proj.nodes.map(node => node.id));
  const rootHotspot = proj.hotspots.find(
    hotspot => hotspot.direction === 'below' && !visibleNodeIds.has(hotspot.parent_id),
  ) ?? proj.hotspots.find(hotspot => hotspot.direction === 'below');
  const terminalHotspots = proj.hotspots.filter(hotspot => hotspot.direction === 'right');
  const nestedHotspots = proj.hotspots.filter(
    hotspot => hotspot !== rootHotspot && hotspot.direction !== 'right',
  );
  const popup = popupState.value;
  const inspectorLineIndex = selectedId
    ? proj.input_format.lines.findIndex(line => line.node_ids.includes(selectedId))
    : -1;

  const selectTarget = (eventTarget: EventTarget | null) => {
    const target = (eventTarget as Element | null)?.closest<HTMLElement>('[data-node-id]');
    if (!target) return;
    const nodeId = target.dataset.nodeId;
    if (!nodeId) return;
    closePopup();
    selectedNodeId.value = nodeId;
  };

  const selectFromLine = (event: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    selectTarget(event.target);
  };

  const selectFromKeyboard = (event: JSX.TargetedKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!(event.target as Element).closest('[data-node-id]')) return;
    event.preventDefault();
    selectTarget(event.target);
  };

  return (
    <section class="rtc-format-pane" data-testid="format-pane" aria-label="入力形式">
      <div class="rtc-format-canvas" data-testid="structure-pane">
        <div class="rtc-format-lines">
          {proj.input_format.lines.length === 0 && rootHotspot && (
            <div class="rtc-empty-format">
              <HotspotButton hotspot={rootHotspot} kind="gutter" />
            </div>
          )}

          {proj.input_format.lines.map((line, index) => {
            const terminal = terminalHotspots.find(hotspot => line.node_ids.includes(hotspot.parent_id));
            return (
              <FormatLineGroup
                key={`${index}-${line.tex}`}
                line={line}
                index={index}
                rootHotspot={rootHotspot}
                terminal={terminal}
                selectedId={selectedId}
                selectedNode={selectedNode}
                renderInspector={index === inspectorLineIndex && Boolean(selectedNode?.edit)}
                onSelectFromLine={selectFromLine}
                onSelectFromKeyboard={selectFromKeyboard}
              />
            );
          })}

          {popup.step === 'candidates' && <VariableEditor hotspot={popup.hotspot} />}
          {popup.step === 'fields' && <div class="rtc-advanced-popover"><NodePopup /></div>}

          {nestedHotspots.length > 0 && (
            <div class="rtc-nested-actions" aria-label="構造の挿入点">
              {nestedHotspots.map((hotspot, index) => (
                <HotspotButton key={`${hotspot.direction}-${hotspot.parent_id}-${index}`} hotspot={hotspot} kind="nested" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FormatLineGroup({
  line,
  index,
  rootHotspot,
  terminal,
  selectedId,
  selectedNode,
  renderInspector,
  onSelectFromLine,
  onSelectFromKeyboard,
}: {
  line: InputFormatLineProjection;
  index: number;
  rootHotspot?: Hotspot;
  terminal?: Hotspot;
  selectedId: string | null;
  selectedNode?: ProjectedNode;
  renderInspector: boolean;
  onSelectFromLine: (event: JSX.TargetedMouseEvent<HTMLDivElement>) => void;
  onSelectFromKeyboard: (event: JSX.TargetedKeyboardEvent<HTMLDivElement>) => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [anchorOffset, setAnchorOffset] = useState(57);

  useLayoutEffect(() => {
    if (!renderInspector || !selectedId) return;
    let frame = 0;
    const measure = () => {
      const group = groupRef.current;
      const token = group?.querySelector<HTMLElement>(`[data-node-id="${selectedId}"]`);
      const inspector = group?.querySelector<HTMLElement>('.rtc-node-inspector');
      if (!token || !inspector) return;
      const tokenRect = token.getBoundingClientRect();
      const inspectorRect = inspector.getBoundingClientRect();
      const next = Math.max(18, Math.min(inspectorRect.width - 40, tokenRect.left + tokenRect.width / 2 - inspectorRect.left - 11));
      setAnchorOffset(current => Math.abs(current - next) > 0.5 ? next : current);
    };
    frame = window.requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [line.tex, renderInspector, selectedId]);

  return (
    <div class="rtc-format-group" ref={groupRef}>
      <div class="rtc-format-row" data-testid="input-format-line">
        <div class="rtc-line-gutter">
          {index === 0 && rootHotspot
            ? <HotspotButton hotspot={rootHotspot} kind="gutter" />
            : <span aria-hidden="true" />}
        </div>
        <div
          class="rtc-format-math"
          style={{ paddingLeft: `${line.depth * 22}px` }}
          dangerouslySetInnerHTML={{ __html: renderEditableInputLine(line.tex, selectedId) }}
          onClick={onSelectFromLine}
          onKeyDown={onSelectFromKeyboard}
        />
        {terminal && <HotspotButton hotspot={terminal} kind="terminal" />}
      </div>
      {renderInspector && selectedNode && (
        <NodeInspector
          key={`${selectedNode.id}-${selectedNode.edit?.kind}-${selectedNode.edit?.base_type}-${selectedNode.edit?.name}-${selectedNode.edit?.horizontal.length_expr ?? ''}-${selectedNode.edit?.vertical.length_expr ?? ''}`}
          node={selectedNode}
          anchorOffset={anchorOffset}
        />
      )}
    </div>
  );
}

function HotspotButton({ hotspot, kind }: { hotspot: Hotspot; kind: 'gutter' | 'terminal' | 'nested' }) {
  const label = hotspot.direction === 'right'
    ? 'この行の末尾に値を追加'
    : hotspot.direction === 'inside'
      ? 'この構造の内側に追加'
      : hotspot.direction === 'variant'
        ? '分岐を追加'
        : '行を追加';
  return (
    <button
      type="button"
      class={`rtc-add-point rtc-add-point--${kind}`}
      data-testid={`insertion-hotspot-${hotspot.direction}`}
      data-parent-id={hotspot.parent_id}
      aria-label={label}
      title={label}
      onClick={() => {
        selectedNodeId.value = null;
        openPopup(hotspot);
      }}
    >
      <WorkbenchIcon name="plus" />
    </button>
  );
}
