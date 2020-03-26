import { type Header, parseOrThrow } from "./headers.js";
import { isToken, Scanner, Separator } from "./syntax.js";

const headerName = "Vary";
const headerNameLc = "vary";

/**
 * The `Vary` header.
 *
 * @see https://httpwg.org/specs/rfc9110.html#field.vary
 */
export class Vary implements Header, Iterable<string> {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: Vary | string): Vary {
    if (typeof value === "string") {
      return Vary.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): Vary {
    return parseOrThrow(Vary, input);
  }

  static tryParse(input: string): Vary | null {
    const header = new Vary();
    const scanner = new Scanner(input);
    while (true) {
      const name = scanner.readToken();
      if (name == null) {
        return null;
      }
      header.add(name);
      scanner.skipWs();
      if (!scanner.hasNext()) {
        break;
      }
      if (!scanner.readChar(Separator.Comma)) {
        return null;
      }
      scanner.skipWs();
    }
    return header;
  }

  readonly #map = new Map<string, string>();

  constructor(...names: readonly string[]) {
    for (const name of names) {
      this.add(name);
    }
  }

  [Symbol.iterator](): Iterator<string> {
    return this.#map.values();
  }

  get size(): number {
    return this.#map.size;
  }

  has(name: string): boolean {
    if (!isToken(name)) {
      throw new TypeError();
    }
    return this.#map.has(name.toLowerCase());
  }

  add(name: string): void {
    if (!isToken(name)) {
      throw new TypeError();
    }
    this.#map.set(name.toLowerCase(), name);
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
    return [...this.#map.values()].join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "Vary";
  }
}
