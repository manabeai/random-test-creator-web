import { beforeEach, describe, expect, it, vi } from 'vitest';

const canonicalizeSpy = vi.fn((json: string) => JSON.stringify(JSON.parse(json)));

vi.mock('../../src/wasm', () => ({
  canonicalize_document_for_share: (json: string) => canonicalizeSpy(json),
}));

describe('share-state codec', () => {
  beforeEach(() => {
    canonicalizeSpy.mockClear();
  });

  it('encodes compressed share state and decodes it back', async () => {
    const { encodeShareState, decodeShareState } = await import('../../src/share-state');
    const documentJson = JSON.stringify({
      schema_version: 1,
      document: {
        structure: {
          root: '0',
          next_id: '12',
          arena: Array.from({ length: 10 }, (_, i) => ({
            id: String(i),
            kind: { kind: 'Scalar', name: `A_${i}` },
          })),
        },
        constraints: {
          next_id: '8',
          arena: Array.from({ length: 8 }, (_, i) => ({
            id: String(i),
            constraint: {
              kind: 'Range',
              target: { kind: 'VariableRef', node_id: String(i) },
              lower: { kind: 'Lit', value: 1 },
              upper: { kind: 'Lit', value: 1000000 },
            },
          })),
          by_node: [],
          global: [],
        },
      },
    });

    const encoded = await encodeShareState(documentJson);
    const legacy = encodeURIComponent(btoa(documentJson));

    expect(encoded.startsWith('v2.')).toBe(false);
    expect(encoded.length).toBeLessThan(legacy.length);

    const decoded = await decodeShareState(encoded);
    expect(JSON.parse(decoded)).toEqual(JSON.parse(documentJson));
    expect(canonicalizeSpy).toHaveBeenCalledTimes(2);
  });

  it('rejects legacy uncompressed share state', async () => {
    const { decodeShareState } = await import('../../src/share-state');
    const documentJson = JSON.stringify({
      schema_version: 1,
      document: {
        structure: { root: '0', next_id: '1', arena: [] },
        constraints: { next_id: '0', arena: [], by_node: [], global: [] },
      },
    });

    await expect(decodeShareState(encodeURIComponent(btoa(documentJson)))).rejects.toThrow();
    expect(canonicalizeSpy).not.toHaveBeenCalled();
  });
});
