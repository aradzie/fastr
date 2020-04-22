import { multiEntriesOf } from "@webfx-http/headers";
import { isJSON } from "@webfx-request/json";
import type { BodyDataType, NameValueEntries } from "./types";

export function guessContentType(
  body: unknown,
  contentType: string | null,
): [BodyDataType, string | null] {
  if (body == null) {
    throw new TypeError();
  }
  if (typeof body === "string") {
    return [body, contentType ?? "text/plain"];
  }
  if (body instanceof FormData) {
    return [body, null]; // Let the browser determine the right type.
  }
  if (body instanceof URLSearchParams) {
    return [body, contentType ?? "application/x-www-form-urlencoded"];
  }
  if (body instanceof Blob) {
    return [body, contentType ?? (body.type || "application/octet-stream")];
  }
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return [body, contentType ?? "application/octet-stream"];
  }
  if (isJSON(body)) {
    return [JSON.stringify(body), contentType ?? "application/json"];
  }
  throw new TypeError("Invalid body object.");
}

export function toFormData(
  body:
    | FormData
    | URLSearchParams
    | Map<string, unknown>
    | Record<string, unknown>
    | NameValueEntries,
): [FormData | URLSearchParams, string | null] {
  if (body == null) {
    throw new TypeError();
  }
  if (body instanceof FormData) {
    return [body, null];
  }
  if (!(body instanceof URLSearchParams)) {
    body = new URLSearchParams([
      ...multiEntriesOf(body as Map<string, unknown>),
    ]);
  }
  return [body, "application/x-www-form-urlencoded"];
}
