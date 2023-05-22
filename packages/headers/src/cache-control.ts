import { type ExtField, ExtFields } from "./extfields.js";
import {
  getHeader,
  type Header,
  type IncomingHeaders,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";
import { Scanner, Separator } from "./syntax.js";

export interface CacheControlInit {
  readonly isPublic?: boolean;
  readonly isPrivate?: boolean;
  readonly noCache?: boolean;
  readonly noStore?: boolean;
  readonly noTransform?: boolean;
  readonly mustRevalidate?: boolean;
  readonly proxyRevalidate?: boolean;
  readonly maxAge?: number | null;
  readonly sMaxAge?: number | null;
  readonly ext?: readonly ExtField[] | null;
}

const headerName = "Cache-Control";
const headerNameLc = "cache-control";

/**
 * The `Cache-Control` header, transferred in a response.
 *
 * @see https://httpwg.org/specs/rfc9111.html#rfc.section.5.2
 * @see https://httpwg.org/specs/rfc9111.html#rfc.section.5.2.1
 */
export class CacheControl implements Header {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: CacheControl | string): CacheControl {
    if (typeof value === "string") {
      return CacheControl.parse(value);
    } else {
      return value;
    }
  }

  static get(headers: IncomingHeaders): CacheControl | null {
    return getHeader(CacheControl, headers);
  }

  static tryGet(headers: IncomingHeaders): CacheControl | null {
    return tryGetHeader(CacheControl, headers);
  }

  static parse(input: string): CacheControl {
    return parseOrThrow(CacheControl, input);
  }

  static tryParse(input: string): CacheControl | null {
    // Cache-Control   = #cache-directive
    // cache-directive = token [ "=" ( token / quoted-string ) ]
    const header = new CacheControl();
    const scanner = new Scanner(input);
    while (scanner.hasNext()) {
      const name = scanner.readToken();
      if (name == null) {
        return null;
      }
      switch (name.toLowerCase()) {
        case "public":
          header.isPublic = true;
          break;
        case "private":
          header.isPrivate = true;
          break;
        case "no-cache":
          header.noCache = true;
          break;
        case "no-store":
          header.noStore = true;
          break;
        case "no-transform":
          header.noTransform = true;
          break;
        case "must-revalidate":
          header.mustRevalidate = true;
          break;
        case "proxy-revalidate":
          header.proxyRevalidate = true;
          break;
        case "max-age":
          scanner.skipWs();
          if (scanner.readChar(Separator.Equals)) {
            scanner.skipWs();
            const value = scanner.readInteger();
            if (value != null) {
              header.maxAge = value;
            } else {
              return null;
            }
          } else {
            return null;
          }
          break;
        case "s-maxage":
          scanner.skipWs();
          if (scanner.readChar(Separator.Equals)) {
            scanner.skipWs();
            const value = scanner.readInteger();
            if (value != null) {
              header.sMaxAge = value;
            } else {
              return null;
            }
          } else {
            return null;
          }
          break;
        default:
          scanner.skipWs();
          if (scanner.readChar(Separator.Equals)) {
            scanner.skipWs();
            const value = scanner.readTokenOrQuotedString();
            if (value != null) {
              header.ext.set(name, value);
            } else {
              return null;
            }
          } else {
            header.ext.set(name, null);
          }
          break;
      }
      scanner.skipWs();
      if (!scanner.readChar(Separator.Comma)) {
        break;
      }
      scanner.skipWs();
    }
    return header;
  }

  readonly ext = new ExtFields();
  isPublic = false;
  isPrivate = false;
  noCache = false;
  noStore = false;
  noTransform = false;
  mustRevalidate = false;
  proxyRevalidate = false;
  maxAge: number | null = null;
  sMaxAge: number | null = null;

  constructor(init: CacheControlInit | null = null) {
    if (init != null) {
      const {
        isPublic = false,
        isPrivate = false,
        noCache = false,
        noStore = false,
        noTransform = false,
        mustRevalidate = false,
        proxyRevalidate = false,
        maxAge = null,
        sMaxAge = null,
        ext = null,
      } = init;
      this.isPublic = isPublic;
      this.isPrivate = isPrivate;
      this.noCache = noCache;
      this.noStore = noStore;
      this.noTransform = noTransform;
      this.mustRevalidate = mustRevalidate;
      this.proxyRevalidate = proxyRevalidate;
      this.maxAge = maxAge;
      this.sMaxAge = sMaxAge;
      if (ext != null) {
        for (const [name, value] of ext) {
          this.ext.set(name, value);
        }
      }
    }
  }

  toString(): string {
    const parts: string[] = [];
    if (this.isPublic) {
      parts.push("public");
    }
    if (this.isPrivate) {
      parts.push("private");
    }
    if (this.noCache) {
      parts.push("no-cache");
    }
    if (this.noStore) {
      parts.push("no-store");
    }
    if (this.noTransform) {
      parts.push("no-transform");
    }
    if (this.mustRevalidate) {
      parts.push("must-revalidate");
    }
    if (this.proxyRevalidate) {
      parts.push("proxy-revalidate");
    }
    if (this.maxAge != null) {
      parts.push(`max-age=${this.maxAge}`);
    }
    if (this.sMaxAge != null) {
      parts.push(`s-maxage=${this.sMaxAge}`);
    }
    const ext = String(this.ext);
    if (ext) {
      parts.push(ext);
    }
    return parts.join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "CacheControl";
  }
}
