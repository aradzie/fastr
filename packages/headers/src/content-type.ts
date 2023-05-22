import {
  getHeader,
  type Header,
  type IncomingHeaders,
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

  static get(headers: IncomingHeaders): ContentType | null {
    return getHeader(ContentType, headers);
  }

  static tryGet(headers: IncomingHeaders): ContentType | null {
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

  private _type!: MediaType;

  constructor(type: MediaType | string) {
    this.type = MediaType.from(type);
  }

  get type(): MediaType {
    return this._type;
  }

  set type(type: MediaType) {
    if (type.type === "*" || type.subtype === "*" || type.params.size > 0) {
      throw new TypeError();
    }
    this._type = type;
  }

  toString(): string {
    return `${this._type.essence}`;
  }

  get [Symbol.toStringTag](): string {
    return "ContentType";
  }
}
