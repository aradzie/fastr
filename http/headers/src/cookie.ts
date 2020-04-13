import { parseTokens, stringifyTokens, Token } from "./tokens";
import { NameValueEntries } from "./types";
import { entries } from "./util";

/**
 * To maximize compatibility with user agents, servers that wish to store
 * arbitrary data in a cookie-value SHOULD encode that data, for example,
 * using Base64.
 */
export interface ValueCodec {
  /**
   * Takes arbitrary cookie value and encodes it to a form
   * suitable for usage in an HTTP header.
   */
  readonly encode: (value: string) => string;
  /**
   * Takes an HTTP header value and decodes it to the original cookie value.
   */
  readonly decode: (value: string) => string;
}

const kMap = Symbol("kMap");

/**
 * Represents the value of the `Cookie` header, transferred in a request.
 *
 * See https://tools.ietf.org/html/rfc6265
 */
export class Cookie implements Iterable<[string, string]> {
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
    const data: [string, string][] = [];
    for (const { name, value } of parseTokens(input)) {
      if (value != null) {
        data.push([name, Cookie.codec.decode(value)]);
      }
    }
    return new Cookie(data);
  }

  static codec: ValueCodec = {
    decode: (value: string): string => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    },
    encode: encodeURIComponent,
  };

  private readonly [kMap]: Map<string, string>;

  constructor(
    data:
      | Cookie
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    const map = new Map<string, string>();
    if (data != null) {
      if (data instanceof Cookie) {
        for (const [name, value] of data) {
          map.set(name, value);
        }
      } else {
        for (const [name, value] of entries(data as Map<string, unknown>)) {
          map.set(name, value);
        }
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

  toJSON(): string {
    return this.toString();
  }

  toString(): string {
    const tokens: Token[] = [];
    for (const [name, value] of this[kMap]) {
      tokens.push({ name, value: Cookie.codec.encode(value) });
    }
    return stringifyTokens(tokens);
  }
}
