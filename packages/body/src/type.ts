import { MediaType } from "@fastr/headers";
import { isJSON } from "@fastr/json";
import { MediaTypes } from "@fastr/mediatypes";
import { Readable } from "stream";
import { Streamable } from "./streamable.js";

export type BodyDataType = string | Buffer | Readable | Streamable | null;

export const UTF8 = "UTF-8";
export const TEXT_TYPE = `text/plain; charset=${UTF8}`;
export const FORM_TYPE = `application/x-www-form-urlencoded; charset=${UTF8}`;
export const JSON_TYPE = `application/json; charset=${UTF8}`;
export const BINARY_TYPE = `application/octet-stream`;

export function guessContentType(
  body: unknown,
  contentType: string | null,
): [BodyDataType, string | null] {
  if (body == null) {
    return [null, null];
  }

  if (typeof body === "string") {
    return [body, useCharset(contentType ?? TEXT_TYPE)];
  }

  if (Buffer.isBuffer(body)) {
    return [body, useCharsetIfText(contentType ?? BINARY_TYPE)];
  }

  if (body instanceof Readable) {
    return [body, useCharsetIfText(contentType ?? BINARY_TYPE)];
  }

  if (body instanceof Streamable) {
    return [body, useCharsetIfText(contentType ?? BINARY_TYPE)];
  }

  if (body instanceof URLSearchParams) {
    return [String(body), useCharset(contentType ?? FORM_TYPE)];
  }

  if (isJSON(body)) {
    return [JSON.stringify(body), useCharset(contentType ?? JSON_TYPE)];
  }

  throw new TypeError(
    `Invalid body type ${Object.prototype.toString.call(body)}`,
  );
}

function useCharset(header: string): string {
  const type = MediaType.parse(header);
  setCharset(type);
  return String(type);
}

function useCharsetIfText(header: string): string {
  const type = MediaType.parse(header);
  if (MediaTypes.lookup(type)?.text) {
    setCharset(type);
  } else {
    type.params.delete("charset");
  }
  return String(type);
}

function setCharset(type: MediaType): void {
  const charset = type.params.get("charset");
  if (charset == null) {
    type.params.set("charset", UTF8);
  } else if (charset !== UTF8) {
    throw new TypeError(
      `Charset [${charset}] is not supported. Only [${UTF8}] is supported.`,
    );
  }
}
