import { type Header, parseOrThrow } from "./headers.js";
import { Scanner, Separator } from "./syntax/syntax.js";

const headerName = "Upgrade";
const headerNameLc = "upgrade";

/**
 * The `Upgrade` header.
 *
 * @see https://httpwg.org/specs/rfc9110.html#field.upgrade
 */
export class Upgrade implements Header, Iterable<string> {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: Upgrade | string): Upgrade {
    if (typeof value === "string") {
      return Upgrade.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): Upgrade {
    return parseOrThrow(Upgrade, input);
  }

  static tryParse(input: string): Upgrade | null {
    const header = new Upgrade();
    const scanner = new Scanner(input);
    while (true) {
      let upgrade;
      const name = scanner.readToken();
      if (name == null) {
        return null;
      }
      upgrade = name;
      if (scanner.readChar(Separator.Slash)) {
        const version = scanner.readToken();
        if (version == null) {
          return null;
        }
        upgrade = name + "/" + version;
      }
      header.add(upgrade);
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
    return this.#map.has(name.toLowerCase());
  }

  add(name: string): void {
    this.#map.set(name.toLowerCase(), name);
  }

  delete(name: string): void {
    this.#map.delete(name.toLowerCase());
  }

  clear(): void {
    this.#map.clear();
  }

  toString(): string {
    return [...this.#map.values()].join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "Upgrade";
  }
}
