import {
  type GetHeader,
  getHeader,
  type Header,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";

const headerName = "ETag";
const headerNameLc = "etag";

/**
 * The `E-Tag` header.
 *
 * @see https://httpwg.org/specs/rfc9110.html#rfc.section.8.8.3
 */
export class ETag implements Header {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: ETag | string): ETag {
    if (typeof value === "string") {
      return new ETag(value);
    } else {
      return value;
    }
  }

  static get(headers: GetHeader): ETag | null {
    return getHeader(ETag, headers);
  }

  static tryGet(headers: GetHeader): ETag | null {
    return tryGetHeader(ETag, headers);
  }

  static parse(input: string): ETag {
    return parseOrThrow(ETag, input);
  }

  static tryParse(input: string): ETag {
    // ETag       = entity-tag
    // entity-tag = [ weak ] opaque-tag
    // weak       = %s"W/"
    // opaque-tag = DQUOTE *etagc DQUOTE
    // etagc      = %x21 / %x23-7E / obs-text
    //            ; VCHAR except double quotes, plus obs-text
    //
    // Examples:
    //   ETag: "xyzzy"
    //   ETag: W/"xyzzy"
    //   ETag: ""
    return new ETag(input);
  }

  #value: string;
  #weak: boolean;

  constructor(value: string, weak = false) {
    if (value.startsWith("W/")) {
      weak = true;
      value = value.substring(2);
    }
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    this.#value = value;
    this.#weak = weak;
  }

  get value(): string {
    return this.#value;
  }

  set value(value: string) {
    this.#value = value;
  }

  get weak(): boolean {
    return this.#weak;
  }

  set weak(value: boolean) {
    this.#weak = value;
  }

  matches(that: string | ETag, strong = false): boolean {
    that = ETag.from(that);
    if (strong && (this.#weak || that.#weak)) {
      return false;
    }
    return this.#value === that.#value;
  }

  toString(): string {
    return `${this.#weak ? "W/" : ""}"${this.#value}"`;
  }

  get [Symbol.toStringTag](): string {
    return "ETag";
  }
}
