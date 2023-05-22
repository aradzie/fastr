import { type Header, parseOrThrow } from "./headers.js";

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

  private _value: string;
  private _weak: boolean;

  constructor(value: string, weak = false) {
    if (value.startsWith("W/")) {
      weak = true;
      value = value.substring(2);
    }
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    this._value = value;
    this._weak = weak;
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }

  get weak(): boolean {
    return this._weak;
  }

  set weak(value: boolean) {
    this._weak = value;
  }

  matches(that: string | ETag, strong = false): boolean {
    that = ETag.from(that);
    if (strong && (this._weak || that._weak)) {
      return false;
    }
    return this._value === that._value;
  }

  toString(): string {
    return `${this._weak ? "W/" : ""}"${this._value}"`;
  }

  get [Symbol.toStringTag](): string {
    return "ETag";
  }
}
