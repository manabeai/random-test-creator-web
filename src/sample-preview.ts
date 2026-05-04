import { Schema } from 'effect';

export interface SampleDraftConstraint {
  target_name: string;
}

export class SampleDocumentMissingError extends Schema.TaggedError<SampleDocumentMissingError>()(
  'SampleDocumentMissingError',
  {
    message: Schema.String,
  },
) {}

export class SampleDraftConstraintsPendingError extends Schema.TaggedError<SampleDraftConstraintsPendingError>()(
  'SampleDraftConstraintsPendingError',
  {
    count: Schema.Number,
    targets: Schema.Array(Schema.String),
    message: Schema.String,
  },
) {}

export class SampleProjectionFailedError extends Schema.TaggedError<SampleProjectionFailedError>()(
  'SampleProjectionFailedError',
  {
    message: Schema.String,
    cause: Schema.String,
  },
) {}

export class SampleGenerationFailedError extends Schema.TaggedError<SampleGenerationFailedError>()(
  'SampleGenerationFailedError',
  {
    message: Schema.String,
    cause: Schema.String,
  },
) {}

export type SamplePreviewError =
  | SampleDocumentMissingError
  | SampleDraftConstraintsPendingError
  | SampleProjectionFailedError
  | SampleGenerationFailedError;

export type SamplePreview =
  | { kind: 'ready'; text: string }
  | { kind: 'unavailable'; error: SamplePreviewError };

export function buildSamplePreview(args: {
  documentJson: string;
  seed: number;
  generateSample: (documentJson: string, seed: number) => string;
  draftConstraints?: readonly SampleDraftConstraint[];
  project?: (documentJson: string) => unknown;
}): SamplePreview {
  if (!args.documentJson) {
    return unavailable(new SampleDocumentMissingError({
      message: 'Sample is unavailable: no document is loaded.',
    }));
  }

  if (args.project) {
    try {
      args.project(args.documentJson);
    } catch (error) {
      return unavailable(new SampleProjectionFailedError({
        message: `Sample is unavailable: ${formatCause(error)}`,
        cause: formatCause(error),
      }));
    }
  }

  if (args.draftConstraints && args.draftConstraints.length > 0) {
    const targets = args.draftConstraints.map((draft) => draft.target_name);
    const count = args.draftConstraints.length;
    const plural = count === 1 ? 'constraint is' : 'constraints are';

    return unavailable(new SampleDraftConstraintsPendingError({
      count,
      targets,
      message: `Sample is unavailable: ${count} draft ${plural} still incomplete.`,
    }));
  }

  try {
    return { kind: 'ready', text: args.generateSample(args.documentJson, args.seed) };
  } catch (error) {
    return unavailable(new SampleGenerationFailedError({
      message: `Sample generation failed: ${formatCause(error)}`,
      cause: formatCause(error),
    }));
  }
}

export function samplePreviewText(preview: SamplePreview): string {
  return preview.kind === 'ready' ? preview.text : '';
}

export function samplePreviewMessage(preview: SamplePreview): string | undefined {
  return preview.kind === 'unavailable' ? preview.error.message : undefined;
}

export function samplePreviewFromGenerationError(error: unknown): SamplePreview {
  return unavailable(new SampleGenerationFailedError({
    message: `Sample generation failed: ${formatCause(error)}`,
    cause: formatCause(error),
  }));
}

function unavailable(error: SamplePreviewError): SamplePreview {
  return { kind: 'unavailable', error };
}

function formatCause(error: unknown): string {
  if (error instanceof Error) return error.message || error.toString();
  return String(error);
}
