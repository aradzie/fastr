import { Accepted, head, negotiateAll, type Weighted } from "./accepted.js";
import {
  getHeader,
  type GetHeader,
  type Header,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";
import { readWeight } from "./params.js";
import { isToken, Scanner, Separator } from "./syntax.js";

const headerName = "Accept-Encoding";
const headerNameLc = "accept-encoding";

/**
 * The `Accept-Encoding` header.
 *
 * @see https://httpwg.org/specs/rfc9110.html#field.accept-encoding
 */
export class AcceptEncoding implements Header {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: AcceptEncoding | string): AcceptEncoding {
    if (typeof value === "string") {
      return AcceptEncoding.parse(value);
    } else {
      return value;
    }
  }

  static get(headers: GetHeader): AcceptEncoding | null {
    return getHeader(AcceptEncoding, headers);
  }

  static tryGet(headers: GetHeader): AcceptEncoding | null {
    return tryGetHeader(AcceptEncoding, headers);
  }

  static parse(input: string): AcceptEncoding {
    return parseOrThrow(AcceptEncoding, input);
  }

  static tryParse(input: string): AcceptEncoding | null {
    // Accept-Encoding  = #( codings [ weight ] )
    // codings          = content-coding / "identity" / "*"
    // content-coding   = token
    // weight           = OWS ";" OWS "q=" qvalue
    // qvalue           = ( "0" [ "." 0*3DIGIT ] )
    //                  / ( "1" [ "." 0*3("0") ] )
    const header = new AcceptEncoding();
    const scanner = new Scanner(input);
    while (true) {
      const token = scanner.readToken();
      if (token == null) {
        return null;
      }
      const q: Weighted = { q: 1 };
      if (!readWeight(scanner, q)) {
        return null;
      }
      header.add(token, q.q);
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

  /**
   * Returns an `AcceptEncoding` instance which accepts `"*"`.
   */
  static any(): AcceptEncoding {
    return new AcceptEncoding().add("*");
  }

  /**
   * Returns an `AcceptEncoding` instance which accepts `"identity"`.
   */
  static identity(): AcceptEncoding {
    return new AcceptEncoding().add("identity");
  }

  readonly #list: AcceptedEncoding[] = [];

  constructor(...items: readonly string[]) {
    for (const item of items) {
      this.add(item);
    }
  }

  /**
   * Adds a new accepted encoding with the given quality parameter.
   */
  add(value: string, q = 1): this {
    this.#list.push(new AcceptedEncoding(value, q));
    return this;
  }

  accepts(candidate: string): boolean {
    return this.negotiate(candidate) === candidate;
  }

  negotiate(...candidates: readonly string[]): string | null {
    return head(this.negotiateAll(...candidates));
  }

  negotiateAll(...candidates: readonly string[]): string[] {
    if (candidates.length === 0) {
      throw new TypeError("Empty candidates");
    }
    return negotiateAll(candidates, this.#list, (v) => v.toLowerCase());
  }

  toString(): string {
    return this.#list.map((item) => String(item)).join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "AcceptEncoding";
  }
}

class AcceptedEncoding extends Accepted<string> {
  readonly value: string;
  readonly valueLc: string;

  constructor(value: string, q: number) {
    super();
    if (!isToken(value)) {
      throw new TypeError();
    }
    this.q = q;
    this.value = value;
    this.valueLc = value.toLowerCase();
  }

  override compare(candidateLc: string): number | null {
    if (this.valueLc === candidateLc) {
      return 1000;
    }
    if (this.valueLc === "*") {
      return 0;
    }
    return null;
  }

  override toString(): string {
    if (this.q < 1) {
      return `${this.value}; q=${this.q}`;
    } else {
      return String(this.value);
    }
  }
}
