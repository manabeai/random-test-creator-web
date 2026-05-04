/**
 * Unit tests for action-builder.ts
 */
import { describe, it, expect } from 'vitest';
import {
  buildScalarFill,
  buildArrayFill,
  buildRepeatFill,
  buildGridTemplateFill,
  buildEdgeListFill,
  buildWeightedEdgeListFill,
  buildQueryListFill,
  buildMultiTestCaseFill,
  buildAddSlotElement,
  buildAddSibling,
  buildFillHole,
  buildAddChoiceVariant,
  buildAddConstraintRange,
  buildAddConstraintProperty,
  buildAddConstraintSumBound,
  buildAddConstraintCharSet,
  buildHotspotAction,
  buildFillFromPopup,
} from '../../src/editor/action-builder';
import type { ExprCandidate } from '../../src/editor/editor-state';

const VARS: ExprCandidate[] = [
  { name: 'N', node_id: '1', value_type: 'number', node_kind: 'scalar' },
  { name: 'M', node_id: '2', value_type: 'number', node_kind: 'scalar' },
];

describe('FillContent builders', () => {
  it('builds Scalar fill with type mapping', () => {
    const fill = buildScalarFill('N', 'number');
    expect(fill).toEqual({ kind: 'Scalar', name: 'N', typ: 'Int' });
  });

  it('maps "string" to "Str"', () => {
    const fill = buildScalarFill('S', 'string');
    expect(fill.typ).toBe('Str');
  });

  it('maps "char" to "Char"', () => {
    const fill = buildScalarFill('C', 'char');
    expect(fill.typ).toBe('Char');
  });

  it('builds Array fill with RefVar length', () => {
    const fill = buildArrayFill('A', 'number', 'N', VARS);
    expect(fill).toEqual({
      kind: 'Array',
      name: 'A',
      element_type: 'Int',
      length: { kind: 'RefVar', node_id: '1' },
    });
  });

  it('builds GridTemplate fill', () => {
    const fill = buildGridTemplateFill('N', 'M', VARS);
    expect(fill).toEqual({
      kind: 'GridTemplate',
      name: 'S',
      rows: { kind: 'RefVar', node_id: '1' },
      cols: { kind: 'RefVar', node_id: '2' },
      cell_type: 'Char',
    });
  });

  it('builds Repeat fill', () => {
    const fill = buildRepeatFill('N', VARS);
    expect(fill).toEqual({
      kind: 'Repeat',
      count: { kind: 'RefVar', node_id: '1' },
    });
  });

  it('builds EdgeList fill with Expr', () => {
    const fill = buildEdgeListFill('N-1');
    expect(fill).toEqual({
      kind: 'EdgeList',
      edge_count: { kind: 'Expr', expr: 'N-1' },
    });
  });

  it('builds WeightedEdgeList fill', () => {
    const fill = buildWeightedEdgeListFill('M', 'w', 'number', VARS);
    expect(fill).toEqual({
      kind: 'WeightedEdgeList',
      edge_count: { kind: 'RefVar', node_id: '2' },
      weight_name: 'w',
      weight_type: 'Int',
    });
  });

  it('builds QueryList fill', () => {
    const fill = buildQueryListFill('M', VARS);
    expect(fill).toEqual({
      kind: 'QueryList',
      query_count: { kind: 'RefVar', node_id: '2' },
    });
  });

  it('builds MultiTestCaseTemplate fill', () => {
    const fill = buildMultiTestCaseFill('N', VARS);
    expect(fill).toEqual({
      kind: 'MultiTestCaseTemplate',
      count: { kind: 'RefVar', node_id: '1' },
    });
  });
});

describe('Action JSON builders', () => {
  it('builds AddSlotElement action', () => {
    const json = buildAddSlotElement('0', 'children', { kind: 'Scalar', name: 'N', typ: 'Int' });
    const parsed = JSON.parse(json);
    expect(parsed.action).toBe('AddSlotElement');
    expect(parsed.parent).toBe('0');
    expect(parsed.slot_name).toBe('children');
    expect(parsed.element.kind).toBe('Scalar');
  });

  it('builds AddSibling action', () => {
    const json = buildAddSibling('1', { kind: 'Scalar', name: 'M', typ: 'Int' });
    const parsed = JSON.parse(json);
    expect(parsed.action).toBe('AddSibling');
    expect(parsed.target).toBe('1');
  });

  it('builds FillHole action', () => {
    const json = buildFillHole('3', { kind: 'Scalar', name: 'X', typ: 'Int' });
    const parsed = JSON.parse(json);
    expect(parsed.action).toBe('FillHole');
    expect(parsed.target).toBe('3');
  });

  it('builds AddChoiceVariant action', () => {
    const json = buildAddChoiceVariant('5', 1, 'a');
    const parsed = JSON.parse(json);
    expect(parsed.action).toBe('AddChoiceVariant');
    expect(parsed.choice).toBe('5');
    expect(parsed.tag_value).toEqual({ kind: 'IntLit', value: 1 });
    expect(parsed.first_element.kind).toBe('Scalar');
  });

  it('builds AddConstraint Range action', () => {
    const json = buildAddConstraintRange('1', '1', '1000000');
    const parsed = JSON.parse(json);
    expect(parsed.action).toBe('AddConstraint');
    expect(parsed.constraint.kind).toBe('Range');
    expect(parsed.constraint.lower).toBe('1');
    expect(parsed.constraint.upper).toBe('1000000');
  });

  it('builds AddConstraint Property action', () => {
    const json = buildAddConstraintProperty('1', 'Tree');
    const parsed = JSON.parse(json);
    expect(parsed.constraint.kind).toBe('Property');
    expect(parsed.constraint.tag).toBe('Tree');
  });

  it('builds AddConstraint SumBound action', () => {
    const json = buildAddConstraintSumBound('1', 'N', '200000');
    const parsed = JSON.parse(json);
    expect(parsed.constraint.kind).toBe('SumBound');
    expect(parsed.constraint.over_var).toBe('N');
    expect(parsed.constraint.upper).toBe('200000');
  });

  it('builds AddConstraint CharSet action', () => {
    const json = buildAddConstraintCharSet('3', { kind: 'LowerAlpha' });
    const parsed = JSON.parse(json);
    expect(parsed.constraint.kind).toBe('CharSet');
    expect(parsed.constraint.charset).toEqual({ kind: 'LowerAlpha' });
  });

  it('uses projected hotspot action instead of inferring from labels', () => {
    const json = buildHotspotAction({
      parent_id: 'repeat-node',
      direction: 'below',
      candidates: ['scalar'],
      candidate_details: [],
      action: { kind: 'add_slot_element', target_id: 'repeat-node', slot_name: 'body' },
    }, { kind: 'Scalar', name: 'N', typ: 'Int' });
    const parsed = JSON.parse(json);
    expect(parsed.action).toBe('AddSlotElement');
    expect(parsed.parent).toBe('repeat-node');
    expect(parsed.slot_name).toBe('body');
  });
});

describe('buildFillFromPopup', () => {
  it('routes scalar correctly', () => {
    const fill = buildFillFromPopup('scalar', 'N', 'number', '', '', '', '', VARS);
    expect(fill.kind).toBe('Scalar');
  });

  it('routes array correctly', () => {
    const fill = buildFillFromPopup('array', 'A', 'number', 'N', '', '', '', VARS);
    expect(fill.kind).toBe('Array');
  });

  it('routes repeat correctly', () => {
    const fill = buildFillFromPopup('repeat', '', '', '', '', '', 'N', VARS);
    expect(fill.kind).toBe('Repeat');
  });

  it('routes edge-list with expression', () => {
    const fill = buildFillFromPopup('edge-list', '', '', '', '', '', 'N-1', VARS);
    expect(fill.kind).toBe('EdgeList');
  });
});
