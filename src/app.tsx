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

  if (page === 'editor') return <EditorPage />;

  return (
    <div class="app flex h:100vh flex-col bg:#0f1115 fg:legacy-slate-200 antialiased">
      <header class="header flex min-h:48px items-center justify-between bb:1px b:#2a2f3a bg:#151922 px:16px font-size:14px line-height:calc(20/14) shadow:0|1px|0|rgba(255,255,255,0.03)">
        <h1 class="header-title font-size:15px font-weight:600 letter-spacing:0.02em fg:legacy-slate-100">Random Test Creator</h1>
        <nav class="header-nav flex items-center gap:6px">
          <a
            href="#/"
            class="nav-link r:6px px:12px py:6px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition bg:#202633:hover fg:legacy-slate-100:hover"
          >
            Editor
          </a>
          <a
            href="#/viewer"
            class={`nav-link r:6px px:12px py:6px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition bg:#202633:hover fg:legacy-slate-100:hover ${page === 'viewer' ? 'active bg:#202633 fg:legacy-cyan-300 shadow:inset|0|0|0|1px|rgba(103,232,249,0.18)' : ''}`}
          >
            Viewer
          </a>
          <a
            href="#/preview"
            class={`nav-link r:6px px:12px py:6px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition bg:#202633:hover fg:legacy-slate-100:hover ${page === 'preview' ? 'active bg:#202633 fg:legacy-cyan-300 shadow:inset|0|0|0|1px|rgba(103,232,249,0.18)' : ''}`}
          >
            Preview
          </a>
          <button
            class="copy-link-btn r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover"
            data-testid="copy-link-button"
            onClick={() => { void handleCopyLink(); }}
          >
            {copyFeedback.value ? 'Copied' : 'Copy Link'}
          </button>
          <button
            class="copy-link-btn r:6px b:1px b:#384152 bg:transparent px:10px py:4px font-size:12px font-weight:500 fg:legacy-slate-400 legacy-transition b:legacy-cyan-300:hover fg:legacy-cyan-200:hover"
            data-testid="reset-document-button"
            onClick={handleResetDocument}
          >
            Reset
          </button>
        </nav>
      </header>
      <main class="main flex:1 overflow:hidden bg:#0f1115">
        {page === 'viewer' && <ViewerPage />}
        {page === 'preview' && <PreviewPage />}
      </main>
    </div>
  );
}
