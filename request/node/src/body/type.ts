import { isJSON } from "@webfx-request/json";
import { Readable } from "stream";
import { BodyDataType } from "../types";
import { Streamable } from "./streamable";

const S_TEXT = "text/plain; charset=UTF-8";
const S_FORM = "application/x-www-form-urlencoded; charset=UTF-8";
const S_JSON = "application/json; charset=UTF-8";
const S_BINARY = "application/octet-stream";

export function guessContentType(
  body: BodyDataType | URLSearchParams | object,
  contentType: string | null,
): [BodyDataType, string] {
  if (body != null) {
    if (typeof body === "string") {
      return [body, contentType ?? S_TEXT];
    }
    if (Buffer.isBuffer(body)) {
      return [body, contentType ?? S_BINARY];
    }
    if (body instanceof Readable) {
      return [body, contentType ?? S_BINARY];
    }
    if (body instanceof Streamable) {
      return [body, contentType ?? S_BINARY];
    }
    if (body instanceof URLSearchParams) {
      return [String(body), contentType ?? S_FORM];
    }
    if (isJSON(body)) {
      return [JSON.stringify(body), contentType ?? S_JSON];
    }
  }
  throw new TypeError("Invalid body object.");
}
