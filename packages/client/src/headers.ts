import {
  type IncomingHeaders,
  isToken,
  isValidHeaderValue,
  multiEntriesOf,
  type NameValueEntries,
  type OutgoingHeaders,
} from "@fastr/headers";

/**
 * A collection of HTTP headers.
 */
export class HttpHeaders
  implements
    IncomingHeaders,
    OutgoingHeaders,
    Iterable<[string, string | string[]]>
{
  readonly #map = new Map<string, Entry>();

  constructor(data: NameValueEntries | null = null) {
    if (data != null) {
      for (const [name, value] of multiEntriesOf(data)) {
        this.append(name, value);
      }
    }
  }

  *[Symbol.iterator](): Iterator<[string, string | string[]]> {
    for (const { name, value } of this.#map.values()) {
      yield [name, value];
    }
  }

  *entries(): IterableIterator<[string, string | string[]]> {
    for (const { name, value } of this.#map.values()) {
      yield [name, value];
    }
  }

  *keys(): IterableIterator<string> {
    for (const { name } of this.#map.values()) {
      yield name;
    }
  }

  *values(): IterableIterator<string | string[]> {
    for (const { value } of this.#map.values()) {
      yield value;
    }
  }

  names(): Iterable<string> {
    return this.keys();
  }

  /**
   * Creates a new header or replaces the previously created header with the
   * given name.
   * Header name is case-insensitive.
   */
  set(name: string, value: unknown): this {
    if (!isToken(name)) {
      throw new TypeError(`Invalid header name "${name}"`);
    }
    if (value == null) {
      throw new TypeError(`Invalid header value [null]`);
    }
    const stringified = String(value);
    if (!isValidHeaderValue(stringified)) {
      throw new TypeError(`Invalid header value "${stringified}"`);
    }
    const nameLc = name.toLowerCase();
    const entry = this.#map.get(nameLc);
    if (entry != null) {
      entry.set(stringified);
    } else {
      this.#map.set(nameLc, new Entry(name, nameLc, stringified));
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
      throw new TypeError(`Invalid header name "${name}"`);
    }
    if (value == null) {
      throw new TypeError(`Invalid header value [null]`);
    }
    const stringified = String(value);
    if (!isValidHeaderValue(stringified)) {
      throw new TypeError(`Invalid header value "${stringified}"`);
    }
    const nameLc = name.toLowerCase();
    const entry = this.#map.get(nameLc);
    if (entry != null) {
      entry.append(stringified);
    } else {
      this.#map.set(nameLc, new Entry(name, nameLc, stringified));
    }
    return this;
  }

  /**
   * Deletes a header with the given name.
   * Header name is case-insensitive.
   */
  delete(name: string): this {
    if (!isToken(name)) {
      throw new TypeError(`Invalid header name "${name}"`);
    }
    const nameLc = name.toLowerCase();
    this.#map.delete(nameLc);
    return this;
  }

  /**
   * Deletes all headers.
   */
  clear(): this {
    this.#map.clear();
    return this;
  }

  /**
   * Tests if a header with the given name exists.
   * Header name is case-insensitive.
   */
  has(name: string): boolean {
    if (!isToken(name)) {
      throw new TypeError(`Invalid header name "${name}"`);
    }
    const nameLc = name.toLowerCase();
    return this.#map.has(nameLc);
  }

  /**
   * Gets value of the header with the given name,
   * or `null` if the header is missing.
   * Header name is case-insensitive.
   */
  get(name: string): string | null {
    if (!isToken(name)) {
      throw new TypeError(`Invalid header name "${name}"`);
    }
    const nameLc = name.toLowerCase();
    return this.#map.get(nameLc)?.get() ?? null;
  }

  /**
   * Gets all values of the header with the given name,
   * or empty array if it does not exist.
   * Header name is case-insensitive.
   */
  getAll(name: string): readonly string[] {
    if (!isToken(name)) {
      throw new TypeError(`Invalid header name "${name}"`);
    }
    const nameLc = name.toLowerCase();
    return this.#map.get(nameLc)?.getAll() ?? [];
  }

  toJSON(): Record<string, string | string[]> {
    return Object.fromEntries(this);
  }

  toString(): string {
    const lines: string[] = [];
    for (const entry of this.#map.values()) {
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
