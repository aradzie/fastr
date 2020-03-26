import {
  parseCookieValue,
  parseDate,
  parseTokens,
  stringifyCookieValue,
  stringifyDate,
  stringifyTokens,
  Token,
} from "./tokens";

export interface SetCookieInit {
  readonly path?: string | null;
  readonly domain?: string | null;
  readonly maxAge?: number | null;
  readonly expires?: Date | null;
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
}

/**
 * Represents a command to create a new HTTP cookie on the client,
 * transferred in a response.
 *
 * RFC 2109 specifies the legal characters for name, value, path and domain.
 */
export class SetCookie {
  static of(value: SetCookie | string): SetCookie {
    if (typeof value === "string") {
      return SetCookie.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `Cookie` by parsing the given header string.
   */
  static parse(input: string): SetCookie {
    const [head, ...rest] = parseTokens(input);
    if (!head) {
      return new SetCookie("invalid", ""); // We never fail.
    }
    const { name, value } = head;
    let path = null;
    let domain = null;
    let maxAge = null;
    let expires = null;
    let secure = false;
    let httpOnly = false;
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
        case "maxage":
          if (token.value) {
            maxAge = Number(token.value);
          }
          break;
        case "expires":
          if (token.value) {
            expires = parseDate(token.value);
          }
          break;
        case "secure":
          secure = true;
          break;
        case "httponly":
          httpOnly = true;
          break;
      }
    }
    return new SetCookie(name, parseCookieValue(value ?? ""), {
      path,
      domain,
      maxAge,
      expires,
      secure,
      httpOnly,
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
   * The URI path for which the cookie is valid.
   */
  readonly path: string | null;
  /**
   * The host domain for which the cookie is valid.
   */
  readonly domain: string | null;
  /**
   * The maximum age of the cookie in seconds.
   */
  readonly maxAge: number | null;
  /**
   * The cookie expiration date.
   */
  readonly expires: Date | null;
  /**
   * Specifies whether the cookie will only be sent over a secure
   * connection.
   */
  readonly secure: boolean;
  /**
   * Specifies whether the cookie is HTTP only, i.e. only visible
   * as part of an HTTP request.
   */
  readonly httpOnly: boolean;

  constructor(
    name: string,
    value: string,
    {
      path = null,
      domain = null,
      maxAge = null,
      expires = null,
      secure = false,
      httpOnly = false,
    }: SetCookieInit = {},
  ) {
    this.name = name;
    this.value = value;
    this.path = path;
    this.domain = domain;
    this.maxAge = maxAge;
    this.expires = expires;
    this.secure = secure;
    this.httpOnly = httpOnly;
  }

  toJSON(): any {
    return this.toString();
  }

  toString(): string {
    const {
      name,
      value,
      path,
      domain,
      maxAge,
      expires,
      secure,
      httpOnly,
    } = this;
    const tokens: Token[] = [{ name, value: stringifyCookieValue(value) }];
    if (path != null) {
      tokens.push({ name: "path", value: path });
    }
    if (domain != null) {
      tokens.push({ name: "domain", value: domain });
    }
    if (maxAge != null) {
      tokens.push({ name: "maxAge", value: String(maxAge) });
    }
    if (expires != null) {
      tokens.push({ name: "expires", value: stringifyDate(expires) });
    }
    if (secure) {
      tokens.push({ name: "secure", value: null });
    }
    if (httpOnly) {
      tokens.push({ name: "httpOnly", value: null });
    }
    return stringifyTokens(tokens);
  }
}
