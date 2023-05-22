import { ETag } from "./etag.js";
import {
  getHeader,
  type Header,
  type IncomingHeaders,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";
import { readETag } from "./syntax-etag.js";
import { Scanner, Separator } from "./syntax.js";

const headerName = "If-None-Match";
const headerNameLc = "if-none-match";

/**
 * The `If-None-Match` header.
 */
export class IfNoneMatch implements Header, Iterable<ETag> {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: IfNoneMatch | string): IfNoneMatch {
    if (typeof value === "string") {
      return IfNoneMatch.parse(value);
    } else {
      return value;
    }
  }

  static get(headers: IncomingHeaders): IfNoneMatch | null {
    return getHeader(IfNoneMatch, headers);
  }

  static tryGet(headers: IncomingHeaders): IfNoneMatch | null {
    return tryGetHeader(IfNoneMatch, headers);
  }

  static parse(input: string): IfNoneMatch {
    return parseOrThrow(IfNoneMatch, input);
  }

  static tryParse(input: string): IfNoneMatch | null {
    if (input === "*") {
      return new IfNoneMatch(true);
    }
    const header = new IfNoneMatch(false);
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
    return "IfNoneMatch";
  }
}
