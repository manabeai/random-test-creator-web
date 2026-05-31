/**
 * Main editor layout with 3 panes: Structure, Constraints, Preview.
 */
import { StructurePane } from './StructurePane';
import { ConstraintPane } from './ConstraintPane';
import { PreviewPane } from './PreviewPane';

export function EditorPage() {
  return (
    <div class="editor-page flex h-full flex-col">
      <div class="editor-panes grid flex-1 grid-cols-3 gap-px overflow-hidden bg-[#2a2f3a] max-md:flex max-md:flex-col max-md:overflow-y-auto max-md:overflow-x-hidden">
        <StructurePane />
        <ConstraintPane />
        <PreviewPane />
      </div>
    </div>
  );
}
