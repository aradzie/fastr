import { deserialize, serialize } from "bson";
import { pseudoRandomBytes } from "crypto";

export function randomString(
  length: number,
  options: { readonly alphabet?: string } = {},
): string {
  const { alphabet = randomString.standardAlphabet } = options;
  const buffer = pseudoRandomBytes(length);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = alphabet.charCodeAt(buffer[i] % alphabet.length);
  }
  return String.fromCharCode(...buffer);
}

randomString.standardAlphabet =
  "0123456789" + //
  "abcdefghijklmnopqrstuvwxyz" + //
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function encode(value: any): string {
  return Buffer.from(serialize(value)).toString("base64");
}

export function decode(value: string): any {
  try {
    return deserialize(Buffer.from(value, "base64"));
  } catch {
    return null;
  }
}

export function now(): number {
  return Math.floor(Date.now() / 1000);
}
