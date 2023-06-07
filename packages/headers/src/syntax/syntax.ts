export const enum CharType {
  Control = 1,
  WhiteSpace,
  Separator,
  Token,
  QuotedString,
}

const charTypeTable: CharType[] = [
  CharType.Control /* 0x00 */,
  CharType.Control /* 0x01 */,
  CharType.Control /* 0x02 */,
  CharType.Control /* 0x03 */,
  CharType.Control /* 0x04 */,
  CharType.Control /* 0x05 */,
  CharType.Control /* 0x06 */,
  CharType.Control /* 0x07 */,
  CharType.Control /* 0x08 */,
  CharType.WhiteSpace /* 0x09 */,
  CharType.WhiteSpace /* 0x0a */,
  CharType.Control /* 0x0b */,
  CharType.Control /* 0x0c */,
  CharType.WhiteSpace /* 0x0d */,
  CharType.Control /* 0x0e */,
  CharType.Control /* 0x0f */,
  CharType.Control /* 0x10 */,
  CharType.Control /* 0x11 */,
  CharType.Control /* 0x12 */,
  CharType.Control /* 0x13 */,
  CharType.Control /* 0x14 */,
  CharType.Control /* 0x15 */,
  CharType.Control /* 0x16 */,
  CharType.Control /* 0x17 */,
  CharType.Control /* 0x18 */,
  CharType.Control /* 0x19 */,
  CharType.Control /* 0x1a */,
  CharType.Control /* 0x1b */,
  CharType.Control /* 0x1c */,
  CharType.Control /* 0x1d */,
  CharType.Control /* 0x1e */,
  CharType.Control /* 0x1f */,
  CharType.WhiteSpace /* 0x20 " " */,
  CharType.Token /* 0x21 "!" */,
  CharType.QuotedString /* 0x22 """ */,
  CharType.Token /* 0x23 "#" */,
  CharType.Token /* 0x24 "$" */,
  CharType.Token /* 0x25 "%" */,
  CharType.Token /* 0x26 "&" */,
  CharType.Token /* 0x27 "'" */,
  CharType.Separator /* 0x28 "(" */,
  CharType.Separator /* 0x29 ")" */,
  CharType.Token /* 0x2a "*" */,
  CharType.Token /* 0x2b "+" */,
  CharType.Separator /* 0x2c "," */,
  CharType.Token /* 0x2d "-" */,
  CharType.Token /* 0x2e "." */,
  CharType.Separator /* 0x2f "/" */,
  CharType.Token /* 0x30 "0" */,
  CharType.Token /* 0x31 "1" */,
  CharType.Token /* 0x32 "2" */,
  CharType.Token /* 0x33 "3" */,
  CharType.Token /* 0x34 "4" */,
  CharType.Token /* 0x35 "5" */,
  CharType.Token /* 0x36 "6" */,
  CharType.Token /* 0x37 "7" */,
  CharType.Token /* 0x38 "8" */,
  CharType.Token /* 0x39 "9" */,
  CharType.Separator /* 0x3a ":" */,
  CharType.Separator /* 0x3b ";" */,
  CharType.Separator /* 0x3c "<" */,
  CharType.Separator /* 0x3d "=" */,
  CharType.Separator /* 0x3e ">" */,
  CharType.Separator /* 0x3f "?" */,
  CharType.Separator /* 0x40 "@" */,
  CharType.Token /* 0x41 "A" */,
  CharType.Token /* 0x42 "B" */,
  CharType.Token /* 0x43 "C" */,
  CharType.Token /* 0x44 "D" */,
  CharType.Token /* 0x45 "E" */,
  CharType.Token /* 0x46 "F" */,
  CharType.Token /* 0x47 "G" */,
  CharType.Token /* 0x48 "H" */,
  CharType.Token /* 0x49 "I" */,
  CharType.Token /* 0x4a "J" */,
  CharType.Token /* 0x4b "K" */,
  CharType.Token /* 0x4c "L" */,
  CharType.Token /* 0x4d "M" */,
  CharType.Token /* 0x4e "N" */,
  CharType.Token /* 0x4f "O" */,
  CharType.Token /* 0x50 "P" */,
  CharType.Token /* 0x51 "Q" */,
  CharType.Token /* 0x52 "R" */,
  CharType.Token /* 0x53 "S" */,
  CharType.Token /* 0x54 "T" */,
  CharType.Token /* 0x55 "U" */,
  CharType.Token /* 0x56 "V" */,
  CharType.Token /* 0x57 "W" */,
  CharType.Token /* 0x58 "X" */,
  CharType.Token /* 0x59 "Y" */,
  CharType.Token /* 0x5a "Z" */,
  CharType.Separator /* 0x5b "[" */,
  CharType.Separator /* 0x5c "\" */,
  CharType.Separator /* 0x5d "]" */,
  CharType.Token /* 0x5e "^" */,
  CharType.Token /* 0x5f "_" */,
  CharType.Token /* 0x60 "`" */,
  CharType.Token /* 0x61 "a" */,
  CharType.Token /* 0x62 "b" */,
  CharType.Token /* 0x63 "c" */,
  CharType.Token /* 0x64 "d" */,
  CharType.Token /* 0x65 "e" */,
  CharType.Token /* 0x66 "f" */,
  CharType.Token /* 0x67 "g" */,
  CharType.Token /* 0x68 "h" */,
  CharType.Token /* 0x69 "i" */,
  CharType.Token /* 0x6a "j" */,
  CharType.Token /* 0x6b "k" */,
  CharType.Token /* 0x6c "l" */,
  CharType.Token /* 0x6d "m" */,
  CharType.Token /* 0x6e "n" */,
  CharType.Token /* 0x6f "o" */,
  CharType.Token /* 0x70 "p" */,
  CharType.Token /* 0x71 "q" */,
  CharType.Token /* 0x72 "r" */,
  CharType.Token /* 0x73 "s" */,
  CharType.Token /* 0x74 "t" */,
  CharType.Token /* 0x75 "u" */,
  CharType.Token /* 0x76 "v" */,
  CharType.Token /* 0x77 "w" */,
  CharType.Token /* 0x78 "x" */,
  CharType.Token /* 0x79 "y" */,
  CharType.Token /* 0x7a "z" */,
  CharType.Separator /* 0x7b "{" */,
  CharType.Token /* 0x7c "|" */,
  CharType.Separator /* 0x7d "}" */,
  CharType.Token /* 0x7e "~" */,
];

export const enum Separator {
  LParen = 0x28 /* "(" */,
  RParen = 0x29 /* ")" */,
  Comma = 0x2c /* "," */,
  Slash = 0x2f /* "/" */,
  Colon = 0x3a /* ":" */,
  Semicolon = 0x3b /* ";" */,
  LAngle = 0x3c /* "<" */,
  Equals = 0x3d /* "=" */,
  RAngle = 0x3e /* ">" */,
  DQuote = 0x22 /* "\"" */,
  Backslash = 0x5c /* "\\" */,
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
    const valid =
      ch === 0x09 || //
      (ch >= 0x20 && ch <= 0x7e) ||
      (ch >= 0x80 && ch <= 0xff);
    if (!valid) {
      return false;
    }
  }
  return true;
}

/**
 * Returns a value indicating whether the given string includes only
 * token characters.
 *
 * @see https://httpwg.org/specs/rfc9110.html#tokens
 */
export function isToken(value: string): boolean {
  const { length } = value;
  if (length === 0) {
    return false;
  }
  for (let i = 0; i < length; i++) {
    if (charTypeTable[value.charCodeAt(i)] !== CharType.Token) {
      return false;
    }
  }
  return true;
}

/**
 * Escapes the given string if it included non-token characters.
 *
 * @see https://httpwg.org/specs/rfc9110.html#quoted.strings
 */
export function escapeToken(value: string): string {
  if (isToken(value)) {
    return value;
  } else {
    const { length } = value;
    const a: number[] = [];
    a.push(Separator.DQuote);
    for (let i = 0; i < length; i++) {
      const ch = value.charCodeAt(i);
      switch (ch) {
        case Separator.Backslash:
          a.push(Separator.Backslash);
          a.push(Separator.Backslash);
          break;
        case Separator.DQuote:
          a.push(Separator.Backslash);
          a.push(Separator.DQuote);
          break;
        default:
          a.push(ch);
          break;
      }
    }
    a.push(Separator.DQuote);
    return String.fromCharCode(...a);
  }
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
    return this.pos < this.length;
  }

  /**
   * @see https://httpwg.org/specs/rfc9110.html#tokens
   */
  readToken(): string | null {
    const start = this.pos;
    while (this.pos < this.length && this.readCharType(CharType.Token)) {
      // Eat token chars.
    }
    if (this.pos > start) {
      return this.input.substring(start, this.pos);
    } else {
      return null;
    }
  }

  /**
   * @see https://httpwg.org/specs/rfc9110.html#quoted.strings
   */
  readQuotedString(): string | null {
    if (!this.readChar(Separator.DQuote)) {
      return null;
    }
    const result = new Array<number>();
    while (this.pos < this.length) {
      if (this.readChar(Separator.DQuote)) {
        break;
      }
      if (this.readChar(Separator.Backslash)) {
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

  /**
   * @see https://httpwg.org/specs/rfc9110.html#tokens
   * @see https://httpwg.org/specs/rfc9110.html#quoted.strings
   */
  readTokenOrQuotedString(): string | null {
    if (this.input.charCodeAt(this.pos) === Separator.DQuote) {
      return this.readQuotedString();
    } else {
      return this.readToken();
    }
  }

  readUntil(ch: number): string {
    const start = this.pos;
    while (this.pos < this.length) {
      if (this.input.charCodeAt(this.pos) === ch) {
        break;
      }
      this.pos += 1;
    }
    return this.input.substring(start, this.pos);
  }

  readInteger(): number | null {
    const start = this.pos;
    while (this.pos < this.length) {
      const ch = this.input.charCodeAt(this.pos);
      if (ch >= /* "9" */ 0x30 && ch <= /* "9" */ 0x39) {
        this.pos += 1;
      } else {
        break;
      }
    }
    if (this.pos === start) {
      return null;
    }
    return Number(this.input.substring(start, this.pos));
  }

  readNumber(): number | null {
    const start = this.pos;
    while (this.pos < this.length) {
      const ch = this.input.charCodeAt(this.pos);
      if (ch >= /* "9" */ 0x30 && ch <= /* "9" */ 0x39) {
        this.pos += 1;
      } else {
        break;
      }
    }
    if (this.pos === start) {
      return null;
    }
    if (this.readChar(/* "." */ 0x2e)) {
      const start1 = this.pos;
      while (this.pos < this.length) {
        const ch = this.input.charCodeAt(this.pos);
        if (ch >= /* "9" */ 0x30 && ch <= /* "9" */ 0x39) {
          this.pos += 1;
        } else {
          break;
        }
      }
      if (this.pos === start1) {
        return null;
      }
    }
    return Number(this.input.substring(start, this.pos));
  }

  /**
   * @see https://httpwg.org/specs/rfc9110.html#whitespace
   */
  skipWs(): void {
    while (this.pos < this.length && this.readCharType(CharType.WhiteSpace)) {
      // Eat whitespace chars.
    }
  }

  readChar(ch: number): boolean {
    if (this.input.charCodeAt(this.pos) === ch) {
      this.pos += 1;
      return true;
    } else {
      return false;
    }
  }

  readCharType(type: CharType): boolean {
    if (charTypeTable[this.input.charCodeAt(this.pos)] === type) {
      this.pos += 1;
      return true;
    } else {
      return false;
    }
  }
}
