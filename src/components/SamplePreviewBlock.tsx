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
      {message && <div class="sample-status mt-2 rounded-md border border-[#384152] bg-[#151922] px-3 py-2 text-[13px] leading-5 text-slate-400" data-testid="sample-status">{message}</div>}
    </>
  );
}
