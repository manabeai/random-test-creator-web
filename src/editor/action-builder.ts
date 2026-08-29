/**
 * Thin WASM bridge for editor draft actions.
 *
 * The frontend collects transient UI fields. Rust owns candidate/constraint
 * semantics and returns concrete Action JSON strings.
 */

import {
  build_constraint_actions_from_draft,
  build_hotspot_action_from_draft,
  build_replace_action_from_draft,
} from '../wasm';
import type { CharSetSpec, ExprCandidate, Hotspot, RemoveNodeProjection } from './editor-state';

export type HotspotDraftFields = Record<string, string>;

export interface DirectNodeDraft {
  name: string;
  type: 'number' | 'string' | 'char';
  horizontal: string;
  vertical: string;
}

export function buildHotspotActionFromDraft(
  hotspot: Hotspot,
  candidate: string,
  fields: HotspotDraftFields,
  availableVars: ExprCandidate[],
): string {
  return build_hotspot_action_from_draft(JSON.stringify({
    route: hotspot.action,
    candidate,
    fields,
    variables: availableVars,
  }));
}

export function buildDirectHotspotActionFromDraft(
  hotspot: Hotspot,
  draft: DirectNodeDraft,
  availableVars: ExprCandidate[],
): string {
  return buildHotspotActionFromDraft(hotspot, 'direct', {
    name: draft.name,
    type: draft.type,
    horizontal: draft.horizontal,
    vertical: draft.vertical,
  }, availableVars);
}

export interface ConstraintActionDraft {
  targetId: string;
  template: 'Range' | 'StringLength' | 'CharSet' | 'SumBound';
  existingConstraintId?: string;
  lower?: string;
  upper?: string;
  overVar?: string;
  charset?: CharSetSpec;
}

export function buildConstraintActionsFromDraft(draft: ConstraintActionDraft): string[] {
  return JSON.parse(build_constraint_actions_from_draft(JSON.stringify({
    target_id: draft.targetId,
    template: draft.template,
    existing_constraint_id: draft.existingConstraintId,
    lower: draft.lower,
    upper: draft.upper,
    over_var: draft.overVar,
    charset: draft.charset,
  }))) as string[];
}

export function buildReplaceActionFromDraft(
  targetId: string,
  candidate: 'scalar' | 'array' | 'matrix',
  fields: HotspotDraftFields,
  availableVars: ExprCandidate[],
): string {
  return build_replace_action_from_draft(JSON.stringify({
    target_id: targetId,
    candidate,
    fields,
    variables: availableVars,
  }));
}

export function buildDirectReplaceActionFromDraft(
  targetId: string,
  draft: DirectNodeDraft,
  availableVars: ExprCandidate[],
): string {
  return build_replace_action_from_draft(JSON.stringify({
    target_id: targetId,
    candidate: 'direct',
    fields: draft,
    variables: availableVars,
  }));
}

export function buildRemoveNodeAction(route: RemoveNodeProjection): string {
  return JSON.stringify({
    action: 'RemoveSlotElement',
    parent: route.parent_id,
    slot_name: route.slot_name,
    child: route.child_id,
  });
}

export function buildAddConstraintProperty(targetId: string, tag: string): string {
  return JSON.stringify({
    action: 'AddConstraint',
    target: targetId,
    constraint: { kind: 'Property', tag },
  });
}

export function buildRemoveConstraint(constraintId: string): string {
  return JSON.stringify({
    action: 'RemoveConstraint',
    constraint_id: constraintId,
  });
}
