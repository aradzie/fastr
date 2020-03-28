import { splitList, splitPair } from "./strings";
import type { NameValueEntries } from "./types";

const kMap = Symbol("kMap");

export class Parameters {
  static from(value: Parameters | string): Parameters {
    if (typeof value === "string") {
      return Parameters.parse(value);
    } else {
      return value;
    }
  }

  static parse(value: string): Parameters {
    const entries: [string, string][] = [];
    for (const item of splitList(value, ";")) {
      const [name, value] = splitPair(item, "=");
      if (name && value) {
        entries.push([name.toLowerCase(), value]);
      }
    }
    return new Parameters(entries);
  }

  private [kMap] = new Map<string, string>();
  readonly charset: string | null;
  readonly q: number | null;

  // TODO Use NameValueEntries, Object or Map
  constructor(entries: Iterable<readonly [string, string]> | null = null) {
    this[kMap] = new Map(entries as [string, string][]);
    let v: string | null;
    let charset;
    if ((v = this.get("charset")) != null && (charset = v) !== "") {
      this.charset = charset;
    } else {
      this.charset = null;
    }
    let q;
    if ((v = this.get("q")) != null && Number.isFinite((q = Number(v)))) {
      this.q = q;
    } else {
      this.q = null;
    }
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this[kMap][Symbol.iterator]();
  }

  entries(): IterableIterator<[string, string]> {
    return this[kMap].entries();
  }

  keys(): IterableIterator<string> {
    return this[kMap].keys();
  }

  values(): IterableIterator<string> {
    return this[kMap].values();
  }

  has(key: string): boolean {
    return this[kMap].has(key);
  }

  get(key: string): string | null {
    return this[kMap].get(key) ?? null;
  }

  toJSON(): any {
    return this.toString();
  }

  toString(): string {
    return [...this.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}
