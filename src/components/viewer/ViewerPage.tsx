import { StructurePane } from './StructurePane';
import { ConstraintPane } from './ConstraintPane';
import { PreviewPane } from './PreviewPane';
import { Toolbar } from './Toolbar';

export function ViewerPage() {
  return (
    <div class="viewer-page flex h:100% flex-col">
      <div class="viewer-panes grid flex:1 grid-cols:3 gap:1px overflow:hidden bg:#2a2f3a flex@<768px flex-col@<768px overflow-y:auto@<768px overflow-x:hidden@<768px">
        <StructurePane />
        <ConstraintPane />
        <PreviewPane />
      </div>
      <Toolbar />
    </div>
  );
}
