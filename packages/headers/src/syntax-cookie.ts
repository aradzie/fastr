import { type Scanner, Separator } from "./syntax.js";

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

export function readCookieNameValue(scanner: Scanner): [string, string] | null {
  const start = scanner.pos;
  let valueStart = -1;
  while (scanner.pos < scanner.length) {
    const ch = scanner.input.charCodeAt(scanner.pos);
    if (ch === Separator.Semicolon) {
      break;
    }
    if (ch === Separator.Equals && valueStart === -1) {
      valueStart = scanner.pos;
    }
    scanner.pos += 1;
  }
  if (valueStart > start) {
    return [
      scanner.input.substring(start, valueStart),
      scanner.input.substring(valueStart + 1, scanner.pos),
    ];
  }
  return null;
}
