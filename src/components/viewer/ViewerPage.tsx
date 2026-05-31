import { StructurePane } from './StructurePane';
import { ConstraintPane } from './ConstraintPane';
import { PreviewPane } from './PreviewPane';
import { Toolbar } from './Toolbar';

export function ViewerPage() {
  return (
    <div class="viewer-page flex h-full flex-col">
      <div class="viewer-panes grid flex-1 grid-cols-3 gap-px overflow-hidden bg-[#2a2f3a] max-md:flex max-md:flex-col max-md:overflow-y-auto max-md:overflow-x-hidden">
        <StructurePane />
        <ConstraintPane />
        <PreviewPane />
      </div>
      <Toolbar />
    </div>
  );
}
