import { type Weighted } from "./accepted.js";
import { entriesOf, type NameValueEntries } from "./entries.js";
import { escapeToken, isToken, type Scanner, Separator } from "./syntax.js";

export class Params implements Iterable<[string, string]> {
  readonly #map = new Map<string, string>();

  constructor(params: NameValueEntries | null = null) {
    if (params != null) {
      for (const [name, value] of entriesOf(params)) {
        this.set(name, value);
      }
    }
  }

  [Symbol.iterator](): Iterator<[string, string]> {
    return this.#map.entries();
  }

  get size(): number {
    return this.#map.size;
  }

  keys(): IterableIterator<string> {
    return this.#map.keys();
  }

  has(name: string): boolean {
    if (!isToken(name)) {
      throw new TypeError();
    }
    return this.#map.has(name.toLowerCase());
  }

  get(name: string): string | null {
    if (!isToken(name)) {
      throw new TypeError();
    }
    return this.#map.get(name.toLowerCase()) ?? null;
  }

  set(name: string, value: unknown): void {
    if (!isToken(name)) {
      throw new TypeError();
    }
    this.#map.set(name.toLowerCase(), String(value));
  }

  delete(name: string): void {
    if (!isToken(name)) {
      throw new TypeError();
    }
    this.#map.delete(name.toLowerCase());
  }

  clear(): void {
    this.#map.clear();
  }

  toString(): string {
    if (this.#map.size === 0) {
      return "";
    }
    const parts: string[] = [];
    for (const [name, value] of this.#map) {
      parts.push(`${name}=${escapeToken(value)}`);
    }
    return parts.join("; ");
  }

  get [Symbol.toStringTag](): string {
    return "Params";
  }
}

export function readWeight(scanner: Scanner, params: Weighted): boolean {
  // weight          = OWS ";" OWS "q=" qvalue
  // qvalue          = ( "0" [ "." 0*3DIGIT ] )
  //                 / ( "1" [ "." 0*3("0") ] )
  scanner.skipWs();
  if (scanner.readChar(Separator.Semicolon)) {
    scanner.skipWs();
    if (
      !scanner.readChar(/* "q" */ 0x71) &&
      !scanner.readChar(/* "Q" */ 0x51)
    ) {
      return false;
    }
    if (!scanner.readChar(Separator.Equals)) {
      return false;
    }
    const value = scanner.readNumber();
    if (value == null || value > 1) {
      return false;
    }
    params.q = value;
    scanner.skipWs();
  }
  return true;
}
