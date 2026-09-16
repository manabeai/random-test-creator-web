import { samplePreviewMessage, samplePreviewText, type SamplePreview } from '../sample-preview';

export function SamplePreviewBlock({ preview, contentClass = 'sample-output' }: {
  preview: SamplePreview;
  contentClass?: string;
}) {
  const text = samplePreviewText(preview);
  const message = samplePreviewMessage(preview);

  return (
    <>
      <pre class={contentClass} data-testid="sample-output">{text}</pre>
      {message && <div class="sample-status mt:8px r:6px b:1px b:#384152 bg:#151922 px:12px py:8px font-size:13px line-height:20px fg:legacy-slate-400" data-testid="sample-status">{message}</div>}
    </>
  );
}
