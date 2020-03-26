import { multiEntriesOf } from "@fastr/headers";
import { isJSON } from "@fastr/json";
import { type BodyDataType, type NameValueEntries } from "../types.js";

/**
 * The native Fetch API understands a limited amount of body types. This method
 * will try to convert the given body argument to a type understood by the API.
 * Along the way it will try to detect the media type of the returned body.
 * Throws `TypeError` if the body argument is invalid.
 * @param body A body to be converted to a native type and sent in a request.
 * @param contentType A user-provided content type.
 * @return A tuple of body and its content type.
 */
export function guessContentType(
  body: unknown,
  contentType: string | null,
): [BodyDataType, string | null] {
  // See https://fetch.spec.whatwg.org/#body-mixin
  if (body != null) {
    if (typeof body === "string") {
      return [body, contentType];
    }
    if (body instanceof FormData) {
      // Let the browser determine the right type.
      if (contentType != null) {
        throw new TypeError(
          process.env.NODE_ENV !== "production"
            ? "Must not explicitly set the Content-Type header " +
              "for a FormData body."
            : undefined,
        );
      }
      return [body, null];
    }
    if (body instanceof URLSearchParams) {
      // Let the browser determine the right type.
      if (contentType != null) {
        throw new TypeError(
          process.env.NODE_ENV !== "production"
            ? "Must not explicitly set the Content-Type header " +
              "for an URLSearchParams body."
            : undefined,
        );
      }
      return [body, null];
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
): FormData | URLSearchParams {
  if (body == null) {
    throw new TypeError();
  }
  if (body instanceof FormData) {
    return body;
  }
  if (body instanceof URLSearchParams) {
    return body;
  }
  return new URLSearchParams([...multiEntriesOf(body as Map<string, unknown>)]);
}
