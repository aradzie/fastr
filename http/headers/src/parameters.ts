import { splitList, splitPair } from "./strings";
import { NameValueEntries } from "./types";
import { entries } from "./util";

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
    // See https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
    // TODO Make spec compliant, parse quoted strings.
    const entries: [string, string][] = [];
    for (const item of splitList(value, ";")) {
      const [name, value] = splitPair(item, "=");
      entries.push([name.toLowerCase(), value]);
    }
    return new Parameters(entries);
  }

  private [kMap] = new Map<string, string>();

  constructor(
    data:
      | Parameters
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    const map = new Map<string, string>();
    if (data != null) {
      if (data instanceof Parameters) {
        for (const [name, value] of data) {
          map.set(name, value);
        }
      } else {
        for (const [name, value] of entries(data as Map<string, unknown>)) {
          map.set(name, value);
        }
      }
    }
    Object.defineProperty(this, kMap, {
      value: map,
    });
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

  set(name: string, value: unknown): this {
    this[kMap].set(name, String(value));
    return this;
  }

  delete(name: string): this {
    this[kMap].delete(name);
    return this;
  }

  clear(): this {
    this[kMap].clear();
    return this;
  }

  get q(): number | null {
    // TODO Add parse number util.
    const v = this.get("q");
    if (v != null) {
      return Number(v);
    } else {
      return null;
    }
  }

  set q(value: number | null) {
    if (value == null) {
      this.delete("q");
    } else {
      this.set("q", value);
    }
  }

  get charset(): string | null {
    return this.get("charset");
  }

  set charset(value: string | null) {
    if (value == null) {
      this.delete("charset");
    } else {
      this.set("charset", value);
    }
  }

  toJSON(): string {
    return this.toString();
  }

  toString(): string {
    // TODO Use quoted strings https://mimesniff.spec.whatwg.org/#serializing-a-mime-type
    return [...this.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}
