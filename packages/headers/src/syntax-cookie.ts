/**
 * Validate value, which may be according to RFC 6265.
 *
 * ```
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 * ```
 *
 * @see https://httpwg.org/specs/rfc6265.html#sane-set-cookie-syntax
 */
export function isValidCookieValue(value: string): boolean {
  const { length } = value;
  let begin = 0;
  let end = length;
  if (length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    begin += 1;
    end -= 1;
  }
  for (let i = begin; i < end; i++) {
    const ch = value.charCodeAt(i);
    const valid =
      ch === 0x21 ||
      (ch >= 0x23 && ch <= 0x2b) ||
      (ch >= 0x2d && ch <= 0x3a) ||
      (ch >= 0x3c && ch <= 0x5b) ||
      (ch >= 0x5d && ch <= 0x7e);
    if (!valid) {
      return false;
    }
  }
  return true;
}
