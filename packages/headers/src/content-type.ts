import {
  getHeader,
  type GetHeader,
  type Header,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";
import { MediaType } from "./media-type.js";

const headerName = "Content-Type";
const headerNameLc = "content-type";

export class ContentType implements Header {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: ContentType | string): ContentType {
    if (typeof value === "string") {
      return ContentType.parse(value);
    } else {
      return value;
    }
  }

  static get(headers: GetHeader): ContentType | null {
    return getHeader(ContentType, headers);
  }

  static tryGet(headers: GetHeader): ContentType | null {
    return tryGetHeader(ContentType, headers);
  }

  static parse(input: string): ContentType {
    return parseOrThrow(ContentType, input);
  }

  static tryParse(input: string): ContentType | null {
    const type = MediaType.tryParse(input);
    if (type != null) {
      return new ContentType(type);
    } else {
      return null;
    }
  }

  static readonly generic = new ContentType("application/octet-stream");

  private _type!: MediaType;

  constructor(type: MediaType | string) {
    this.type = MediaType.from(type);
  }

  get type(): MediaType {
    return this._type;
  }

  set type(type: MediaType) {
    if (type.type === "*" || type.subtype === "*") {
      throw new TypeError();
    }
    for (const [name, value] of type.params) {
      if (name === "*" || value === "*") {
        throw new TypeError();
      }
    }
    this._type = type;
  }

  is(...candidates: readonly string[]): string | false {
    // TODO Match parameters.
    // TODO Select the most specific.
    if (candidates.length === 0) {
      throw new TypeError("Empty candidates");
    }
    for (const candidate of candidates) {
      if (this._type.matches(candidate)) {
        return candidate;
      }
    }
    return false;
  }

  toString(): string {
    return `${this._type}`;
  }

  get [Symbol.toStringTag](): string {
    return "ContentType";
  }
}
