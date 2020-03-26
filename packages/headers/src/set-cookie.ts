import { CookieCodec } from "./cookie-codec.js";
import { type Header, parseOrThrow } from "./headers.js";
import { isValidCookieValue } from "./syntax-cookie.js";
import { parseDate, stringifyDate } from "./syntax-date.js";
import { isToken, Scanner, Separator } from "./syntax.js";

export interface SetCookieInit {
  path?: string | null;
  domain?: string | null;
  maxAge?: number | null;
  expires?: Date | null;
  sameSite?: "Strict" | "Lax" | "None" | null;
  secure?: boolean;
  httpOnly?: boolean;
}

/**
 * The `Set-Cookie` header.
 *
 * Represents a command to create a new HTTP cookie on the client,
 * transferred in a response.
 *
 * @see https://httpwg.org/specs/rfc6265.html
 */
export class SetCookie implements Header {
  static from(value: SetCookie | string): SetCookie {
    if (typeof value === "string") {
      return SetCookie.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): SetCookie {
    return parseOrThrow(SetCookie, input);
  }

  /**
   * Creates a new instance of `Cookie` by parsing the given header string.
   * @see https://httpwg.org/specs/rfc6265.html#section-4.1.1
   * @see https://httpwg.org/specs/rfc6265.html#section-5.2
   */
  static tryParse(input: string): SetCookie | null {
    // set-cookie-header = "Set-Cookie:" SP set-cookie-string
    // set-cookie-string = cookie-pair *( ";" SP cookie-av )
    // cookie-pair       = cookie-name "=" cookie-value
    // cookie-name       = token
    // cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
    // cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
    //                       ; US-ASCII characters excluding CTLs,
    //                       ; whitespace DQUOTE, comma, semicolon,
    //                       ; and backslash
    // cookie-av         = expires-av / max-age-av / domain-av /
    //                     path-av / secure-av / httponly-av /
    //                     extension-av
    // path-av           = "Path=" path-value
    // path-value        = <any CHAR except CTLs or ";">
    // domain-av         = "Domain=" domain-value
    // domain-value      = <subdomain>
    //                       ; defined in [RFC1034], Section 3.5, as
    //                       ; enhanced by [RFC1123], Section 2.1
    // max-age-av        = "Max-Age=" non-zero-digit *DIGIT
    // non-zero-digit    = %x31-39
    //                       ; digits 1 through 9
    // expires-av        = "Expires=" sane-cookie-date
    // sane-cookie-date  = <rfc1123-date>
    //                      ; defined in [RFC2616], Section 3.3.1
    // secure-av         = "Secure"
    // httponly-av       = "HttpOnly"
    const scanner = new Scanner(input);
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
    const header = new SetCookie(name, CookieCodec.decode(value));
    scanner.skipWs();
    let hasSecure = false;
    let hasHttpOnly = false;
    while (scanner.hasNext()) {
      if (!scanner.readChar(Separator.Semicolon)) {
        return null;
      }
      scanner.skipWs();
      const param = scanner.readToken();
      if (param == null) {
        break;
      }
      switch (param.toLowerCase()) {
        case "path":
          if (header.path != null) {
            return null;
          }
          if (scanner.readChar(Separator.Equals)) {
            header.path = scanner.readUntil(Separator.Semicolon);
          } else {
            return null;
          }
          break;
        case "domain":
          if (header.domain != null) {
            return null;
          }
          if (scanner.readChar(Separator.Equals)) {
            header.domain = scanner.readUntil(Separator.Semicolon);
          } else {
            return null;
          }
          break;
        case "max-age":
          if (header.maxAge != null) {
            return null;
          }
          if (scanner.readChar(Separator.Equals)) {
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
        case "expires":
          if (header.expires != null) {
            return null;
          }
          if (scanner.readChar(Separator.Equals)) {
            const value = parseDate(scanner.readUntil(Separator.Semicolon));
            if (value != null) {
              header.expires = value;
            } else {
              return null;
            }
          } else {
            return null;
          }
          break;
        case "samesite":
          if (header.sameSite != null) {
            return null;
          }
          if (scanner.readChar(Separator.Equals)) {
            const value = scanner.readToken();
            if (value == null) {
              return null;
            }
            switch (value.toLowerCase()) {
              case "strict":
                header.sameSite = "Strict" as const;
                break;
              case "lax":
                header.sameSite = "Lax" as const;
                break;
              case "none":
                header.sameSite = "None" as const;
                break;
              default:
                return null;
            }
          } else {
            return null;
          }
          break;
        case "secure":
          if (hasSecure) {
            return null;
          }
          if (scanner.readChar(Separator.Equals)) {
            return null;
          }
          header.secure = true;
          hasSecure = true;
          break;
        case "httponly":
          if (hasHttpOnly) {
            return null;
          }
          if (scanner.readChar(Separator.Equals)) {
            return null;
          }
          header.httpOnly = true;
          hasHttpOnly = true;
          break;
        default:
          return null;
      }
    }
    return header;
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
  path: string | null = null;
  /**
   * The host domain for which the cookie is valid.
   */
  domain: string | null = null;
  /**
   * The maximum age of the cookie in seconds.
   */
  maxAge: number | null = null;
  /**
   * The cookie expiration date.
   */
  expires: Date | null = null;
  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery attacks.
   */
  sameSite: "Strict" | "Lax" | "None" | null = null;
  /**
   * Specifies whether the cookie will only be sent over a secure
   * connection.
   */
  secure = false;
  /**
   * Specifies whether the cookie is HTTP only, i.e. only visible
   * as part of an HTTP request.
   */
  httpOnly = false;

  constructor(
    name: string,
    value: string,
    init: Readonly<SetCookieInit> | null = null,
  ) {
    if (!isToken(name)) {
      throw new TypeError();
    }
    this.name = name;
    this.value = value;
    if (init != null) {
      const {
        path = null,
        domain = null,
        maxAge = null,
        expires = null,
        sameSite = null,
        secure = false,
        httpOnly = false,
      } = init;
      this.path = path;
      this.domain = domain;
      this.maxAge = maxAge;
      this.expires = expires;
      this.sameSite = sameSite;
      this.secure = secure;
      this.httpOnly = httpOnly;
    }
  }

  toString(): string {
    const {
      name,
      value,
      path,
      domain,
      maxAge,
      expires,
      sameSite,
      secure,
      httpOnly,
    } = this;
    const parts: string[] = [];
    parts.push(`${name}=${CookieCodec.encode(value)}`);
    if (path != null) {
      parts.push(`Path=${path}`);
    }
    if (domain != null) {
      parts.push(`Domain=${domain}`);
    }
    if (maxAge != null) {
      parts.push(`Max-Age=${maxAge}`);
    }
    if (expires != null) {
      parts.push(`Expires=${stringifyDate(expires)}`);
    }
    if (sameSite != null) {
      parts.push(`SameSite=${sameSite}`);
    }
    if (secure) {
      parts.push("Secure");
    }
    if (httpOnly) {
      parts.push("HttpOnly");
    }
    return parts.join("; ");
  }

  get [Symbol.toStringTag](): string {
    return "SetCookie";
  }
}
