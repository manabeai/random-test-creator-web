import { render } from 'preact';
import { initWasm } from './wasm';
import { loadPreset } from './state';
import { initEditor, setDocumentJson } from './editor/editor-state';
import { App } from './app';
import { decodeShareState } from './share-state';
import './index.css';

async function restoreStateFromUrl(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('state');
  if (!encoded) return false;

  try {
    const json = await decodeShareState(encoded);
    setDocumentJson(json);
    return true;
  } catch (e) {
    console.error('Failed to restore state from URL:', e);
    return false;
  }
}

async function main() {
  await initWasm();
  initEditor();
  if (!await restoreStateFromUrl()) {
    loadPreset('scalar_array');
  }
  render(<App />, document.getElementById('app')!);
}

main().catch(console.error);
