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
      {message && <div class="sample-status" data-testid="sample-status">{message}</div>}
    </>
  );
}
