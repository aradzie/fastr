const enum CharType {
  CONTROL = 1,
  WHITE_SPACE,
  SEPARATOR,
  TOKEN,
  QUOTED_STRING,
}

const charTypeTable: CharType[] = [
  CharType.CONTROL /* 0x00 */,
  CharType.CONTROL /* 0x01 */,
  CharType.CONTROL /* 0x02 */,
  CharType.CONTROL /* 0x03 */,
  CharType.CONTROL /* 0x04 */,
  CharType.CONTROL /* 0x05 */,
  CharType.CONTROL /* 0x06 */,
  CharType.CONTROL /* 0x07 */,
  CharType.CONTROL /* 0x08 */,
  CharType.WHITE_SPACE /* 0x09 */,
  CharType.WHITE_SPACE /* 0x0a */,
  CharType.CONTROL /* 0x0b */,
  CharType.CONTROL /* 0x0c */,
  CharType.WHITE_SPACE /* 0x0d */,
  CharType.CONTROL /* 0x0e */,
  CharType.CONTROL /* 0x0f */,
  CharType.CONTROL /* 0x10 */,
  CharType.CONTROL /* 0x11 */,
  CharType.CONTROL /* 0x12 */,
  CharType.CONTROL /* 0x13 */,
  CharType.CONTROL /* 0x14 */,
  CharType.CONTROL /* 0x15 */,
  CharType.CONTROL /* 0x16 */,
  CharType.CONTROL /* 0x17 */,
  CharType.CONTROL /* 0x18 */,
  CharType.CONTROL /* 0x19 */,
  CharType.CONTROL /* 0x1a */,
  CharType.CONTROL /* 0x1b */,
  CharType.CONTROL /* 0x1c */,
  CharType.CONTROL /* 0x1d */,
  CharType.CONTROL /* 0x1e */,
  CharType.CONTROL /* 0x1f */,
  CharType.WHITE_SPACE /* 0x20 " " */,
  CharType.TOKEN /* 0x21 "!" */,
  CharType.QUOTED_STRING /* 0x22 """ */,
  CharType.TOKEN /* 0x23 "#" */,
  CharType.TOKEN /* 0x24 "$" */,
  CharType.TOKEN /* 0x25 "%" */,
  CharType.TOKEN /* 0x26 "&" */,
  CharType.TOKEN /* 0x27 "'" */,
  CharType.SEPARATOR /* 0x28 "(" */,
  CharType.SEPARATOR /* 0x29 ")" */,
  CharType.TOKEN /* 0x2a "*" */,
  CharType.TOKEN /* 0x2b "+" */,
  CharType.SEPARATOR /* 0x2c "," */,
  CharType.TOKEN /* 0x2d "-" */,
  CharType.TOKEN /* 0x2e "." */,
  CharType.SEPARATOR /* 0x2f "/" */,
  CharType.TOKEN /* 0x30 "0" */,
  CharType.TOKEN /* 0x31 "1" */,
  CharType.TOKEN /* 0x32 "2" */,
  CharType.TOKEN /* 0x33 "3" */,
  CharType.TOKEN /* 0x34 "4" */,
  CharType.TOKEN /* 0x35 "5" */,
  CharType.TOKEN /* 0x36 "6" */,
  CharType.TOKEN /* 0x37 "7" */,
  CharType.TOKEN /* 0x38 "8" */,
  CharType.TOKEN /* 0x39 "9" */,
  CharType.SEPARATOR /* 0x3a ":" */,
  CharType.SEPARATOR /* 0x3b ";" */,
  CharType.SEPARATOR /* 0x3c "<" */,
  CharType.SEPARATOR /* 0x3d "=" */,
  CharType.SEPARATOR /* 0x3e ">" */,
  CharType.SEPARATOR /* 0x3f "?" */,
  CharType.SEPARATOR /* 0x40 "@" */,
  CharType.TOKEN /* 0x41 "A" */,
  CharType.TOKEN /* 0x42 "B" */,
  CharType.TOKEN /* 0x43 "C" */,
  CharType.TOKEN /* 0x44 "D" */,
  CharType.TOKEN /* 0x45 "E" */,
  CharType.TOKEN /* 0x46 "F" */,
  CharType.TOKEN /* 0x47 "G" */,
  CharType.TOKEN /* 0x48 "H" */,
  CharType.TOKEN /* 0x49 "I" */,
  CharType.TOKEN /* 0x4a "J" */,
  CharType.TOKEN /* 0x4b "K" */,
  CharType.TOKEN /* 0x4c "L" */,
  CharType.TOKEN /* 0x4d "M" */,
  CharType.TOKEN /* 0x4e "N" */,
  CharType.TOKEN /* 0x4f "O" */,
  CharType.TOKEN /* 0x50 "P" */,
  CharType.TOKEN /* 0x51 "Q" */,
  CharType.TOKEN /* 0x52 "R" */,
  CharType.TOKEN /* 0x53 "S" */,
  CharType.TOKEN /* 0x54 "T" */,
  CharType.TOKEN /* 0x55 "U" */,
  CharType.TOKEN /* 0x56 "V" */,
  CharType.TOKEN /* 0x57 "W" */,
  CharType.TOKEN /* 0x58 "X" */,
  CharType.TOKEN /* 0x59 "Y" */,
  CharType.TOKEN /* 0x5a "Z" */,
  CharType.SEPARATOR /* 0x5b "[" */,
  CharType.SEPARATOR /* 0x5c "\" */,
  CharType.SEPARATOR /* 0x5d "]" */,
  CharType.TOKEN /* 0x5e "^" */,
  CharType.TOKEN /* 0x5f "_" */,
  CharType.TOKEN /* 0x60 "`" */,
  CharType.TOKEN /* 0x61 "a" */,
  CharType.TOKEN /* 0x62 "b" */,
  CharType.TOKEN /* 0x63 "c" */,
  CharType.TOKEN /* 0x64 "d" */,
  CharType.TOKEN /* 0x65 "e" */,
  CharType.TOKEN /* 0x66 "f" */,
  CharType.TOKEN /* 0x67 "g" */,
  CharType.TOKEN /* 0x68 "h" */,
  CharType.TOKEN /* 0x69 "i" */,
  CharType.TOKEN /* 0x6a "j" */,
  CharType.TOKEN /* 0x6b "k" */,
  CharType.TOKEN /* 0x6c "l" */,
  CharType.TOKEN /* 0x6d "m" */,
  CharType.TOKEN /* 0x6e "n" */,
  CharType.TOKEN /* 0x6f "o" */,
  CharType.TOKEN /* 0x70 "p" */,
  CharType.TOKEN /* 0x71 "q" */,
  CharType.TOKEN /* 0x72 "r" */,
  CharType.TOKEN /* 0x73 "s" */,
  CharType.TOKEN /* 0x74 "t" */,
  CharType.TOKEN /* 0x75 "u" */,
  CharType.TOKEN /* 0x76 "v" */,
  CharType.TOKEN /* 0x77 "w" */,
  CharType.TOKEN /* 0x78 "x" */,
  CharType.TOKEN /* 0x79 "y" */,
  CharType.TOKEN /* 0x7a "z" */,
  CharType.SEPARATOR /* 0x7b "{" */,
  CharType.TOKEN /* 0x7c "|" */,
  CharType.SEPARATOR /* 0x7d "}" */,
  CharType.TOKEN /* 0x7e "~" */,
];

/**
 * Returns a value indicating whether the given string includes only
 * token characters.
 */
export function isToken(value: string): boolean {
  const { length } = value;
  if (length === 0) {
    return false;
  }
  for (let i = 0; i < length; i++) {
    if (charTypeTable[value.charCodeAt(i)] !== CharType.TOKEN) {
      return false;
    }
  }
  return true;
}

/**
 * Escapes the given string if it included non-token characters.
 */
export function escapeToken(value: string): string {
  if (isToken(value)) {
    return value;
  } else {
    const { length } = value;
    const a: number[] = [];
    a.push(0x22 /* opening double quote */);
    for (let i = 0; i < length; i++) {
      const ch = value.charCodeAt(i);
      switch (ch) {
        case 0x5c /* \ */:
          a.push(0x5c /* \ */);
          a.push(0x5c /* \ */);
          break;
        case 0x22 /* " */:
          a.push(0x5c /* \ */);
          a.push(0x22 /* " */);
          break;
        default:
          a.push(ch);
          break;
      }
    }
    a.push(0x22 /* closing double quote */);
    return String.fromCharCode(...a);
  }
}

/**
 * Performs a basic sanity check to test whether the given header value is ok.
 * It does not check whether the value conforms to some grammar, merely that it
 * contains valid characters.
 */
export function isValidHeaderValue(value: string): boolean {
  const { length } = value;
  for (let i = 0; i < length; i++) {
    const ch = value.charCodeAt(i);
    if (ch === /* NUL */ 0x00 || ch === /* LF */ 0x0a || ch === /* CR */ 0x0d) {
      return false;
    }
  }
  return true;
}

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

export class Scanner {
  readonly input: string;
  readonly length: number;
  pos: number;

  constructor(input: string, pos = 0) {
    this.input = input;
    this.length = input.length;
    this.pos = pos;
  }

  hasNext(): boolean {
    this.skipWs();
    return this.pos < this.length;
  }

  readSeparator(ch: number): boolean {
    this.skipWs();
    return this.readChar(ch);
  }

  readToken(): string | null {
    this.skipWs();
    const start = this.pos;
    while (this.pos < this.length && this.readCharType(CharType.TOKEN)) {
      // Eat token chars.
    }
    if (this.pos > start) {
      return this.input.substring(start, this.pos);
    } else {
      return null;
    }
  }

  readQuotedString(): string | null {
    this.skipWs();
    if (!this.readChar(0x22 /* `"` */)) {
      return null;
    }
    const result = new Array<number>();
    while (this.pos < this.length) {
      if (this.readChar(0x22 /* `"` */)) {
        break;
      }
      if (this.readChar(0x5c /* `\` */)) {
        if (this.pos === this.length) {
          result.push(0x5c);
          break;
        }
      }
      result.push(this.input.charCodeAt(this.pos));
      this.pos += 1;
    }
    return String.fromCharCode(...result);
  }

  readTokenOrQuotedString(): string | null {
    return this.readQuotedString() ?? this.readToken();
  }

  readParams(): [string, string][] | null {
    this.skipWs();
    if (this.readSeparator(0x3b /* ; */)) {
      const parameters: [string, string][] = [];
      while (true) {
        const name = this.readToken();
        if (name == null) {
          break;
        }
        if (!this.readSeparator(0x3d /* = */)) {
          break;
        }
        const value = this.readTokenOrQuotedString();
        if (value == null) {
          break;
        }
        parameters.push([name, value]);
        if (!this.readSeparator(0x3b /* ; */)) {
          break;
        }
      }
      return parameters;
    } else {
      return null;
    }
  }

  readUntil(ch: number, trim: boolean): string {
    let begin = this.pos;
    while (this.pos < this.length) {
      if (this.input.charCodeAt(this.pos) === ch) {
        break;
      }
      this.pos += 1;
    }
    let end = this.pos;
    if (trim) {
      while (
        begin < end &&
        charTypeTable[this.input.charCodeAt(begin)] === CharType.WHITE_SPACE
      ) {
        begin += 1;
      }
      while (
        begin < end &&
        charTypeTable[this.input.charCodeAt(end - 1)] === CharType.WHITE_SPACE
      ) {
        end -= 1;
      }
    }
    return this.input.substring(begin, end);
  }

  skipWs(): void {
    while (this.pos < this.length && this.readCharType(CharType.WHITE_SPACE)) {
      // Eat whitespace chars.
    }
  }

  private readChar(ch: number): boolean {
    if (this.input.charCodeAt(this.pos) === ch) {
      this.pos += 1;
      return true;
    } else {
      return false;
    }
  }

  private readCharType(type: CharType): boolean {
    if (charTypeTable[this.input.charCodeAt(this.pos)] === type) {
      this.pos += 1;
      return true;
    } else {
      return false;
    }
  }
}

export function findQualityParam(
  parameters: [string, string][],
): number | null {
  for (const [name, value] of parameters) {
    if (name === "q") {
      const q = Number(value);
      if (q >= 0 && q <= 1) {
        return q;
      } else {
        break;
      }
    }
  }
  return null;
}

export function parseDate(value: string): Date | null {
  return new Date(value);
}

export function stringifyDate(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  } else {
    return date.toUTCString();
  }
}
