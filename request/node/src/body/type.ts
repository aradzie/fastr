import { isJSON } from "@webfx-request/json";
import { Readable } from "stream";
import { BodyDataType } from "../types";
import { Streamable } from "./streamable";

export function guessContentType(
  body: BodyDataType | URLSearchParams | object,
  contentType: string | null,
): [BodyDataType, string] {
  if (typeof body === "string") {
    return [body, contentType ?? "text/plain"];
  }
  if (Buffer.isBuffer(body)) {
    return [body, contentType ?? "application/octet-stream"];
  }
  if (body instanceof Readable) {
    return [body, contentType ?? "application/octet-stream"];
  }
  if (body instanceof Streamable) {
    return [body, contentType ?? "application/octet-stream"];
  }
  if (body instanceof URLSearchParams) {
    return [String(body), contentType ?? "application/x-www-form-urlencoded"];
  }
  if (isJSON(body)) {
    return [JSON.stringify(body), contentType ?? "application/json"];
  }
  throw new TypeError("Invalid body object.");
}
