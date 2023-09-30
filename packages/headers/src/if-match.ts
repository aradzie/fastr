import { ETag } from "./etag.js";
import {
  type GetHeader,
  getHeader,
  type Header,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";
import { readETag } from "./syntax/etag.js";
import { Scanner, Separator } from "./syntax/syntax.js";

const headerName = "If-Match";
const headerNameLc = "if-match";

/**
 * The `If-Match` header.
 */
export class IfMatch implements Header, Iterable<ETag> {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: IfMatch | string): IfMatch {
    if (typeof value === "string") {
      return IfMatch.parse(value);
    } else {
      return value;
    }
  }

  static get(headers: GetHeader): IfMatch | null {
    return getHeader(IfMatch, headers);
  }

  static tryGet(headers: GetHeader): IfMatch | null {
    return tryGetHeader(IfMatch, headers);
  }

  static parse(input: string): IfMatch {
    return parseOrThrow(IfMatch, input);
  }

  static tryParse(input: string): IfMatch | null {
    if (input === "*") {
      return new IfMatch(true);
    }
    const header = new IfMatch(false);
    const scanner = new Scanner(input);
    while (true) {
      const etag = readETag(scanner);
      if (etag == null) {
        return null;
      }
      header.add(etag);
      scanner.skipWs();
      if (!scanner.hasNext()) {
        break;
      }
      if (!scanner.readChar(Separator.Comma)) {
        return null;
      }
      scanner.skipWs();
    }
    return header;
  }

  #any = false;
  #etags: ETag[] = [];

  constructor(any = false, etags: readonly (ETag | string)[] = []) {
    this.any = any;
    for (const etag of etags) {
      this.add(etag);
    }
  }

  [Symbol.iterator](): IterableIterator<ETag> {
    return this.#etags[Symbol.iterator]();
  }

  get any(): boolean {
    return this.#any;
  }

  set any(value: boolean) {
    this.#any = value;
  }

  add(etag: ETag | string): void {
    this.#etags.push(ETag.from(etag));
  }

  matches(that: string | ETag, strong = false): boolean {
    if (this.#any) {
      return true;
    }
    that = ETag.from(that);
    for (const etag of this.#etags) {
      if (etag.matches(that, strong)) {
        return true;
      }
    }
    return false;
  }

  toString(): string {
    if (this.#any) {
      return "*";
    } else {
      return this.#etags.map((item) => String(item)).join(", ");
    }
  }

  get [Symbol.toStringTag](): string {
    return "IfMatch";
  }
}
