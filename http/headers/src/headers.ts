import { Accept } from "./accept";
import { CacheControl } from "./cache-control";
import { Cookie } from "./cookie";
import { ETag } from "./etag";
import { Link } from "./link";
import { MimeType } from "./mimetype";
import { SetCookie } from "./set-cookie";
import { splitList, splitPair } from "./strings";
import { parseDate, stringifyDate } from "./tokens";
import type { HeadersJson } from "./types";

// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers

const nonCoalescingHeaders = new Set<string>([
  "date",
  "expires",
  "last-modified",
  "if-modified-since",
  "if-unmodified-since",
  "retry-after",
  "cookie",
  "set-cookie",
  "link",
  "www-authenticate",
  "proxy-authenticate",
  "strict-transport-security",
]);

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
  readonly value: string | readonly string[];

  constructor(name: string, nameLc: string, value: string | readonly string[]) {
    this.name = name;
    this.nameLc = nameLc;
    this.value = nonCoalescingHeaders.has(this.nameLc)
      ? toArray(value)
      : toArray(value).join(", ");
  }

  /**
   * Returns a new copy with the value replaced.
   */
  set(value: string | readonly string[]): HeaderEntry {
    return new HeaderEntry(this.name, this.nameLc, value);
  }

  /**
   * Returns a new copy with the value updated.
   */
  append(value: string | readonly string[]): HeaderEntry {
    return new HeaderEntry(this.name, this.nameLc, [
      ...toArray(this.value),
      ...toArray(value),
    ]);
  }
}

export class HeadersBuilder {
  /**
   * Creates a new builder with values copied from the given headers.
   */
  static from(headers: Headers): HeadersBuilder {
    const builder = new HeadersBuilder();
    for (const { name, value } of headers.entries()) {
      builder.append(name, value);
    }
    return builder;
  }

  readonly [kMap]: Map<string, HeaderEntry>;

  constructor() {
    this[kMap] = new Map();
  }

  /**
   * Creates a new header or replaces the previously created header with the
   * given name.
   */
  set(name: string, value: string | readonly string[]): this {
    if (name === "" || value.length === 0) {
      throw new Error();
    }
    const nameLc = name.toLowerCase();
    const entry =
      this[kMap].get(nameLc)?.set(value) ??
      new HeaderEntry(name, nameLc, value);
    this[kMap].set(nameLc, entry);
    return this;
  }

  /**
   * Creates a new header or updates the previously created header with the
   * given name.
   */
  append(name: string, value: string | readonly string[]): this {
    if (name === "" || value.length === 0) {
      throw new Error();
    }
    const nameLc = name.toLowerCase();
    const entry =
      this[kMap].get(nameLc)?.append(value) ??
      new HeaderEntry(name, nameLc, value);
    this[kMap].set(nameLc, entry);
    return this;
  }

  /**
   * Deletes a header with the given name.
   */
  delete(name: string): this {
    if (name === "") {
      throw new Error();
    }
    this[kMap].delete(name);
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
   * Sets the `Content-Length` header to the given value.
   */
  contentLength(value: number): this {
    this.set("Content-Length", String(value));
    return this;
  }

  /**
   * Sets the `Content-Type` header to the given value.
   */
  contentType(value: MimeType | string): this {
    this.set("Content-Type", String(value));
    return this;
  }

  /**
   * Sets the `Content-Encoding` header to the given value.
   */
  contentEncoding(value: string): this {
    this.set("Content-Encoding", String(value));
    return this;
  }

  /**
   * Sets the `Accept` header to the given value.
   */
  accept(value: Accept | string): this {
    this.set("Accept", String(value));
    return this;
  }

  /**
   * Sets the `Cache-Control` header to the given value.
   */
  cacheControl(value: CacheControl | string): this {
    this.set("Cache-Control", String(value));
    return this;
  }

  /**
   * Sets the `ETag` header to the given value.
   */
  etag(value: ETag | string): this {
    this.set("ETag", String(value));
    return this;
  }

  /**
   * Sets the `If-Match` header to the given value.
   */
  ifMatch(value: ETag | string): this {
    this.set("If-Match", String(value));
    return this;
  }

  /**
   * Sets the `If-None-Match` header to the given value.
   */
  ifNoneMatch(value: ETag | string): this {
    this.set("If-None-Match", String(value));
    return this;
  }

  /**
   * Sets the `Last-Modified` header to the given value.
   */
  lastModified(value: Date | string): this {
    this.set("Last-Modified", stringifyDate(value));
    return this;
  }

  /**
   * Sets the `If-Modified-Since` header to the given value.
   */
  ifModifiedSince(value: Date | string): this {
    this.set("If-Modified-Since", stringifyDate(value));
    return this;
  }

  /**
   * Sets the `If-Unmodified-Since` header to the given value.
   */
  ifUnmodifiedSince(value: Date | string): this {
    this.set("If-Unmodified-Since", stringifyDate(value));
    return this;
  }

  appendVary(value: string): this {
    this.append("Vary", value);
    return this;
  }

  appendCookie(value: Cookie | string): this {
    this.append("Cookie", String(value));
    return this;
  }

  appendSetCookie(value: SetCookie | string): this {
    this.append("Set-Cookie", String(value));
    return this;
  }

  appendLink(value: Link | string): this {
    this.append("Link", String(value));
    return this;
  }

  build(): Headers {
    return new Headers(this);
  }
}

/**
 * A collection of HTTP headers.
 */
export class Headers {
  /**
   * Returns a new empty Headers builder.
   */
  static builder(): HeadersBuilder {
    return new HeadersBuilder();
  }

  /**
   * Creates a new Headers instance from the given JSON object
   * with key/value pairs.
   */
  static fromJSON(json: HeadersJson): Headers {
    const builder = new HeadersBuilder();
    for (const [name, value] of Object.entries(json)) {
      if (value != null) {
        if (Array.isArray(value)) {
          for (const item of value) {
            builder.append(name, String(item));
          }
        } else {
          builder.append(name, String(value));
        }
      }
    }
    return builder.build();
  }

  /**
   * Creates a new Headers instance by parsing the given raw headers string.
   * @param value Raw headers string.
   */
  static parse(value: string): Headers {
    const builder = new HeadersBuilder();
    for (const header of splitList(value, "\n")) {
      const [name, value] = splitPair(header, ":");
      if (name && value) {
        builder.append(name, value);
      }
    }
    return builder.build();
  }

  readonly [kMap]: Map<string, HeaderEntry>;

  constructor(builder: HeadersBuilder) {
    this[kMap] = new Map(builder[kMap]);
  }

  /**
   * Tests if a header with the given name exists.
   * Header name is case-insensitive.
   */
  has(name: string): boolean {
    return this[kMap].has(name.toLowerCase());
  }

  /**
   * Gets value of the header with the given name,
   * or `null` if it does not exist.
   * If header has multiple values these will be joined into a single string
   * using the standard separator.
   * Header name is case-insensitive.
   */
  get(name: string): string | null {
    const entry = this[kMap].get(name.toLowerCase());
    if (entry != null) {
      return fromArray(entry.value);
    } else {
      return null;
    }
  }

  /**
   * Gets all values of the header with the given name,
   * or empty array if it does not exist.
   * Header name is case-insensitive.
   */
  getAll(name: string): readonly string[] {
    const entry = this[kMap].get(name.toLowerCase());
    if (entry != null) {
      return toArray(entry.value);
    } else {
      return [];
    }
  }

  /**
   * Gets parsed value with the given name,
   * or `null` if it does not exist.
   * The specified parser will be applied to header string
   * to convert it to a desired type.
   * Header name is case-insensitive.
   */
  value<T>(name: string, parser: (value: string) => T): T | null {
    const value = this.get(name);
    if (value != null) {
      return parser(value);
    } else {
      return null;
    }
  }

  /**
   * Gets all parsed values of the header with the given name,
   * or empty array if it does not exist.
   * The specified parser will be applied to all header strings
   * to convert them to a desired type.
   * Header name is case-insensitive.
   * @param name
   * @param parser
   */
  allValues<T>(name: string, parser: (value: string) => T): readonly T[] {
    const value = this.getAll(name);
    if (value != null) {
      return value.map(parser);
    } else {
      return [];
    }
  }

  *entries(): IterableIterator<{
    name: string;
    value: string | readonly string[];
  }> {
    for (const { name, value } of this[kMap].values()) {
      yield { name, value };
    }
  }

  contentLength(): number | null {
    return this.value("Content-Length", Number);
  }

  contentType(): MimeType | null {
    return this.value("Content-Type", MimeType.parse);
  }

  contentEncoding(): string | null {
    return this.value("Content-Encoding", String);
  }

  accept(): Accept | null {
    return this.value("Accept", Accept.parse);
  }

  cacheControl(): CacheControl | null {
    return this.value("Cache-Control", CacheControl.parse);
  }

  etag(): ETag | null {
    return this.value("ETag", ETag.parse);
  }

  ifMatch(): ETag | null {
    return this.value("If-Match", ETag.parse);
  }

  ifNoneMatch(): ETag | null {
    return this.value("If-None-Match", ETag.parse);
  }

  lastModified(): Date | null {
    return this.value("Last-Modified", parseDate);
  }

  ifModifiedSince(): Date | null {
    return this.value("If-Modified-Since", parseDate);
  }

  ifUnmodifiedSince(): Date | null {
    return this.value("If-Unmodified-Since", parseDate);
  }

  allCookies(): readonly Cookie[] {
    return this.allValues("Cookie", Cookie.parse);
  }

  allSetCookies(): readonly SetCookie[] {
    return this.allValues("Set-Cookie", SetCookie.parse);
  }

  allLinks(): readonly Link[] {
    return this.allValues("Link", Link.parse);
  }

  toJSON(): any {
    return Object.fromEntries(
      [...this[kMap].values()].map(({ name, value }) => [name, value]),
    );
  }

  toString(): string {
    const lines: string[] = [];
    for (const entry of this[kMap].values()) {
      const { name, nameLc, value } = entry;
      if (nonCoalescingHeaders.has(nameLc)) {
        for (const item of toArray(value)) {
          lines.push(`${name}: ${item}`);
        }
      } else {
        lines.push(`${name}: ${value}`);
      }
    }
    return lines.join("\n") + "\n";
  }

  toBuilder(): HeadersBuilder {
    return HeadersBuilder.from(this);
  }
}

function toArray(value: string | readonly string[]): readonly string[] {
  if (Array.isArray(value)) {
    return value;
  } else {
    return [value as string];
  }
}

function fromArray(value: string | readonly string[]): string {
  if (Array.isArray(value)) {
    return value[0];
  } else {
    return value as string;
  }
}
