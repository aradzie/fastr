import { CookieCodec } from "./cookie-codec.js";
import { InvalidCookieHeaderError } from "./errors.js";
import { isToken, isValidCookieValue, Scanner } from "./syntax.js";
import type { Header, NameValueEntries } from "./types.js";
import { entriesOf } from "./util.js";

const kMap = Symbol("kMap");

/**
 * Represents the value of the `Cookie` header, transferred in a request.
 *
 * See https://tools.ietf.org/html/rfc6265
 */
export class Cookie implements Header, Iterable<[string, string]> {
  static from(value: Cookie | string): Cookie {
    if (typeof value === "string") {
      return Cookie.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `Cookie` by parsing the given header string.
   * See https://tools.ietf.org/html/rfc6265#section-4.2.1
   * See https://tools.ietf.org/html/rfc6265#section-5.4
   */
  static parse(input: string): Cookie {
    // cookie-header = "Cookie:" OWS cookie-string OWS
    // cookie-string = cookie-pair *( ";" SP cookie-pair )
    // cookie-pair   = cookie-name "=" cookie-value
    // cookie-name   = token
    // cookie-value  = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
    // cookie-octet  = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
    //                   ; US-ASCII characters excluding CTLs,
    //                   ; whitespace DQUOTE, comma, semicolon,
    //                   ; and backslash
    const data: [string, string][] = [];
    const scanner = new Scanner(input);
    while (scanner.hasNext()) {
      const name = scanner.readUntil(0x3d /* = */, /* trim= */ true);
      if (name !== "" && !isToken(name)) {
        throw new InvalidCookieHeaderError();
      }
      if (!scanner.readSeparator(0x3d /* = */)) {
        throw new InvalidCookieHeaderError();
      }

      const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
      if (!isValidCookieValue(value)) {
        throw new InvalidCookieHeaderError();
      }
      data.push([name, CookieCodec.decode(value)]);
      if (!scanner.readSeparator(0x3b /* ; */)) {
        break;
      }
    }
    return new Cookie(data);
  }

  private readonly [kMap]: Map<string, string>;

  constructor(
    data:
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    const map = new Map<string, string>();
    if (data != null) {
      for (const [name, value] of entriesOf(data as Map<string, unknown>)) {
        map.set(name, value);
      }
    }
    Object.defineProperty(this, kMap, {
      value: map,
    });
  }

  *[Symbol.iterator](): Iterator<[string, string]> {
    for (const [name, value] of this[kMap]) {
      yield [name, value];
    }
  }

  keys(): Iterable<string> {
    return this[kMap].keys();
  }

  values(): Iterable<string> {
    return this[kMap].values();
  }

  entries(): Iterable<[string, string]> {
    return this[kMap].entries();
  }

  has(name: string): boolean {
    return this[kMap].has(name);
  }

  get(name: string): string | null {
    return this[kMap].get(name) ?? null;
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

  toString(): string {
    const parts: string[] = [];
    for (const [name, value] of this[kMap]) {
      parts.push(`${name}=${CookieCodec.encode(value)}`);
    }
    return parts.join("; ");
  }

  get [Symbol.toStringTag](): string {
    return "Cookie";
  }
}
