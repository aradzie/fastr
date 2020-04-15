import { UnsupportedMediaTypeError } from "@webfx-http/error";
import { Accept, Headers, MediaType } from "@webfx-http/headers";
import { isSuccess } from "@webfx-http/status";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

/**
 * Returns a new middleware which sets the `Accept` header in requests and
 * checks the `Content-Type` header in responses and throws
 * the `UnsupportedMediaTypeError` error if response content type does not match
 * the expected type. It only checks successful responses.
 *
 * @param expectedType The content type to expect in the responses.
 * @throws UnsupportedMediaTypeError If response content type does not match
 *         the expected type.
 */
export function expectType(
  ...expectedType: readonly (MediaType | string)[]
): Middleware {
  const accept = new Accept();
  for (const item of expectedType) {
    accept.add(String(item));
  }
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    // Update request headers, make request with the new headers.
    const response = await adapter({
      ...request,
      headers: new Headers(request.headers).set("Accept", accept),
    });

    // Check response.
    if (!isSuccess(response.status)) {
      return response;
    }
    const responseType =
      response.headers.map("Content-Type", MediaType.parse) ??
      MediaType.APPLICATION_OCTET_STREAM;
    if (accept.accepts(responseType.name)) {
      return response;
    }
    response.abort();
    throw new UnsupportedMediaTypeError();
  };
}
