import { MediaType } from "@webfx-http/headers";

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
  static isJson(type: MediaType | string): boolean {
    return match(jsonTypes, MediaType.from(type));
  }

  /**
   * Test if the specified mime type is of text category.
   */
  static isText(type: MediaType | string): boolean {
    return match(textTypes, MediaType.from(type));
  }

  /**
   * Test if the specified mime type is of binary category.
   */
  static isBinary(type: MediaType | string): boolean {
    return match(binaryTypes, MediaType.from(type));
  }

  /**
   * Add known JSON mime type. Wildcards subtypes are supported, e.g. "text/*".
   */
  static addJsonType(type: string): void {
    jsonTypes.add(type);
  }

  /**
   * Add known text mime type. Wildcards subtypes are supported, e.g. "text/*".
   */
  static addTextType(type: string): void {
    textTypes.add(type);
  }

  /**
   * Add known binary mime type. Wildcards subtypes are supported, e.g. "image/*".
   */
  static addBinaryType(type: string): void {
    binaryTypes.add(type);
  }
}

function match(all: Set<string>, type: MediaType): boolean {
  return all.has(type.type + "/" + type.subtype) || all.has(type.type + "/*");
}

for (const type of [
  "application/json",
  "application/error+json",
  "application/problem+json",
]) {
  MimeDb.addJsonType(type);
}

for (const type of [
  "text/*",
  "image/svg+xml",
  "application/xml",
  "application/atom+xml",
  "application/rss+xml",
  "application/rdf+xml",
  "application/xhtml+xml",
  "application/javascript",
]) {
  MimeDb.addTextType(type);
}

for (const type of [
  "application/octet-stream",
  "image/*",
  "audio/*",
  "video/*",
]) {
  MimeDb.addBinaryType(type);
}
