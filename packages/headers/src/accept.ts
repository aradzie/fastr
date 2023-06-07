import { Accepted, head, negotiateAll, type Weighted } from "./accepted.js";
import {
  getHeader,
  type GetHeader,
  type Header,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";
import { MediaType } from "./media-type.js";
import { readParams } from "./syntax/params.js";
import { Scanner, Separator } from "./syntax/syntax.js";

const headerName = "Accept";
const headerNameLc = "accept";

/**
 * The `Accept` header.
 *
 * @see https://httpwg.org/specs/rfc9110.html#field.accept
 */
export class Accept implements Header {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: Accept | string): Accept {
    if (typeof value === "string") {
      return Accept.parse(value);
    } else {
      return value;
    }
  }

  static get(headers: GetHeader): Accept | null {
    return getHeader(Accept, headers);
  }

  static tryGet(headers: GetHeader): Accept | null {
    return tryGetHeader(Accept, headers);
  }

  static parse(input: string): Accept {
    return parseOrThrow(Accept, input);
  }

  static tryParse(input: string): Accept | null {
    // Accept = #( media-range [ weight ] )
    // media-range     = ( "*/*"
    //                     / ( type "/" "*" )
    //                     / ( type "/" subtype )
    //                   ) parameters
    // parameters      = *( OWS ";" OWS [ parameter ] )
    // parameter       = parameter-name "=" parameter-value
    // parameter-name  = token
    // parameter-value = ( token / quoted-string )
    // weight          = OWS ";" OWS "q=" qvalue
    // qvalue          = ( "0" [ "." 0*3DIGIT ] )
    //                 / ( "1" [ "." 0*3("0") ] )
    // Example:
    //   Accept: audio/*; q=0.2, audio/basic
    //   Accept: text/plain; q=0.5, text/html, text/x-dvi; q=0.8, text/x-c
    //   Accept: text/*, text/plain, text/plain;format=flowed, */*
    const header = new Accept();
    const scanner = new Scanner(input);
    while (true) {
      const type = scanner.readToken();
      if (type == null) {
        return null;
      }
      if (!scanner.readChar(Separator.Slash)) {
        return null;
      }
      const subtype = scanner.readToken();
      if (subtype == null) {
        return null;
      }
      const mediaType = new MediaType(type, subtype);
      const q: Weighted = { q: 1 };
      if (!readParams(scanner, mediaType.params, q)) {
        return null;
      }
      header.add(mediaType, q.q);
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
   * Returns an `Accept` instance which accepts any media type `"* / *"`.
   */
  static any(): Accept {
    return new Accept().add(MediaType.any());
  }

  readonly #list: AcceptedMediaType[] = [];

  constructor(...items: readonly (MediaType | string)[]) {
    for (const item of items) {
      this.add(item);
    }
  }

  /**
   * Adds a new accepted media type with the given quality parameter.
   */
  add(value: MediaType | string, q = 1): this {
    this.#list.push(new AcceptedMediaType(MediaType.from(value), q));
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
    if (this.#list.length === 0) {
      return [...candidates];
    }
    return negotiateAll(candidates, this.#list, (v) => MediaType.from(v));
  }

  toString(): string {
    return this.#list.map((item) => String(item)).join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "Accept";
  }
}

class AcceptedMediaType extends Accepted<MediaType> {
  readonly mediaType: MediaType;

  constructor(mediaType: MediaType, q: number) {
    super();
    this.q = q;
    this.mediaType = mediaType;
  }

  override compare(candidate: MediaType): number | null {
    let s = 0;
    if (this.mediaType.type !== "*") {
      if (this.mediaType.type === candidate.type) {
        s += 10000;
      } else {
        return null;
      }
    }
    if (this.mediaType.subtype !== "*") {
      if (this.mediaType.subtype === candidate.subtype) {
        s += 1000;
      } else {
        return null;
      }
    }
    for (const [key, value] of this.mediaType.params) {
      if (!candidate.params.has(key)) {
        return null;
      }
      if (value !== "*") {
        if (value === candidate.params.get(key)) {
          s += 1;
        } else {
          return null;
        }
      }
    }
    return s;
  }

  override toString(): string {
    if (this.q < 1) {
      return `${this.mediaType}; q=${this.q}`;
    } else {
      return String(this.mediaType);
    }
  }
}
