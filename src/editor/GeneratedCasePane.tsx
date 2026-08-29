import { useState } from 'preact/hooks';
import { SamplePreviewBlock } from '../components/SamplePreviewBlock';
import { renderConstraintsTex, renderInputTex } from '../tex-renderer';
import {
  constraintsTexString,
  inputTexString,
  projection,
  regenerateSample,
  samplePreview,
  sampleSeed,
  sampleText,
  seedLocked,
} from './editor-state';
import {
  mobileWorkbenchView,
  outputTab,
  selectedNodeId,
} from './workbench-state';
import { WorkbenchIcon } from './WorkbenchIcon';

const OUTPUT_TABS = [
  ['sample', 'サンプル'],
  ['format', '入力形式'],
  ['constraints', '制約'],
] as const;
type OutputTab = typeof OUTPUT_TABS[number][0];

export function GeneratedCasePane() {
  const activeTab = outputTab.value;
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const sample = sampleText.value;
  const generation = projection.value.generation;
  const seedLockLabel = seedLocked.value ? 'シード固定を解除' : 'シードを固定';

  const copySample = () => {
    if (!sample) return;
    navigator.clipboard.writeText(sample).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }).catch(console.error);
  };

  const regenerate = () => {
    if (!generation.can_generate) return;
    regenerateSample();
    setRegenerating(true);
    window.setTimeout(() => setRegenerating(false), 320);
  };

  const selectTab = (value: OutputTab, focus = false) => {
    outputTab.value = value;
    if (focus) {
      window.requestAnimationFrame(() => {
        document.getElementById(`rtc-output-tab-${value}`)?.focus();
      });
    }
  };

  const moveTab = (event: KeyboardEvent, current: OutputTab) => {
    const currentIndex = OUTPUT_TABS.findIndex(([value]) => value === current);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % OUTPUT_TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + OUTPUT_TABS.length) % OUTPUT_TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = OUTPUT_TABS.length - 1;
    else return;
    event.preventDefault();
    selectTab(OUTPUT_TABS[nextIndex][0], true);
  };

  return (
    <aside class="rtc-output-pane" data-testid="output-pane" aria-label="生成ケース">
      <div class="rtc-preview-pane" data-testid="preview-pane">
        <header class="rtc-output-heading">
          <div class="rtc-output-title">
            <h2>生成ケース</h2>
            <span class="rtc-sync-mark" title="定義と同期" aria-label="定義と同期">
              <WorkbenchIcon name="link" />
            </span>
          </div>
          <div class="rtc-seed-control">
            <label class="rtc-seed-field">
              <span>seed</span>
              <input
                type="number"
                value={sampleSeed.value}
                aria-label="生成シード"
                onInput={event => { sampleSeed.value = Number(event.currentTarget.value); }}
              />
            </label>
            <button
              type="button"
              class="rtc-seed-lock"
              data-testid="seed-lock-button"
              aria-pressed={seedLocked.value}
              aria-label={seedLockLabel}
              title={seedLockLabel}
              onClick={() => { seedLocked.value = !seedLocked.value; }}
            >
              <WorkbenchIcon name="pin" />
            </button>
          </div>
        </header>

        <div class="rtc-generation-controls">
          <button
            type="button"
            class={`rtc-regenerate ${regenerating ? 'is-regenerating' : ''}`}
            data-testid="regenerate-button"
            aria-busy={regenerating}
            disabled={!generation.can_generate}
            onClick={regenerate}
          >
            <WorkbenchIcon name="refresh" />
            <span>生成し直す</span>
          </button>
        </div>

        <div class="rtc-preview-tabs" role="tablist" aria-label="投影結果">
          {OUTPUT_TABS.map(([value, label]) => (
            <button
              type="button"
              role="tab"
              key={value}
              id={`rtc-output-tab-${value}`}
              data-testid={`output-tab-${value}`}
              aria-selected={activeTab === value}
              aria-controls={`rtc-output-panel-${value}`}
              tabIndex={activeTab === value ? 0 : -1}
              class={activeTab === value ? 'is-active' : ''}
              onClick={() => { selectTab(value); }}
              onKeyDown={event => moveTab(event, value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div class="rtc-preview-stack">
          <section
            class="rtc-preview-content"
            id="rtc-output-panel-sample"
            data-testid="output-panel-sample"
            role="tabpanel"
            aria-labelledby="rtc-output-tab-sample"
            tabIndex={0}
            hidden={activeTab !== 'sample'}
          >
            {generation.can_generate
              ? (
                <SamplePreviewBlock
                  preview={samplePreview.value}
                  contentClass="rtc-sample-output"
                />
              )
              : (
                <>
                  <pre class="rtc-sample-output" data-testid="sample-output" hidden />
                  <GenerationBlocked />
                </>
              )}
          </section>
          <section
            class="rtc-preview-content rtc-tex-output"
            id="rtc-output-panel-format"
            data-testid="output-panel-format"
            role="tabpanel"
            aria-labelledby="rtc-output-tab-format"
            tabIndex={0}
            hidden={activeTab !== 'format'}
          >
            <div
              data-testid="tex-input-format"
              dangerouslySetInnerHTML={{ __html: renderInputTex(inputTexString.value) }}
            />
          </section>
          <section
            class="rtc-preview-content rtc-tex-output"
            id="rtc-output-panel-constraints"
            data-testid="output-panel-constraints"
            role="tabpanel"
            aria-labelledby="rtc-output-tab-constraints"
            tabIndex={0}
            hidden={activeTab !== 'constraints'}
          >
            <div
              data-testid="tex-constraints"
              dangerouslySetInnerHTML={{ __html: renderConstraintsTex(constraintsTexString.value) }}
            />
          </section>
        </div>

        <footer class="rtc-output-footer">
          <button type="button" onClick={copySample} disabled={!sample} aria-label="生成ケースをコピー">
            <WorkbenchIcon name={copied ? 'check' : 'copy'} />
            <span>{copied ? 'コピー済み' : 'コピー'}</span>
          </button>
          <span>{sample ? `${sample.trimEnd().split('\n').length} 行` : `${generation.blockers.reduce((total, blocker) => total + blocker.count, 0)} 未設定`}</span>
        </footer>
      </div>
    </aside>
  );
}

function GenerationBlocked() {
  const generation = projection.value.generation;
  const primary = generation.blockers[0];
  const blockerCount = generation.blockers.reduce((total, blocker) => total + blocker.count, 0);

  const showInput = () => {
    mobileWorkbenchView.value = 'format';
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-testid="insertion-hotspot-below"]')?.focus();
    });
  };

  const selectTarget = (nodeId: string) => {
    selectedNodeId.value = nodeId;
    mobileWorkbenchView.value = 'format';
  };

  return (
    <div
      class="rtc-generation-blocked"
      data-testid="generation-blocked"
      data-blocker-kind={primary?.kind ?? 'unknown'}
      data-blocker-count={blockerCount}
    >
      <span class="rtc-generation-blocked-icon" aria-hidden="true">
        <WorkbenchIcon name={primary?.kind === 'constraints' ? 'range' : 'plus'} />
      </span>
      <strong>{blockerCount} 未設定</strong>
      <div class="rtc-generation-recovery">
        {generation.blockers.some(blocker => blocker.kind === 'empty_input' || blocker.kind === 'structure') && (
          <button
            type="button"
            data-testid="generation-focus-input"
            onClick={showInput}
            aria-label="入力形式を追加"
          >
            <WorkbenchIcon name="plus" />
          </button>
        )}
        {generation.blockers.flatMap(blocker => blocker.target_ids.map((nodeId, index) => ({
          nodeId,
          name: blocker.target_names[index] ?? '?',
        }))).map(target => (
          <button
            type="button"
            key={target.nodeId}
            onClick={() => selectTarget(target.nodeId)}
            aria-label={`${target.name} の制約を設定`}
          >
            {target.name}
          </button>
        ))}
      </div>
    </div>
  );
}
