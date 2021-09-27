import { InvalidHeaderNameError, InvalidHeaderValueError } from "./errors.js";
import { splitLines, splitPair } from "./strings.js";
import { isToken, isValidHeaderValue } from "./syntax.js";
import type { NameValueEntries } from "./types.js";
import { multiEntriesOf } from "./util.js";

const kMap = Symbol("kMap");

/**
 * A collection of HTTP headers.
 */
export class HttpHeaders implements Iterable<[string, string | string[]]> {
  /**
   * Creates a new `Headers` instance by parsing the given raw headers string.
   * @param value Raw headers string.
   */
  static parse(value: string): HttpHeaders {
    const headers = new HttpHeaders();
    for (const header of splitLines(value)) {
      const [name, value] = splitPair(header, ":");
      if (name && value) {
        headers.append(name, value);
      }
    }
    return headers;
  }

  private readonly [kMap]: Map<string, Entry>;

  constructor(
    data:
      | HttpHeaders
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    Object.defineProperty(this, kMap, {
      value: new Map(),
    });
    if (data != null) {
      if (data instanceof HttpHeaders) {
        for (const [name, value] of data) {
          this.append(name, value);
        }
      } else {
        for (const [name, value] of multiEntriesOf(
          data as Map<string, unknown>,
        )) {
          this.append(name, value);
        }
      }
    }
  }

  *[Symbol.iterator](): Iterator<[string, string | string[]]> {
    for (const { name, value } of this[kMap].values()) {
      yield [name, value];
    }
  }

  /**
   * Creates a new header or replaces the previously created header with the
   * given name.
   * Header name is case-insensitive.
   */
  set(name: string, value: unknown): this {
    if (!isToken(name)) {
      throw new InvalidHeaderNameError();
    }
    let stringified;
    if (value == null || !isValidHeaderValue((stringified = String(value)))) {
      throw new InvalidHeaderValueError();
    }
    const nameLc = name.toLowerCase();
    const entry = this[kMap].get(nameLc);
    if (entry != null) {
      entry.set(stringified);
    } else {
      this[kMap].set(nameLc, new Entry(name, nameLc, stringified));
    }
    return this;
  }

  /**
   * Creates a new header or updates the previously created header with the
   * given name.
   * Header name is case-insensitive.
   */
  append(name: string, value: unknown): this {
    if (!isToken(name)) {
      throw new InvalidHeaderNameError();
    }
    let stringified;
    if (value == null || !isValidHeaderValue((stringified = String(value)))) {
      throw new InvalidHeaderValueError();
    }
    const nameLc = name.toLowerCase();
    const entry = this[kMap].get(nameLc);
    if (entry != null) {
      entry.append(stringified);
    } else {
      this[kMap].set(nameLc, new Entry(name, nameLc, stringified));
    }
    return this;
  }

  /**
   * Deletes a header with the given name.
   * Header name is case-insensitive.
   */
  delete(name: string): this {
    if (!isToken(name)) {
      throw new InvalidHeaderNameError();
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
    if (!isToken(name)) {
      throw new InvalidHeaderNameError();
    }
    const nameLc = name.toLowerCase();
    return this[kMap].has(nameLc);
  }

  /**
   * Gets value of the header with the given name,
   * or `null` if the header is missing.
   * Header name is case-insensitive.
   */
  get(name: string): string | null {
    if (!isToken(name)) {
      throw new InvalidHeaderNameError();
    }
    const nameLc = name.toLowerCase();
    const entry = this[kMap].get(nameLc);
    if (entry != null) {
      return entry.get();
    } else {
      return null;
    }
  }

  /**
   * Gets all values of the header with the given name,
   * or empty array if it does not exist.
   * Header name is case-insensitive.
   *
   * Although this class is isomorphic and can be used in the browser, this
   * specific method exists only in the node server. A bundler such as webpack
   * will replace this code with a browser-specific version which does not have
   * this method.
   */
  getAll(name: string): string[] {
    if (!isToken(name)) {
      throw new InvalidHeaderNameError();
    }
    const nameLc = name.toLowerCase();
    const entry = this[kMap].get(nameLc);
    if (entry != null) {
      return entry.getAll();
    } else {
      return [];
    }
  }

  /**
   * Passes header string value through the specified parser and returns either
   * a parsed value of `null` if the header is missing.
   * Header name is case-insensitive.
   */
  map<T>(name: string, parser: (value: string) => T | null): T | null {
    const v = this.get(name);
    if (v != null) {
      return parser(v);
    } else {
      return null;
    }
  }

  /**
   * Passes header string values through the specified parser and returns either
   * an array of parsed values or an empty array if the header is missing.
   *
   * Although this class is isomorphic and can be used in the browser, this
   * specific method exists only in the node server. A bundler such as webpack
   * will replace this code with a browser-specific version which does not have
   * this method.
   */
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

  get [Symbol.toStringTag](): string {
    return "HttpHeaders";
  }
}

class Entry {
  /**
   * The header value.
   */
  value!: string | string[];

  constructor(readonly name: string, readonly nameLc: string, value: string) {
    this.set(value);
  }

  set(value: string): void {
    switch (this.nameLc) {
      case "set-cookie":
        this.value = [value];
        break;
      case "cookie":
        this.value = value;
        break;
      default:
        this.value = value;
        break;
    }
  }

  append(value: string): void {
    switch (this.nameLc) {
      case "set-cookie":
        (this.value as string[]).push(value);
        break;
      case "cookie":
        (this.value as string) += "; " + value;
        break;
      default:
        (this.value as string) += ", " + value;
        break;
    }
  }

  get(): string {
    if (this.nameLc === "set-cookie") {
      return (this.value as string[])[0];
    } else {
      return this.value as string;
    }
  }

  getAll(): string[] {
    if (this.nameLc === "set-cookie") {
      return this.value as string[];
    } else {
      return [this.value as string];
    }
  }
}
