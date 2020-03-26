import { escapeToken, isToken } from "./syntax.js";

export type ExtField = readonly [name: string, value: string | null];

export class ExtFields implements Iterable<ExtField> {
  private readonly _map = new Map<string, string | null>();

  constructor(ext: readonly ExtField[] | null = null) {
    if (ext != null) {
      for (const [name, value] of ext) {
        this.set(name, value);
      }
    }
  }

  [Symbol.iterator](): Iterator<ExtField> {
    return this._map.entries();
  }

  get size(): number {
    return this._map.size;
  }

  keys(): IterableIterator<string> {
    return this._map.keys();
  }

  has(name: string): boolean {
    if (!isToken(name)) {
      throw new TypeError();
    }
    return this._map.has(name.toLowerCase());
  }

  get(name: string): string | null {
    if (!isToken(name)) {
      throw new TypeError();
    }
    return this._map.get(name.toLowerCase()) ?? null;
  }

  set(name: string, value: string | null): void {
    if (!isToken(name)) {
      throw new TypeError();
    }
    if (value === "") {
      value = null;
    }
    this._map.set(name.toLowerCase(), value);
  }

  delete(name: string): void {
    if (!isToken(name)) {
      throw new TypeError();
    }
    this._map.delete(name.toLowerCase());
  }

  clear(): void {
    this._map.clear();
  }

  toString(): string {
    if (this._map.size === 0) {
      return "";
    }
    const items: string[] = [];
    for (const [name, value] of this._map) {
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
