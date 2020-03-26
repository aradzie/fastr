import { CookieCodec } from "./cookie-codec.js";
import { entriesOf, type NameValueEntries } from "./entries.js";
import { type Header, parseOrThrow } from "./headers.js";
import { isValidCookieValue } from "./syntax-cookie.js";
import { isToken, Scanner, Separator } from "./syntax.js";

/**
 * The `Cookie` header.
 *
 * @see https://httpwg.org/specs/rfc6265.html
 * @see https://httpwg.org/specs/rfc6265.html#section-4.2
 */
export class Cookie implements Header, Iterable<[string, string]> {
  static from(value: Cookie | string): Cookie {
    if (typeof value === "string") {
      return Cookie.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): Cookie {
    return parseOrThrow(Cookie, input);
  }

  static tryParse(input: string): Cookie | null {
    // cookie-header = "Cookie:" OWS cookie-string OWS
    // cookie-string = cookie-pair *( ";" SP cookie-pair )
    // cookie-pair   = cookie-name "=" cookie-value
    // cookie-name   = token
    // cookie-value  = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
    // cookie-octet  = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
    //                   ; US-ASCII characters excluding CTLs,
    //                   ; whitespace DQUOTE, comma, semicolon,
    //                   ; and backslash
    const header = new Cookie();
    const scanner = new Scanner(input);
    while (scanner.hasNext()) {
      const name = scanner.readToken();
      if (name == null) {
        return null;
      }
      if (!scanner.readChar(Separator.Equals)) {
        return null;
      }
      const value = scanner.readUntil(Separator.Semicolon);
      if (!isValidCookieValue(value)) {
        return null;
      }
      header._map.set(name, CookieCodec.decode(value));
      if (!scanner.readChar(Separator.Semicolon)) {
        break;
      }
      scanner.skipWs();
    }
    return header;
  }

  private readonly _map = new Map<string, string>();

  constructor(
    data:
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    if (data != null) {
      for (const [name, value] of entriesOf(data as NameValueEntries)) {
        this.set(name, value);
      }
    }
  }

  [Symbol.iterator](): Iterator<[string, string]> {
    return this._map.entries();
  }

  get size(): number {
    return this._map.size;
  }

  keys(): IterableIterator<string> {
    return this._map.keys();
  }

  entries(): IterableIterator<[string, string]> {
    return this._map.entries();
  }

  has(name: string): boolean {
    if (!isToken(name)) {
      throw new TypeError();
    }
    return this._map.has(name);
  }

  get(name: string): string | null {
    if (!isToken(name)) {
      throw new TypeError();
    }
    return this._map.get(name) ?? null;
  }

  set(name: string, value: unknown): void {
    if (!isToken(name)) {
      throw new TypeError();
    }
    this._map.set(name, String(value));
  }

  delete(name: string): void {
    if (!isToken(name)) {
      throw new TypeError();
    }
    this._map.delete(name);
  }

  clear(): void {
    this._map.clear();
  }

  toString(): string {
    const parts: string[] = [];
    for (const [name, value] of this._map) {
      parts.push(`${name}=${CookieCodec.encode(value)}`);
    }
    return parts.join("; ");
  }

  get [Symbol.toStringTag](): string {
    return "Cookie";
  }
}
