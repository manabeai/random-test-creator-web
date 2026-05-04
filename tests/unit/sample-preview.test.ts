import { describe, expect, it } from 'vitest';
import {
  buildSamplePreview,
  SampleDocumentMissingError,
  SampleDraftConstraintsPendingError,
  SampleGenerationFailedError,
  SampleProjectionFailedError,
  samplePreviewText,
} from '../../src/sample-preview';

describe('sample preview state', () => {
  it('reports a missing document instead of returning an empty sample silently', () => {
    const preview = buildSamplePreview({
      documentJson: '',
      seed: 0,
      generateSample: () => 'sample',
    });

    expect(preview.kind).toBe('unavailable');
    if (preview.kind === 'unavailable') {
      expect(preview.error).toBeInstanceOf(SampleDocumentMissingError);
      expect(preview.error.message).toContain('no document is loaded');
    }
    expect(samplePreviewText(preview)).toBe('');
  });

  it('reports pending draft constraints with a count', () => {
    const preview = buildSamplePreview({
      documentJson: '{}',
      seed: 0,
      draftConstraints: [{ target_name: 'N' }, { target_name: 'A' }],
      generateSample: () => 'sample',
    });

    expect(preview.kind).toBe('unavailable');
    if (preview.kind === 'unavailable') {
      expect(preview.error).toBeInstanceOf(SampleDraftConstraintsPendingError);
      expect(preview.error.message).toContain('2 draft constraints are still incomplete');
    }
  });

  it('reports projection failures before generation', () => {
    const preview = buildSamplePreview({
      documentJson: '{}',
      seed: 0,
      project: () => {
        throw new Error('bad projection');
      },
      generateSample: () => 'sample',
    });

    expect(preview.kind).toBe('unavailable');
    if (preview.kind === 'unavailable') {
      expect(preview.error).toBeInstanceOf(SampleProjectionFailedError);
      expect(preview.error.message).toContain('bad projection');
    }
  });

  it('reports generation failures with the thrown cause', () => {
    const preview = buildSamplePreview({
      documentJson: '{}',
      seed: 0,
      generateSample: () => {
        throw new Error('empty range: [10, 1]');
      },
    });

    expect(preview.kind).toBe('unavailable');
    if (preview.kind === 'unavailable') {
      expect(preview.error).toBeInstanceOf(SampleGenerationFailedError);
      expect(preview.error.message).toContain('empty range: [10, 1]');
    }
  });

  it('returns ready sample text when generation succeeds', () => {
    const preview = buildSamplePreview({
      documentJson: '{}',
      seed: 42,
      generateSample: (_json, seed) => `seed=${seed}`,
    });

    expect(preview).toEqual({ kind: 'ready', text: 'seed=42' });
    expect(samplePreviewText(preview)).toBe('seed=42');
  });
});
