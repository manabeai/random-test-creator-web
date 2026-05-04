/**
 * Main editor layout with 3 panes: Structure, Constraints, Preview.
 */
import { StructurePane } from './StructurePane';
import { ConstraintPane } from './ConstraintPane';
import { PreviewPane } from './PreviewPane';

export function EditorPage() {
  return (
    <div class="editor-page">
      <div class="editor-panes">
        <StructurePane />
        <ConstraintPane />
        <PreviewPane />
      </div>
    </div>
  );
}
