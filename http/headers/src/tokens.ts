// See https://tools.ietf.org/html/rfc7230#section-3.2
// See https://source.chromium.org/chromium/chromium/src/+/master:net/http/http_util.cc
// See https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/platform/network/http_parsers.cc

import { splitList, splitPair } from "./strings";

// TODO Add quoted strings https://fetch.spec.whatwg.org/#collect-an-http-quoted-string

export type Token = {
  readonly name: string;
  readonly value: string | null;
};

export function parseTokens(value: string): Token[] {
  const tokens: Token[] = [];
  for (const item of splitList(value, ";")) {
    const [name, value] = splitPair(item, "=");
    if (name && value) {
      tokens.push({ name, value });
    } else if (name) {
      tokens.push({ name, value: null });
    }
  }
  return tokens;
}

export function stringifyTokens(tokens: readonly Token[]): string {
  return tokens.map(stringifyToken).join("; ");
}

export function stringifyToken({ name, value }: Token): string {
  if (value != null) {
    return `${name}=${value}`;
  } else {
    return name;
  }
}

export function parseDate(value: string): Date {
  return new Date(value);
}

export function stringifyDate(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  } else {
    return date.toUTCString();
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

  skipWs(): void {
    // TODO Implement me.
  }

  readUntil(ch: number): string {
    const { input, length } = this;
    const start = this.pos;
    while (this.pos < length && !this.eat(ch)) {
      this.pos += 1;
    }
    return input.substring(start, this.pos);
  }

  readToken(): string | null {
    return null; // TODO Implement me.
  }

  /**
   * See https://fetch.spec.whatwg.org/#collect-an-http-quoted-string
   */
  readQuotedString(): string | null {
    if (!this.eat(/* `"` */ 0x22)) {
      return null;
    }
    const { input, length } = this;
    const result = new Array<number>();
    while (this.pos < length) {
      if (this.eat(/* `"` */ 0x22)) {
        break;
      }
      if (this.eat(/* `\` */ 0x5c)) {
        if (this.pos === length) {
          result.push(0x5c);
          break;
        }
      }
      result.push(input.charCodeAt(this.pos));
      this.pos += 1;
    }
    return String.fromCharCode(...result);
  }

  eat(ch: number): boolean {
    if (this.input.charCodeAt(this.pos) === ch) {
      this.pos += 1;
      return true;
    } else {
      return false;
    }
  }
}
