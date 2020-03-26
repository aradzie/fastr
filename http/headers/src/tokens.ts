// See https://tools.ietf.org/html/rfc7230#section-3.2
// See https://source.chromium.org/chromium/chromium/src/+/master:net/http/http_util.cc
// See https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/platform/network/http_parsers.cc

import { splitList, splitPair } from "./strings";

export type Token = {
  readonly name: string;
  readonly value: string | null;
};

export function parseTokens(value: string): Token[] {
  const tokens: Token[] = [];
  for (const item of splitList(value, ";")) {
    const [name, value] = splitPair(item, "=");
    if (name && value) {
      tokens.push({ name, value: parseToken(value) });
    } else if (name) {
      tokens.push({ name, value: null });
    }
  }
  return tokens;
}

export function parseToken(input: string): string {
  if (input.includes("%")) {
    try {
      input = decodeURIComponent(input);
    } catch {
      // Ignore.
    }
  }
  return input;
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

export function parseCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function stringifyCookieValue(value: string): string {
  return encodeURIComponent(value);
}
