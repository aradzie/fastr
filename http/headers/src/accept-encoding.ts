import { InvalidAcceptEncodingError } from "./errors";
import { findQualityParam, Scanner } from "./syntax";
import type { Header } from "./types";

const kList = Symbol("kList");

class Entry {
  constructor(readonly value: string, readonly q: number | null = null) {}

  toString(): string {
    if (this.q != null) {
      return `${this.value}; q=${this.q}`;
    } else {
      return this.value;
    }
  }
}

/**
 * Parsed `Accept-Encoding` header.
 *
 * See https://tools.ietf.org/html/rfc7231#section-5.3.4
 */
export class AcceptEncoding implements Header, Iterable<Entry> {
  static from(value: AcceptEncoding | string): AcceptEncoding {
    if (typeof value === "string") {
      return AcceptEncoding.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `Accept` by parsing the given header string.
   */
  static parse(input: string): AcceptEncoding {
    // Accept-Encoding  = #( codings [ weight ] )
    // codings          = content-coding / "identity" / "*"
    // content-coding   = token
    // weight           = OWS ";" OWS "q=" qvalue
    // qvalue           = ( "0" [ "." 0*3DIGIT ] )
    //                  / ( "1" [ "." 0*3("0") ] )
    const accept = new AcceptEncoding();
    const scanner = new Scanner(input);
    while (scanner.hasNext()) {
      const token = scanner.readToken();
      if (token == null) {
        throw new InvalidAcceptEncodingError();
      }
      const params = scanner.readParams();
      if (params != null) {
        accept.add(token, findQualityParam(params));
      } else {
        accept.add(token);
      }
      if (!scanner.readSeparator(0x2c /* , */)) {
        break;
      }
    }
    return accept;
  }

  /**
   * Returns an `AcceptEncoding` instance which accepts `"identity"`.
   */
  static identity(): AcceptEncoding {
    return new AcceptEncoding().add("identity");
  }

  private readonly [kList]: Entry[];

  constructor() {
    Object.defineProperty(this, kList, {
      value: [],
    });
  }

  [Symbol.iterator](): Iterator<Entry> {
    return this[kList][Symbol.iterator]();
  }

  get empty(): boolean {
    return this[kList].length === 0;
  }

  /**
   * Adds a new accepted encoding with the given quality parameter.
   */
  add(value: string, q: number | null = null): this {
    const entry = new Entry(value, q);
    const list = this[kList];
    const { length } = list;
    for (let i = 0; i < length; i++) {
      const x = list[i];
      if (entry.q == null && x.q != null) {
        // Insert entries without q before entries with q.
        list.splice(i, 0, entry);
        return this;
      }
      if (entry.q != null && x.q != null && entry.q > x.q) {
        // Insert entries with larger q before entries with lower q.
        list.splice(i, 0, entry);
        return this;
      }
    }
    // Otherwise simply accept.
    list.push(entry);
    return this;
  }

  /**
   * Tests whether the specified encoding is accepted.
   * @param candidate A candidate encoding.
   * @return Whether the candidate encoding is accepted.
   */
  accepts(candidate: string): boolean | number {
    if (candidate === "identity") {
      return true;
    }
    for (const item of this[kList]) {
      if (item.value === candidate) {
        return item.q ?? true;
      }
    }
    return false;
  }

  /**
   * From the given list of candidate encodings returns the one which
   * matches best, or `null` if no candidate matched.
   * @param candidates A list of candidate encodings to chose from.
   * @return The best matching candidate, or `null` if none matches.
   */
  select(...candidates: readonly string[]): string | null {
    let best: string | null = null;
    let bq = 0;
    for (const candidate of candidates) {
      const q = this.accepts(candidate);
      if (q === true || q > bq) {
        best = candidate;
        bq = Number(q);
      }
    }
    return best;
  }

  toString(): string {
    return this[kList].map((item) => String(item)).join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "AcceptEncoding";
  }
}
