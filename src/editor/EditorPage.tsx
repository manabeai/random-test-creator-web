import { useEffect, useState } from 'preact/hooks';
import { encodeShareState } from '../share-state';
import {
  canRedo,
  canUndo,
  documentJson,
  editorError,
  projection,
  redoDocument,
  resetDocument,
  undoDocument,
} from './editor-state';
import { closePopup } from './popup-state';
import { DirectInputPane } from './DirectInputPane';
import { GeneratedCasePane } from './GeneratedCasePane';
import { clearWorkbenchSelection, mobileWorkbenchView } from './workbench-state';
import { WorkbenchIcon } from './WorkbenchIcon';
import './workbench.css';

export function EditorPage() {
  const [copied, setCopied] = useState(false);
  const mobileView = mobileWorkbenchView.value;
  const ready = projection.value.generation.can_generate;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopup();
        clearWorkbenchSelection();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoDocument();
        else undoDocument();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetInput = () => {
    resetDocument();
    closePopup();
    clearWorkbenchSelection();
    mobileWorkbenchView.value = 'format';
  };

  const copyShareLink = async () => {
    if (!documentJson.value) return;
    const encoded = await encodeShareState(documentJson.value);
    const url = `${window.location.origin}${window.location.pathname}?state=${encoded}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div class={`rtc-workbench rtc-workbench--mobile-${mobileView}`} data-testid="editor-workbench">
      <header class="rtc-topbar">
        <div class="rtc-topbar-identity">
          <h1>ランダムテスト</h1>
          <button
            type="button"
            class="rtc-reset-input"
            data-testid="reset-document-button"
            aria-label="リセット"
            title="リセット"
            onClick={resetInput}
          >
            <WorkbenchIcon name="refresh" />
            <span>リセット</span>
          </button>
        </div>
        <nav class="rtc-topbar-actions" aria-label="ドキュメント操作">
          <button type="button" data-testid="undo-button" onClick={undoDocument} disabled={!canUndo.value} aria-label="取り消す">
            <WorkbenchIcon name="undo" />
            <span>取り消す</span>
          </button>
          <button type="button" data-testid="redo-button" onClick={redoDocument} disabled={!canRedo.value} aria-label="やり直す">
            <WorkbenchIcon name="redo" />
            <span>やり直す</span>
          </button>
          <span class="rtc-toolbar-rule" aria-hidden="true" />
          <button type="button" data-testid="copy-link-button" onClick={() => { void copyShareLink(); }} aria-label="共有URLをコピー">
            <WorkbenchIcon name={copied ? 'check' : 'share'} />
            <span>{copied ? 'コピー済み' : '共有'}</span>
          </button>
          <span class={`rtc-ready ${ready ? 'is-ready' : ''}`} aria-label={ready ? '生成可能' : '制約が未設定'}>
            <WorkbenchIcon name={ready ? 'check' : 'range'} />
          </span>
        </nav>
      </header>

      <div class="rtc-mobile-switch" data-testid="mobile-mode-switch" role="group" aria-label="表示内容">
        <button
          type="button"
          class={mobileView === 'format' ? 'is-active' : ''}
          aria-pressed={mobileView === 'format'}
          onClick={() => { mobileWorkbenchView.value = 'format'; }}
        >
          入力形式
        </button>
        <button
          type="button"
          class={mobileView === 'output' ? 'is-active' : ''}
          aria-pressed={mobileView === 'output'}
          onClick={() => { mobileWorkbenchView.value = 'output'; }}
        >
          生成ケース
        </button>
      </div>

      <main class="rtc-workspace">
        <DirectInputPane />
        <GeneratedCasePane />
      </main>

      {editorError.value && (
        <div class="rtc-error-toast" role="alert">
          <span>{editorError.value}</span>
          <button type="button" onClick={() => { editorError.value = ''; }} aria-label="閉じる">
            <WorkbenchIcon name="close" />
          </button>
        </div>
      )}
    </div>
  );
}
