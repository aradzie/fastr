import {
  InvalidHeaderNameError,
  InvalidHeaderValueError,
  isToken,
  isValidHeaderValue,
  multiEntriesOf,
} from "@fastr/headers";
import { type NameValueEntries } from "./types.js";

const kMap = Symbol("kMap");

/**
 * A collection of HTTP headers.
 */
export class HttpHeaders implements Headers, Iterable<[string, string]> {
  private declare readonly [kMap]: Map<string, Entry>;

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

  *[Symbol.iterator](): IterableIterator<[string, string]> {
    for (const { name, value } of this[kMap].values()) {
      yield [name, value];
    }
  }

  *entries(): IterableIterator<[string, string]> {
    for (const { name, value } of this[kMap].values()) {
      yield [name, value];
    }
  }

  *keys(): IterableIterator<string> {
    for (const { name } of this[kMap].values()) {
      yield name;
    }
  }

  *values(): IterableIterator<string> {
    for (const { value } of this[kMap].values()) {
      yield value;
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

  forEach(
    cb: (value: string, key: string, parent: Headers) => void,
    thisArg?: any,
  ): void {
    for (const { name, value } of this[kMap].values()) {
      cb.call(thisArg, value, name, this);
    }
  }

  toJSON(): Record<string, string> {
    return Object.fromEntries(this);
  }

  toString(): string {
    const lines: string[] = [];
    for (const entry of this[kMap].values()) {
      const { name, value } = entry;
      lines.push(`${name}: ${value}`);
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
  value!: string;

  constructor(readonly name: string, readonly nameLc: string, value: string) {
    this.set(value);
  }

  set(value: string): void {
    this.value = value;
  }

  append(value: string): void {
    this.value += ", " + value;
  }

  get(): string {
    return this.value;
  }
}
