import { MimeType } from "@webfx-http/headers";

const jsonTypes = new Set<string>();
const textTypes = new Set<string>();
const binaryTypes = new Set<string>();

/**
 * Parsed mime type components.
 */
export class MimeDb {
  /**
   * Test if the specified mime type is of JSON category.
   */
  static isJson(mimeType: MimeType | string): boolean {
    return match(jsonTypes, MimeType.from(mimeType));
  }

  /**
   * Test if the specified mime type is of text category.
   */
  static isText(mimeType: MimeType | string): boolean {
    return match(textTypes, MimeType.from(mimeType));
  }

  /**
   * Test if the specified mime type is of binary category.
   */
  static isBinary(mimeType: MimeType | string): boolean {
    return match(binaryTypes, MimeType.from(mimeType));
  }

  /**
   * Add known JSON mime type. Wildcards subtypes are supported, e.g. "text/*".
   */
  static addJsonType(mimeType: string) {
    jsonTypes.add(mimeType);
  }

  /**
   * Add known text mime type. Wildcards subtypes are supported, e.g. "text/*".
   */
  static addTextType(mimeType: string) {
    textTypes.add(mimeType);
  }

  /**
   * Add known binary mime type. Wildcards subtypes are supported, e.g. "image/*".
   */
  static addBinaryType(mimeType: string) {
    binaryTypes.add(mimeType);
  }
}

function match(all: Set<string>, mimeType: MimeType): boolean {
  return (
    all.has(mimeType.type + "/" + mimeType.subtype) ||
    all.has(mimeType.type + "/*")
  );
}

for (const mimeType of [
  "application/json",
  "application/error+json",
  "application/problem+json",
]) {
  MimeDb.addJsonType(mimeType);
}

for (const mimeType of [
  "text/*",
  "image/svg+xml",
  "application/xml",
  "application/atom+xml",
  "application/rss+xml",
  "application/rdf+xml",
  "application/xhtml+xml",
  "application/javascript",
]) {
  MimeDb.addTextType(mimeType);
}

for (const mimeType of [
  "application/octet-stream",
  "image/*",
  "audio/*",
  "video/*",
]) {
  MimeDb.addBinaryType(mimeType);
}
