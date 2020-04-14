import { CookieCodec } from "./cookie-codec";
import { InvalidSetCookieHeaderError } from "./errors";
import { isToken, isValidCookieValue, parseDate, Scanner } from "./syntax";
import type { Header } from "./types";

export interface SetCookieInit {
  readonly path?: string | null;
  readonly domain?: string | null;
  readonly maxAge?: number | null;
  readonly expires?: Date | null;
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
}

/**
 * Parsed `Set-Cookie` header.
 *
 * Represents a command to create a new HTTP cookie on the client,
 * transferred in a response.
 *
 * See https://tools.ietf.org/html/rfc6265
 */
export class SetCookie implements Header {
  static from(value: SetCookie | string): SetCookie {
    if (typeof value === "string") {
      return SetCookie.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `Cookie` by parsing the given header string.
   * See https://tools.ietf.org/html/rfc6265#section-4.1.1
   * See https://tools.ietf.org/html/rfc6265#section-5.2
   */
  static parse(input: string): SetCookie {
    const scanner = new Scanner(input);
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
    const name = scanner.readUntil(0x3d /* = */, /* trim= */ true);
    if (name !== "" && !isToken(name)) {
      throw new InvalidSetCookieHeaderError();
    }
    if (!scanner.readSeparator(0x3d /* = */)) {
      throw new InvalidSetCookieHeaderError();
    }

    const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
    if (!isValidCookieValue(value)) {
      throw new InvalidSetCookieHeaderError();
    }

    let path = null;
    let domain = null;
    let maxAge = null;
    let expires = null;
    let secure = false;
    let httpOnly = false;
    while (scanner.readSeparator(0x3b /* ; */)) {
      const param = scanner.readToken();
      if (param == null) {
        break;
      }
      switch (param.toLowerCase()) {
        case "path":
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            if (value) {
              path = value;
            }
          }
          break;
        case "domain":
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            if (value) {
              domain = value;
            }
          }
          break;
        case "maxage":
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            if (value) {
              maxAge = Number(value);
            }
          }
          break;
        case "expires":
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            if (value) {
              expires = parseDate(value);
            }
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
    return new SetCookie(name, CookieCodec.decode(value), {
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
    const parts: string[] = [];
    parts.push(`${name}=${CookieCodec.encode(value)}`);
    if (path != null) {
      parts.push(`path=${path}`);
    }
    if (domain != null) {
      parts.push(`domain=${domain}`);
    }
    if (maxAge != null) {
      parts.push(`maxAge=${maxAge}`);
    }
    if (expires != null) {
      parts.push(`expires=${expires.toUTCString()}`);
    }
    if (secure) {
      parts.push("secure");
    }
    if (httpOnly) {
      parts.push("httpOnly");
    }
    return parts.join("; ");
  }

  get [Symbol.toStringTag](): string {
    return "SetCookie";
  }
}
