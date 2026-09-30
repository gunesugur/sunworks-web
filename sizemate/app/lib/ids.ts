const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Short, URL- and metafield-key-safe random id, e.g. "c_k3j9x2ab". */
export function createId(prefix: string, length = 8): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let id = "";
  for (const byte of bytes) id += ALPHABET[byte % ALPHABET.length];
  return `${prefix}_${id}`;
}

export const ID_PATTERN = /^[a-z]_[a-z0-9]{4,16}$/;
