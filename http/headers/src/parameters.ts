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
  readonly charset: string | null;
  readonly q: number | null;

  constructor(
    arg: Map<string, unknown> | Record<string, unknown> | NameValueEntries = {},
  ) {
    this[kMap] = new Map(entries(arg as Map<string, unknown>));
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
    // TODO Use quoted strings https://mimesniff.spec.whatwg.org/#serializing-a-mime-type
    return [...this.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}
