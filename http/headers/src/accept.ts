import { InvalidAcceptError } from "./errors.js";
import { MediaType } from "./media-type.js";
import { findQualityParam, Scanner } from "./syntax.js";
import type { Header } from "./types.js";

const kList = Symbol("kList");

export class Entry {
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
 * Parsed `Accept` header.
 *
 * See https://tools.ietf.org/html/rfc7231#section-5.3.2
 */
export class Accept implements Header, Iterable<Entry> {
  static from(value: Accept | string): Accept {
    if (typeof value === "string") {
      return Accept.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `Accept` by parsing the given header string.
   */
  static parse(input: string): Accept {
    // Accept = #( media-range [ accept-params ] )
    //
    // media-range    = ( "*/*"
    //                  / ( type "/" "*" )
    //                  / ( type "/" subtype )
    //                  ) *( OWS ";" OWS parameter )
    // accept-params  = weight *( accept-ext )
    // weight         = OWS ";" OWS "q=" qvalue
    // qvalue         = ( "0" [ "." 0*3DIGIT ] )
    //                / ( "1" [ "." 0*3("0") ] )
    // accept-ext     = OWS ";" OWS token [ "=" ( token / quoted-string ) ]
    const accept = new Accept();
    const scanner = new Scanner(input);
    while (scanner.hasNext()) {
      const type = scanner.readToken();
      if (type == null) {
        throw new InvalidAcceptError();
      }
      if (!scanner.readSeparator(0x2f /* / */)) {
        throw new InvalidAcceptError();
      }
      const subtype = scanner.readToken();
      if (subtype == null) {
        throw new InvalidAcceptError();
      }
      const params = scanner.readParams();
      if (params != null) {
        accept.add(`${type}/${subtype}`, findQualityParam(params));
      } else {
        accept.add(`${type}/${subtype}`);
      }
      if (scanner.hasNext() && !scanner.readSeparator(0x2c /* , */)) {
        throw new InvalidAcceptError();
      }
    }
    return accept;
  }

  /**
   * Returns an `Accept` instance which accepts any media type `"* / *"`.
   */
  static any(): Accept {
    return new Accept().add("*/*");
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
   * Adds a new accepted type with the given quality parameter.
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
   * Tests whether the specified media type is accepted.
   * @param candidate A candidate media type.
   * @return Whether the candidate media type is accepted.
   */
  accepts(candidate: string): boolean | number {
    if (this[kList].length === 0) {
      return true;
    }
    for (const item of this[kList]) {
      if (MediaType.from(item.value).matches(candidate)) {
        return item.q ?? true;
      }
    }
    return false;
  }

  /**
   * From the given list of candidate media types returns the one which
   * matches best, or `null` if no candidate matched.
   * @param candidates A list of candidate media types to chose from.
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
    return "Accept";
  }
}
