const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateAdKey(length = 6) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  return Array.from(values, (value) =>
    ALPHABET[value % ALPHABET.length]
  ).join("");
}
