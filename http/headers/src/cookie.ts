import {
  parseCookieValue,
  parseTokens,
  stringifyCookieValue,
  stringifyTokens,
  Token,
} from "./tokens";

export interface CookieInit {
  readonly path?: string | null;
  readonly domain?: string | null;
}

/**
 * Represents the value of a HTTP cookie, transferred in a request.
 *
 * RFC 2109 specifies the legal characters for name, value, path and domain.
 */
export class Cookie {
  static from(value: Cookie | string): Cookie {
    if (typeof value === "string") {
      return Cookie.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `Cookie` by parsing the given header string.
   */
  static parse(input: string): Cookie {
    const [head, ...rest] = parseTokens(input);
    if (!head) {
      return new Cookie("invalid", ""); // We never fail.
    }
    const { name, value } = head;
    let path = null;
    let domain = null;
    for (const token of rest) {
      switch (token.name.toLowerCase()) {
        case "path":
          if (token.value) {
            path = token.value;
          }
          break;
        case "domain":
          if (token.value) {
            domain = token.value;
          }
          break;
      }
    }
    return new Cookie(name, parseCookieValue(value ?? ""), {
      path,
      domain,
    });
  }

  /**
   * The name of the cookie.
   */
  readonly name: string;
  /**
   * The value of the cookie.
   */
  readonly value: string;
  /**
   * The path of the cookie.
   */
  readonly path: string | null;
  /**
   * The domain of the cookie.
   */
  readonly domain: string | null;

  constructor(
    name: string,
    value: string,
    { path = null, domain = null }: CookieInit = {},
  ) {
    this.name = name;
    this.value = value;
    this.path = path;
    this.domain = domain;
  }

  toJSON(): any {
    return this.toString();
  }

  toString(): string {
    const { name, value, path, domain } = this;
    const tokens: Token[] = [{ name, value: stringifyCookieValue(value) }];
    if (path != null) {
      tokens.push({ name: "path", value: path });
    }
    if (domain != null) {
      tokens.push({ name: "domain", value: domain });
    }
    return stringifyTokens(tokens);
  }
}
