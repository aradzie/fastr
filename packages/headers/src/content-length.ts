import {
  getHeader,
  type Header,
  type HeadersLike,
  parseOrThrow,
  tryGetHeader,
} from "./headers.js";

const headerName = "Content-Length";
const headerNameLc = "content-length";

export class ContentLength implements Header {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: ContentLength | string): ContentLength {
    if (typeof value === "string") {
      return ContentLength.parse(value);
    } else {
      return value;
    }
  }

  static get(headers: HeadersLike): ContentLength | null {
    return getHeader(ContentLength, headers);
  }

  static tryGet(headers: HeadersLike): ContentLength | null {
    return tryGetHeader(ContentLength, headers);
  }

  static parse(input: string): ContentLength {
    return parseOrThrow(ContentLength, input);
  }

  static tryParse(input: string): ContentLength | null {
    return new ContentLength(Number(input)); // Validated by nodejs.
  }

  private _length!: number;

  constructor(length: number) {
    this.length = length;
  }

  get length(): number {
    return this._length;
  }

  set length(length: number) {
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new TypeError();
    }
    this._length = length;
  }

  toString(): string {
    return `${this._length}`;
  }

  get [Symbol.toStringTag](): string {
    return "ContentLength";
  }
}
