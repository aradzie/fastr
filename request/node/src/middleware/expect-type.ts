import { UnsupportedMediaTypeError } from "@webfx-http/error";
import { Accept, Headers, MimeType } from "@webfx-http/headers";
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
  ...expectedType: readonly (MimeType | string)[]
): Middleware {
  const accept = new Accept(expectedType);
  return (adapter: Adapter): Adapter => {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      // Update request headers.
      const headers = Headers.from(request.headers ?? {})
        .toBuilder()
        .accept(accept)
        .build();
      request = {
        ...request,
        headers,
      };

      // Make request.
      const response = await adapter(request);

      // Check response.
      if (!isSuccess(response.status)) {
        return response;
      }
      const responseType =
        response.headers.contentType() ?? MimeType.APPLICATION_OCTET_STREAM;
      if (accept.accepts(responseType)) {
        return response;
      }
      response.abort();
      throw new UnsupportedMediaTypeError();
    };
  };
}
