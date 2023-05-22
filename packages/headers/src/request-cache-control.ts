import { type ExtField, ExtFields } from "./extfields.js";
import { type Header, parseOrThrow } from "./headers.js";
import { Scanner, Separator } from "./syntax.js";

export interface RequestCacheControlInit {
  readonly noCache?: boolean;
  readonly noStore?: boolean;
  readonly noTransform?: boolean;
  readonly onlyIfCached?: boolean;
  readonly maxAge?: number | null;
  readonly maxStale?: number | null;
  readonly minFresh?: number | null;
  readonly ext?: readonly ExtField[] | null;
}

const headerName = "Cache-Control";
const headerNameLc = "cache-control";

/**
 * The `Cache-Control` header, transferred in a request.
 *
 * @see https://httpwg.org/specs/rfc9111.html#rfc.section.5.2
 * @see https://httpwg.org/specs/rfc9111.html#rfc.section.5.2.2
 */
export class RequestCacheControl implements Header {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: RequestCacheControl | string): RequestCacheControl {
    if (typeof value === "string") {
      return RequestCacheControl.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): RequestCacheControl {
    return parseOrThrow(RequestCacheControl, input);
  }

  static tryParse(input: string): RequestCacheControl | null {
    // Cache-Control   = #cache-directive
    // cache-directive = token [ "=" ( token / quoted-string ) ]
    const header = new RequestCacheControl();
    const scanner = new Scanner(input);
    while (scanner.hasNext()) {
      const name = scanner.readToken();
      if (name == null) {
        return null;
      }
      switch (name.toLowerCase()) {
        case "no-cache":
          header.noCache = true;
          break;
        case "no-store":
          header.noStore = true;
          break;
        case "no-transform":
          header.noTransform = true;
          break;
        case "only-if-cached":
          header.onlyIfCached = true;
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
        case "max-stale":
          scanner.skipWs();
          if (scanner.readChar(Separator.Equals)) {
            scanner.skipWs();
            const value = scanner.readInteger();
            if (value != null) {
              header.maxStale = value;
            } else {
              return null;
            }
          } else {
            return null;
          }
          break;
        case "min-fresh":
          scanner.skipWs();
          if (scanner.readChar(Separator.Equals)) {
            scanner.skipWs();
            const value = scanner.readInteger();
            if (value != null) {
              header.minFresh = value;
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
  noCache = false;
  noStore = false;
  noTransform = false;
  onlyIfCached = false;
  maxAge: number | null = null;
  maxStale: number | null = null;
  minFresh: number | null = null;

  constructor(init: RequestCacheControlInit | null = null) {
    if (init != null) {
      const {
        noCache = false,
        noStore = false,
        noTransform = false,
        onlyIfCached = false,
        maxAge = null,
        maxStale = null,
        minFresh = null,
        ext = null,
      } = init;
      this.noCache = noCache;
      this.noStore = noStore;
      this.noTransform = noTransform;
      this.onlyIfCached = onlyIfCached;
      this.maxAge = maxAge;
      this.maxStale = maxStale;
      this.minFresh = minFresh;
      if (ext != null) {
        for (const [name, value] of ext) {
          this.ext.set(name, value);
        }
      }
    }
  }

  toString(): string {
    const parts: string[] = [];
    if (this.noCache) {
      parts.push("no-cache");
    }
    if (this.noStore) {
      parts.push("no-store");
    }
    if (this.noTransform) {
      parts.push("no-transform");
    }
    if (this.onlyIfCached) {
      parts.push("only-if-cached");
    }
    if (this.maxAge != null) {
      parts.push(`max-age=${this.maxAge}`);
    }
    if (this.maxStale != null) {
      parts.push(`max-stale=${this.maxStale}`);
    }
    if (this.minFresh != null) {
      parts.push(`min-fresh=${this.minFresh}`);
    }
    const ext = String(this.ext);
    if (ext) {
      parts.push(ext);
    }
    return parts.join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "RequestCacheControl";
  }
}
