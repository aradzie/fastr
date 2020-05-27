import { BadRequestError } from "@webfx-http/error";

// See https://encoding.spec.whatwg.org/

export function normalizeCharset(charset: string): BufferEncoding {
  switch (charset.toLowerCase()) {
    case "utf8":
    case "utf-8":
      return "utf8";
    case "utf16":
    case "utf-16":
    case "utf16le":
    case "utf-16le":
      return "utf16le";
    case "iso-8859-1":
    case "latin1":
      return "latin1";
    case "ascii":
      return "ascii";
    default:
      // NodeJS does not understand this charset natively.
      throw new BadRequestError(`Unsupported charset [${charset}]`);
  }
}
