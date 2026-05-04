import init from '../wasm/cp_ast_wasm';

export {
  render_input_format,
  render_structure_tree,
  render_constraints_text,
  render_constraint_tree,
  render_input_tex,
  render_constraints_tex,
  render_full_tex,
  generate_sample,
  list_presets,
  get_preset,
  version,
  new_document,
  project_full,
  apply_action,
  canonicalize_document_for_share,
  get_hole_candidates,
  get_expr_candidates,
  get_constraint_targets,
} from '../wasm/cp_ast_wasm';

let initialized = false;

export async function initWasm(): Promise<void> {
  if (!initialized) {
    await init();
    initialized = true;
  }
}
