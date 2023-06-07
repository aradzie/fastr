import { CookieCodec } from "./cookie-codec.js";
import { entriesOf, type NameValueEntries } from "./entries.js";
import {
  getHeader,
  type GetHeader,
  type Header,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";
import { readCookieNameValue } from "./syntax/cookie.js";
import { isToken, Scanner, Separator } from "./syntax/syntax.js";

const headerName = "Cookie";
const headerNameLc = "cookie";

/**
 * The `Cookie` header.
 *
 * @see https://httpwg.org/specs/rfc6265.html
 * @see https://httpwg.org/specs/rfc6265.html#section-4.2
 */
export class Cookie implements Header, Iterable<[string, string]> {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: Cookie | string): Cookie {
    if (typeof value === "string") {
      return Cookie.parse(value);
    } else {
      return value;
    }
  }

  static get(headers: GetHeader): Cookie | null {
    return getHeader(Cookie, headers);
  }

  static tryGet(headers: GetHeader): Cookie | null {
    return tryGetHeader(Cookie, headers);
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
      const nameValue = readCookieNameValue(scanner);
      if (nameValue != null) {
        header.set(nameValue[0], CookieCodec.decode(nameValue[1]));
      }
      if (!scanner.readChar(Separator.Semicolon)) {
        break;
      }
      scanner.skipWs();
    }
    return header;
  }

  readonly #map = new Map<string, string>();

  constructor(data: NameValueEntries | null = null) {
    if (data != null) {
      for (const [name, value] of entriesOf(data)) {
        this.set(name, value);
      }
    }
  }

  [Symbol.iterator](): Iterator<[string, string]> {
    return this.#map.entries();
  }

  get size(): number {
    return this.#map.size;
  }

  keys(): IterableIterator<string> {
    return this.#map.keys();
  }

  entries(): IterableIterator<[string, string]> {
    return this.#map.entries();
  }

  has(name: string): boolean {
    return this.#map.has(name);
  }

  get(name: string): string | null {
    return this.#map.get(name) ?? null;
  }

  set(name: string, value: unknown): void {
    this.#map.set(name, String(value));
  }

  delete(name: string): void {
    this.#map.delete(name);
  }

  clear(): void {
    this.#map.clear();
  }

  toString(): string {
    const parts: string[] = [];
    for (const [name, value] of this.#map) {
      if (!isToken(name)) {
        throw new TypeError(`Invalid cookie name [${name}]`);
      }
      parts.push(`${name}=${CookieCodec.encode(value)}`);
    }
    return parts.join("; ");
  }

  get [Symbol.toStringTag](): string {
    return "Cookie";
  }
}
