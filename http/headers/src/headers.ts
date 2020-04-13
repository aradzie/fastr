import { splitLines, splitPair } from "./strings";
import type { NameValueEntries } from "./types";
import { multiEntries } from "./util";

const kMap = Symbol("kMap");

class HeaderEntry {
  /**
   * The original Mixed-Case header name.
   */
  readonly name: string;
  /**
   * The normalized lower-case header name.
   */
  readonly nameLc: string;
  /**
   * The list of header values.
   */
  value: string | string[] = [];

  constructor(name: string, nameLc: string) {
    this.name = name;
    this.nameLc = nameLc;
  }

  set(v: string | string[]): void {
    if (Headers.nonCoalescingHeaders.has(this.nameLc)) {
      this.value = concat([], v);
    } else {
      this.value = concat([], v).join(", ");
    }
  }

  append(v: string | string[]): void {
    if (Headers.nonCoalescingHeaders.has(this.nameLc)) {
      this.value = concat(this.value, v);
    } else {
      this.value = concat(this.value, v).join(", ");
    }
  }
}

/**
 * A collection of HTTP headers.
 */
export class Headers implements Iterable<[string, string | string[]]> {
  /**
   * The set of multi-value header names whose values are kept on separate lines
   * in an HTTP message.
   */
  static readonly nonCoalescingHeaders = new Set<string>([
    "set-cookie",
    "link",
  ]);

  /**
   * Creates a new `Headers` instance from the given JSON object
   * with key/value pairs.
   */
  static from(
    headers:
      | Headers
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ): Headers {
    const result = new Headers();
    if (headers != null) {
      if (headers instanceof Headers) {
        for (const [name, value] of headers) {
          result.append(name, value);
        }
      } else {
        for (const [name, value] of multiEntries(
          headers as Map<string, unknown>,
        )) {
          result.append(name, value);
        }
      }
    }
    return result;
  }

  /**
   * Creates a new `Headers` instance by parsing the given raw headers string.
   * @param value Raw headers string.
   */
  static parse(value: string): Headers {
    const builder = new Headers();
    for (const header of splitLines(value)) {
      const [name, value] = splitPair(header, ":");
      if (name && value) {
        builder.append(name, value);
      }
    }
    return builder;
  }

  private readonly [kMap]: Map<string, HeaderEntry>;

  constructor() {
    Object.defineProperty(this, kMap, {
      value: new Map(),
    });
  }

  *[Symbol.iterator](): Iterator<[string, string | string[]]> {
    for (const { name, value } of this[kMap].values()) {
      yield [name, value];
    }
  }

  /**
   * Creates a new header or replaces the previously created header with the
   * given name.
   */
  set(name: string, value: unknown | readonly unknown[]): this {
    if (name === "") {
      throw new Error();
    }
    const nameLc = name.toLowerCase();
    let entry = this[kMap].get(nameLc);
    if (entry == null) {
      this[kMap].set(nameLc, (entry = new HeaderEntry(name, nameLc)));
    }
    entry.set(stringify(value));
    return this;
  }

  /**
   * Creates a new header or updates the previously created header with the
   * given name.
   */
  append(name: string, value: unknown | readonly unknown[]): this {
    if (name === "") {
      throw new Error();
    }
    const nameLc = name.toLowerCase();
    let entry = this[kMap].get(nameLc);
    if (entry == null) {
      this[kMap].set(nameLc, (entry = new HeaderEntry(name, nameLc)));
    }
    entry.append(stringify(value));
    return this;
  }

  /**
   * Deletes a header with the given name.
   */
  delete(name: string): this {
    if (name === "") {
      throw new Error();
    }
    const nameLc = name.toLowerCase();
    this[kMap].delete(nameLc);
    return this;
  }

  /**
   * Deletes all headers.
   */
  clear(): this {
    this[kMap].clear();
    return this;
  }

  /**
   * Tests if a header with the given name exists.
   * Header name is case-insensitive.
   */
  has(name: string): boolean {
    if (name === "") {
      throw new Error();
    }
    const nameLc = name.toLowerCase();
    return this[kMap].has(nameLc);
  }

  /**
   * Gets value of the header with the given name,
   * or `null` if it does not exist.
   * Header name is case-insensitive.
   */
  get(name: string): string | null {
    if (name === "") {
      throw new Error();
    }
    const nameLc = name.toLowerCase();
    const entry = this[kMap].get(nameLc);
    if (entry != null) {
      const { value } = entry;
      if (Array.isArray(value)) {
        return value[0];
      } else {
        return value;
      }
    } else {
      return null;
    }
  }

  /**
   * Gets all values of the header with the given name,
   * or empty array if it does not exist.
   * Header name is case-insensitive.
   */
  getAll(name: string): string[] {
    if (name === "") {
      throw new Error();
    }
    const nameLc = name.toLowerCase();
    const entry = this[kMap].get(nameLc);
    if (entry != null) {
      const { value } = entry;
      if (Array.isArray(value)) {
        return value;
      } else {
        return [value];
      }
    } else {
      return [];
    }
  }

  map<T>(name: string, parser: (value: string) => T | null): T | null {
    const v = this.get(name);
    if (v != null) {
      return parser(v);
    } else {
      return null;
    }
  }

  mapAll<T>(name: string, parser: (value: string) => T | null): T[] {
    return this.getAll(name)
      .map((v) => parser(v))
      .filter((v) => v != null) as T[];
  }

  toJSON(): Record<string, string | string[]> {
    return Object.fromEntries(this);
  }

  toString(): string {
    const lines: string[] = [];
    for (const entry of this[kMap].values()) {
      const { name, value } = entry;
      if (Array.isArray(value)) {
        for (const item of value) {
          lines.push(`${name}: ${item}`);
        }
      } else {
        lines.push(`${name}: ${value}`);
      }
    }
    return lines.join("\n") + "\n";
  }
}

function stringify(value: unknown | unknown[]): string | string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  } else {
    return String(value);
  }
}

function concat(a: string | string[], b: string | string[]): string[] {
  const x = Array.isArray(a);
  const y = Array.isArray(b);
  if (x && y) {
    return [...a, ...b];
  }
  if (x) {
    return [...a, b as string];
  }
  if (y) {
    return [a as string, ...b];
  }
  return [a as string, b as string];
}
