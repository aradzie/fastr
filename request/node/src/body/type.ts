import { Readable } from "stream";
import { BodyDataType } from "../types";
import { Streamable } from "./streamable";

export function guessContentType(
  body: BodyDataType | URLSearchParams | unknown,
  contentType: string | null,
): [BodyDataType, string] {
  if (typeof body === "string") {
    return [body, contentType ?? "text/plain"];
  }
  if (Buffer.isBuffer(body)) {
    return [body, contentType ?? "application/octet-stream"];
  }
  if (
    Buffer.isBuffer(body) ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
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
  return [JSON.stringify(body), contentType ?? "application/json"];
}