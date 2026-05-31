import { signal } from '@preact/signals';
import { currentPage } from './state';
import { ViewerPage } from './components/viewer/ViewerPage';
import { PreviewPage } from './components/preview/PreviewPage';
import { EditorPage } from './editor/EditorPage';
import { documentJson, initEditor } from './editor/editor-state';
import { encodeShareState } from './share-state';

const copyFeedback = signal<boolean>(false);

async function handleCopyLink(): Promise<void> {
  const json = documentJson.value;
  if (!json) return;

  const encoded = await encodeShareState(json);
  const url = `${window.location.origin}${window.location.pathname}?state=${encoded}`;

  navigator.clipboard.writeText(url).then(() => {
    copyFeedback.value = true;
    setTimeout(() => { copyFeedback.value = false; }, 2000);
  }).catch(console.error);
}

function handleResetDocument(): void {
  initEditor();
}

export function App() {
  const page = currentPage.value;

  return (
    <div class="app flex h-screen flex-col bg-[#0f1115] text-slate-200 antialiased">
      <header class="header flex min-h-12 items-center justify-between border-b border-[#2a2f3a] bg-[#151922] px-4 text-sm shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <h1 class="header-title text-[15px] font-semibold tracking-[0.02em] text-slate-100">Random Test Creator</h1>
        <nav class="header-nav flex items-center gap-1.5">
          <a
            href="#/"
            class={`nav-link rounded-md px-3 py-1.5 text-[12px] font-medium text-slate-400 transition hover:bg-[#202633] hover:text-slate-100 ${page === 'editor' ? 'active bg-[#202633] text-cyan-300 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.18)]' : ''}`}
          >
            Editor
          </a>
          <a
            href="#/viewer"
            class={`nav-link rounded-md px-3 py-1.5 text-[12px] font-medium text-slate-400 transition hover:bg-[#202633] hover:text-slate-100 ${page === 'viewer' ? 'active bg-[#202633] text-cyan-300 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.18)]' : ''}`}
          >
            Viewer
          </a>
          <a
            href="#/preview"
            class={`nav-link rounded-md px-3 py-1.5 text-[12px] font-medium text-slate-400 transition hover:bg-[#202633] hover:text-slate-100 ${page === 'preview' ? 'active bg-[#202633] text-cyan-300 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.18)]' : ''}`}
          >
            Preview
          </a>
          <button
            class="copy-link-btn rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200"
            data-testid="copy-link-button"
            onClick={() => { void handleCopyLink(); }}
          >
            {copyFeedback.value ? 'Copied' : 'Copy Link'}
          </button>
          <button
            class="copy-link-btn rounded-md border border-[#384152] bg-transparent px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:border-cyan-300 hover:text-cyan-200"
            data-testid="reset-document-button"
            onClick={handleResetDocument}
          >
            Reset
          </button>
        </nav>
      </header>
      <main class="main flex-1 overflow-hidden bg-[#0f1115]">
        {page === 'editor' && <EditorPage />}
        {page === 'viewer' && <ViewerPage />}
        {page === 'preview' && <PreviewPage />}
      </main>
    </div>
  );
}
