import { CookieCodec } from "./cookie-codec.js";
import { InvalidSetCookieHeaderError } from "./errors.js";
import { splitPair } from "./strings.js";
import { isToken, isValidCookieValue, parseDate, Scanner } from "./syntax.js";
import type { Header } from "./types.js";

export interface SetCookieInit {
  readonly path?: string | null;
  readonly domain?: string | null;
  readonly maxAge?: number | null;
  readonly expires?: Date | null;
  readonly sameSite?: "Strict" | "Lax" | "None" | null;
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
  static from(value: SetCookie): SetCookie;
  static from(value: string): SetCookie | null;
  static from(value: SetCookie | string): SetCookie | null;
  static from(value: SetCookie | string): SetCookie | null {
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
  static parse(input: string): SetCookie | null {
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

    const entry = scanner.readUntil(0x3b /* ; */, /* trim= */ false);
    const [name, value] = splitPair(entry, 0x3d /* = */);
    if (!isToken(name)) {
      return null;
    }
    if (!isValidCookieValue(value)) {
      return null;
    }

    let path = null;
    let domain = null;
    let maxAge = null;
    let expires = null;
    let sameSite = null;
    let secure = null;
    let httpOnly = null;
    while (scanner.readSeparator(0x3b /* ; */)) {
      const param = scanner.readToken();
      if (param == null) {
        break;
      }
      switch (param.toLowerCase()) {
        case "path":
          if (path != null) {
            return null;
          }
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            if (value) {
              path = value;
            } else {
              return null;
            }
          } else {
            return null;
          }
          break;
        case "domain":
          if (domain != null) {
            return null;
          }
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            if (value) {
              domain = value;
            } else {
              return null;
            }
          } else {
            return null;
          }
          break;
        case "max-age":
          if (maxAge != null) {
            return null;
          }
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            if (value) {
              maxAge = Number(value);
            } else {
              return null;
            }
          } else {
            return null;
          }
          break;
        case "expires":
          if (expires != null) {
            return null;
          }
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            if (value) {
              expires = parseDate(value);
            } else {
              return null;
            }
          } else {
            return null;
          }
          break;
        case "samesite":
          if (sameSite != null) {
            return null;
          }
          if (scanner.readSeparator(0x3d /* = */)) {
            const value = scanner.readUntil(0x3b /* ; */, /* trim= */ true);
            switch (value.toLowerCase()) {
              case "strict":
                sameSite = "Strict" as const;
                break;
              case "lax":
                sameSite = "Lax" as const;
                break;
              case "none":
                sameSite = "None" as const;
                break;
              default:
                return null;
            }
          } else {
            return null;
          }
          break;
        case "secure":
          if (secure != null) {
            return null;
          }
          if (scanner.readSeparator(0x3d /* = */)) {
            return null;
          }
          secure = true;
          break;
        case "httponly":
          if (httpOnly != null) {
            return null;
          }
          if (scanner.readSeparator(0x3d /* = */)) {
            return null;
          }
          httpOnly = true;
          break;
        default:
          if (scanner.readSeparator(0x3d /* = */)) {
            scanner.readUntil(0x3b /* ; */, /* trim= */ true);
          }
      }
    }
    return new SetCookie(name, CookieCodec.decode(value), {
      path,
      domain,
      maxAge,
      expires,
      sameSite,
      secure: secure != null,
      httpOnly: httpOnly != null,
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
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery attacks.
   */
  readonly sameSite: "Strict" | "Lax" | "None" | null;
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
      sameSite = null,
      secure = false,
      httpOnly = false,
    }: SetCookieInit = {},
  ) {
    if (!isToken(name)) {
      throw new InvalidSetCookieHeaderError();
    }
    this.name = name;
    this.value = value;
    this.path = path;
    this.domain = domain;
    this.maxAge = maxAge;
    this.expires = expires;
    this.sameSite = sameSite;
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
      parts.push(`Expires=${expires.toUTCString()}`);
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