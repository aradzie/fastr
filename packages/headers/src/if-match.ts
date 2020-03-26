import { ETag } from "./etag.js";
import { type Header, parseOrThrow } from "./headers.js";
import { readETag } from "./syntax-etag.js";
import { Scanner, Separator } from "./syntax.js";

/**
 * The `If-Match` header.
 */
export class IfMatch implements Header, Iterable<ETag> {
  static from(value: IfMatch | string): IfMatch {
    if (typeof value === "string") {
      return IfMatch.parse(value);
    } else {
      return value;
    }
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

  private _any = false;
  private _etags: ETag[] = [];

  constructor(any = false, etags: readonly (ETag | string)[] = []) {
    this.any = any;
    for (const etag of etags) {
      this.add(etag);
    }
  }

  [Symbol.iterator](): Iterator<ETag> {
    return this._etags[Symbol.iterator]();
  }

  get any(): boolean {
    return this._any;
  }

  set any(value: boolean) {
    this._any = value;
  }

  add(etag: ETag | string): void {
    this._etags.push(ETag.from(etag));
  }

  matches(that: string | ETag, strong = false): boolean {
    if (this._any) {
      return true;
    }
    that = ETag.from(that);
    for (const etag of this._etags) {
      if (etag.matches(that, strong)) {
        return true;
      }
    }
    return false;
  }

  toString(): string {
    if (this._any) {
      return "*";
    } else {
      return this._etags.map((item) => String(item)).join(", ");
    }
  }

  get [Symbol.toStringTag](): string {
    return "IfMatch";
  }
}
