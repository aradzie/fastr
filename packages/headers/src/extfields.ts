import { escapeToken, isToken } from "./syntax/syntax.js";

export type ExtField = readonly [name: string, value: string | null];

export class ExtFields implements Iterable<ExtField> {
  readonly #map = new Map<string, string | null>();

  constructor(ext: readonly ExtField[] | null = null) {
    if (ext != null) {
      for (const [name, value] of ext) {
        this.set(name, value);
      }
    }
  }

  [Symbol.iterator](): IterableIterator<ExtField> {
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

  set(name: string, value: string | null): void {
    if (!isToken(name)) {
      throw new TypeError();
    }
    if (value === "") {
      value = null;
    }
    this.#map.set(name.toLowerCase(), value);
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
    const items: string[] = [];
    for (const [name, value] of this.#map) {
      if (value != null) {
        items.push(`${name}=${escapeToken(value)}`);
      } else {
        items.push(name);
      }
    }
    return items.join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "ExtFields";
  }
}
