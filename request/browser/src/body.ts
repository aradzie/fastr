import { multiEntries } from "@webfx-http/headers";
import type { BodyDataType, NameValueEntries } from "./types";

export function guessContentType(
  body: unknown,
  contentType: string | null,
): [BodyDataType, string] {
  if (typeof body === "string") {
    return [body, contentType ?? "text/plain"];
  }
  if (body instanceof FormData) {
    return [body, contentType ?? "multipart/form-data"];
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
  return [JSON.stringify(body), contentType ?? "application/json"];
}

export function toFormData(
  body:
    | FormData
    | URLSearchParams
    | Map<string, unknown>
    | Record<string, unknown>
    | NameValueEntries,
): [FormData | URLSearchParams, string] {
  if (body instanceof FormData) {
    return [body, "multipart/form-data"];
  }
  if (!(body instanceof URLSearchParams)) {
    body = new URLSearchParams([...multiEntries(body as Map<string, unknown>)]);
  }
  return [body, "application/x-www-form-urlencoded"];
}
