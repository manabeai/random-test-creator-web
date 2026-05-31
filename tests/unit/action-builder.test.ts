import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  buildHotspotActionMock: vi.fn(() => '{"action":"AddSlotElement"}'),
  buildConstraintActionsMock: vi.fn(() => JSON.stringify([
    '{"action":"RemoveConstraint"}',
    '{"action":"AddConstraint"}',
  ])),
  buildReplaceActionMock: vi.fn(() => '{"action":"ReplaceNode"}'),
}));

vi.mock('../../src/wasm', () => ({
  build_hotspot_action_from_draft: mocks.buildHotspotActionMock,
  build_constraint_actions_from_draft: mocks.buildConstraintActionsMock,
  build_replace_action_from_draft: mocks.buildReplaceActionMock,
}));

import {
  buildAddConstraintProperty,
  buildConstraintActionsFromDraft,
  buildHotspotActionFromDraft,
  buildRemoveConstraint,
  buildReplaceActionFromDraft,
} from '../../src/editor/action-builder';
import type { ExprCandidate, Hotspot } from '../../src/editor/editor-state';

const VARS: ExprCandidate[] = [
  { name: 'N', node_id: '1', value_type: 'number', node_kind: 'scalar' },
];

const HOTSPOT: Hotspot = {
  parent_id: '0',
  direction: 'below',
  candidates: ['array'],
  candidate_details: [],
  action: { kind: 'add_slot_element', target_id: '0', slot_name: 'children' },
};

describe('action-builder wasm bridge', () => {
  it('passes hotspot draft fields to Rust and returns the action JSON', () => {
    const json = buildHotspotActionFromDraft(
      HOTSPOT,
      'array',
      { name: 'A', type: 'number', length: 'N' },
      VARS,
    );

    expect(json).toBe('{"action":"AddSlotElement"}');
    expect(mocks.buildHotspotActionMock).toHaveBeenCalledWith(JSON.stringify({
      route: HOTSPOT.action,
      candidate: 'array',
      fields: { name: 'A', type: 'number', length: 'N' },
      variables: VARS,
    }));
  });

  it('parses the Rust-built constraint action sequence', () => {
    const actions = buildConstraintActionsFromDraft({
      targetId: '3',
      template: 'CharSet',
      existingConstraintId: '9',
      charset: { kind: 'LowerAlpha' },
    });

    expect(actions).toEqual([
      '{"action":"RemoveConstraint"}',
      '{"action":"AddConstraint"}',
    ]);
    expect(mocks.buildConstraintActionsMock).toHaveBeenCalledWith(JSON.stringify({
      target_id: '3',
      template: 'CharSet',
      existing_constraint_id: '9',
      lower: undefined,
      upper: undefined,
      over_var: undefined,
      charset: { kind: 'LowerAlpha' },
    }));
  });

  it('passes node replacement draft fields to Rust', () => {
    const json = buildReplaceActionFromDraft(
      '4',
      'array',
      { name: 'B', type: 'char', length: 'N' },
      VARS,
    );

    expect(json).toBe('{"action":"ReplaceNode"}');
    expect(mocks.buildReplaceActionMock).toHaveBeenCalledWith(JSON.stringify({
      target_id: '4',
      candidate: 'array',
      fields: { name: 'B', type: 'char', length: 'N' },
      variables: VARS,
    }));
  });

  it('keeps simple property and delete action helpers declarative', () => {
    expect(JSON.parse(buildAddConstraintProperty('0', 'Tree'))).toEqual({
      action: 'AddConstraint',
      target: '0',
      constraint: { kind: 'Property', tag: 'Tree' },
    });
    expect(JSON.parse(buildRemoveConstraint('7'))).toEqual({
      action: 'RemoveConstraint',
      constraint_id: '7',
    });
  });
});
