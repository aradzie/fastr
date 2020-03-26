import { MediaType } from "@fastr/headers";
import { MediaTypes } from "@fastr/mediatypes";
import { UTF8 } from "./payload.js";

export function useCharset(header: string): string {
  const type = MediaType.parse(header);
  setCharset(type, true);
  return String(type);
}

export function useCharsetIfText(header: string): string {
  const type = MediaType.parse(header);
  setCharset(type, MediaTypes.lookup(type)?.text ?? false);
  return String(type);
}

export function setCharset(type: MediaType, force: boolean): void {
  const charset = type.params.get("charset");
  if (charset != null && toBufferEncoding(charset) !== "utf8") {
    throw new TypeError(
      `Charset [${charset}] is not supported. Only [${UTF8}] is supported.`,
    );
  }
  if ((charset != null && charset !== UTF8) || force) {
    type.params.set("charset", UTF8);
  }
}

export function toBufferEncoding(charset: string): BufferEncoding {
  switch (charset) {
    case "UTF-8":
    case "UTF8":
    case "utf-8":
    case "utf8":
      return "utf8";
    case "UTF-16":
    case "UTF16":
    case "utf-16":
    case "utf16":
      return "utf16le";
    case "ASCII":
    case "ascii":
      return "ascii";
  }
  switch (charset.toLowerCase()) {
    case "utf-8":
    case "utf8":
      return "utf8";
    case "utf-16":
    case "utf16":
    case "utf-16le":
    case "utf16le":
      return "utf16le";
    case "iso-8859-1":
    case "latin1":
      return "latin1";
    case "ascii":
      return "ascii";
  }
  // NodeJS does not understand this charset natively.
  throw new TypeError(`Unsupported charset [${charset}]`);
}
