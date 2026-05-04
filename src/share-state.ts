import { canonicalize_document_for_share } from './wasm';

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

function base64UrlToBytes(encoded: string): Uint8Array {
  const base64 = encoded
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(encoded.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function compressText(text: string): Promise<Uint8Array> {
  const body = new Response(text).body;
  if (!body) {
    throw new Error('Response body is unavailable for compression');
  }
  const stream = body.pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompressText(bytes: Uint8Array): Promise<string> {
  const copied = new Uint8Array(bytes);
  const body = new Response(
    copied.buffer,
  ).body;
  if (!body) {
    throw new Error('Response body is unavailable for decompression');
  }
  const stream = body.pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

export async function encodeShareState(documentJson: string): Promise<string> {
  const canonicalJson = canonicalize_document_for_share(documentJson);
  const compressed = await compressText(canonicalJson);
  return bytesToBase64Url(compressed);
}

export async function decodeShareState(state: string): Promise<string> {
  const compressed = base64UrlToBytes(state);
  const json = await decompressText(compressed);
  return canonicalize_document_for_share(json);
}
