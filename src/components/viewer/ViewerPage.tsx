import { StructurePane } from './StructurePane';
import { ConstraintPane } from './ConstraintPane';
import { PreviewPane } from './PreviewPane';
import { Toolbar } from './Toolbar';

export function ViewerPage() {
  return (
    <div class="viewer-page">
      <div class="viewer-panes">
        <StructurePane />
        <ConstraintPane />
        <PreviewPane />
      </div>
      <Toolbar />
    </div>
  );
}
