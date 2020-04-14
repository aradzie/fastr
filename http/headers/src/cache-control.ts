import { InvalidCacheControlHeaderError } from "./errors";
import { Scanner } from "./syntax";
import type { Header } from "./types";

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
}

/**
 * Parsed `Cache-Control` header.
 */
export class CacheControl implements Header {
  static from(value: CacheControl | string): CacheControl {
    if (typeof value === "string") {
      return CacheControl.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `CacheControl` by parsing
   * the given header string.
   *
   * See https://tools.ietf.org/html/rfc7234#section-5.2
   *
   * ```
   * Cache-Control   = 1#cache-directive
   * cache-directive = token [ "=" ( token / quoted-string ) ]
   * ```
   */
  static parse(input: string): CacheControl {
    let isPublic = false;
    let isPrivate = false;
    let noCache = false;
    let noStore = false;
    let noTransform = false;
    let mustRevalidate = false;
    let proxyRevalidate = false;
    let maxAge: number | null = null;
    let sMaxAge: number | null = null;
    const scanner = new Scanner(input);
    while (scanner.hasNext()) {
      const name = scanner.readToken();
      if (name == null) {
        throw new InvalidCacheControlHeaderError();
      }
      switch (name.toLowerCase()) {
        case "public":
          isPublic = true;
          break;
        case "private":
          isPrivate = true;
          break;
        case "no-cache":
          noCache = true;
          break;
        case "no-store":
          noStore = true;
          break;
        case "no-transform":
          noTransform = true;
          break;
        case "must-revalidate":
          mustRevalidate = true;
          break;
        case "proxy-revalidate":
          proxyRevalidate = true;
          break;
        case "max-age":
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readTokenOrQuotedString();
            if (value) {
              maxAge = Number(value);
            } else {
              throw new InvalidCacheControlHeaderError();
            }
          } else {
            throw new InvalidCacheControlHeaderError();
          }
          break;
        case "s-maxage":
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readTokenOrQuotedString();
            if (value) {
              sMaxAge = Number(value);
            } else {
              throw new InvalidCacheControlHeaderError();
            }
          } else {
            throw new InvalidCacheControlHeaderError();
          }
          break;
        default:
          // TODO add extension such as "immutable"
          break;
      }
      if (!scanner.readSeparator(0x2c /* , */)) {
        break;
      }
    }
    return new CacheControl({
      isPublic,
      isPrivate,
      noCache,
      noStore,
      noTransform,
      mustRevalidate,
      proxyRevalidate,
      maxAge,
      sMaxAge,
    });
  }

  readonly isPublic: boolean;
  readonly isPrivate: boolean;
  readonly noCache: boolean;
  readonly noStore: boolean;
  readonly noTransform: boolean;
  readonly mustRevalidate: boolean;
  readonly proxyRevalidate: boolean;
  readonly maxAge: number | null = null;
  readonly sMaxAge: number | null = null;

  constructor({
    isPublic = false,
    isPrivate = false,
    noCache = false,
    noStore = false,
    noTransform = false,
    mustRevalidate = false,
    proxyRevalidate = false,
    maxAge = null,
    sMaxAge = null,
  }: CacheControlInit = {}) {
    this.isPublic = isPublic;
    this.isPrivate = isPrivate;
    this.noCache = noCache;
    this.noStore = noStore;
    this.noTransform = noTransform;
    this.mustRevalidate = mustRevalidate;
    this.proxyRevalidate = proxyRevalidate;
    this.maxAge = maxAge;
    this.sMaxAge = sMaxAge;
  }

  toString(): string {
    const tokens: string[] = [];
    if (this.isPublic) {
      tokens.push("public");
    }
    if (this.isPrivate) {
      tokens.push("private");
    }
    if (this.noCache) {
      tokens.push("no-cache");
    }
    if (this.noStore) {
      tokens.push("no-store");
    }
    if (this.noTransform) {
      tokens.push("no-transform");
    }
    if (this.mustRevalidate) {
      tokens.push("must-revalidate");
    }
    if (this.proxyRevalidate) {
      tokens.push("proxy-revalidate");
    }
    if (this.maxAge != null) {
      tokens.push(`max-age=${this.maxAge}`);
    }
    if (this.sMaxAge != null) {
      tokens.push(`s-maxage=${this.sMaxAge}`);
    }
    return tokens.join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "CacheControl";
  }
}
