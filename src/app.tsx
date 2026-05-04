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
    <div class="app">
      <header class="header">
        <h1 class="header-title">Random Test Creator</h1>
        <nav class="header-nav">
          <a
            href="#/"
            class={`nav-link ${page === 'editor' ? 'active' : ''}`}
          >
            Editor
          </a>
          <a
            href="#/viewer"
            class={`nav-link ${page === 'viewer' ? 'active' : ''}`}
          >
            Viewer
          </a>
          <a
            href="#/preview"
            class={`nav-link ${page === 'preview' ? 'active' : ''}`}
          >
            Preview
          </a>
          <button
            class="copy-link-btn"
            data-testid="copy-link-button"
            onClick={() => { void handleCopyLink(); }}
          >
            {copyFeedback.value ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <button
            class="copy-link-btn"
            data-testid="reset-document-button"
            onClick={handleResetDocument}
          >
            Reset
          </button>
        </nav>
      </header>
      <main class="main">
        {page === 'editor' && <EditorPage />}
        {page === 'viewer' && <ViewerPage />}
        {page === 'preview' && <PreviewPage />}
      </main>
    </div>
  );
}
