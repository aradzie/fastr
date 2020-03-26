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

  #type!: MediaType;

  constructor(type: MediaType | string) {
    this.type = MediaType.from(type);
  }

  get type(): MediaType {
    return this.#type;
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
    this.#type = type;
  }

  is(...candidates: readonly string[]): string | false {
    if (candidates.length === 0) {
      throw new TypeError("Empty candidates");
    }
    let result: string | null = null;
    let resultScore: number | null = null;
    for (const candidate of candidates) {
      const candidateScore = isSubtypeOf(this.#type, MediaType.from(candidate));
      if (
        candidateScore != null &&
        (resultScore == null || candidateScore > resultScore)
      ) {
        result = candidate;
        resultScore = candidateScore;
      }
    }
    return result ?? false;
  }

  toString(): string {
    return `${this.#type}`;
  }

  get [Symbol.toStringTag](): string {
    return "ContentType";
  }
}

function isSubtypeOf(a: MediaType, b: MediaType): number | null {
  let s = 0;
  if (b.type !== "*") {
    if (a.type === b.type) {
      s += 10000;
    } else {
      return null;
    }
  }
  if (b.subtype !== "*") {
    if (a.subtype === b.subtype) {
      s += 1000;
    } else {
      return null;
    }
  }
  for (const [key, value] of b.params) {
    if (value !== "*") {
      if (a.params.get(key) === value) {
        s += 1;
      } else {
        return null;
      }
    }
  }
  return s;
}
