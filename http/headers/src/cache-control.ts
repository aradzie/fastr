import { splitPair } from "./strings";
import { Token } from "./tokens";

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

export class CacheControl {
  static of(value: CacheControl | string): CacheControl {
    if (typeof value === "string") {
      return CacheControl.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `CacheControl` by parsing
   * the given header string.
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
    for (const token of input.split(",")) {
      const [name, value] = splitPair(token, "=");
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
          if (value) {
            maxAge = Number(value);
          }
          break;
        case "s-maxage":
          if (value) {
            sMaxAge = Number(value);
          }
          break;
        default:
          // TODO add extension such as "immutable"
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
    const tokens: Token[] = [];
    if (this.isPublic) {
      tokens.push({ name: "public", value: null });
    }
    if (this.isPrivate) {
      tokens.push({ name: "private", value: null });
    }
    if (this.noCache) {
      tokens.push({ name: "no-cache", value: null });
    }
    if (this.noStore) {
      tokens.push({ name: "no-store", value: null });
    }
    if (this.noTransform) {
      tokens.push({ name: "no-transform", value: null });
    }
    if (this.mustRevalidate) {
      tokens.push({ name: "must-revalidate", value: null });
    }
    if (this.proxyRevalidate) {
      tokens.push({ name: "proxy-revalidate", value: null });
    }
    if (this.maxAge != null) {
      tokens.push({ name: "max-age", value: String(this.maxAge) });
    }
    if (this.sMaxAge != null) {
      tokens.push({ name: "s-maxage", value: String(this.sMaxAge) });
    }
    return tokens
      .map(({ name, value }) => (value != null ? `${name}=${value}` : name))
      .join(", ");
  }
}
