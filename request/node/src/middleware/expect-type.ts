import { UnsupportedMediaTypeError } from "@webfx-http/error";
import { MimeType } from "@webfx-http/headers";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

/**
 * Returns a new middleware which checks the `Content-Type` header in responses
 * and throws the `UnsupportedMediaTypeError` error if it does not match the
 * expected type.
 * @param expectedType The MIME type to expect in the responses.
 */
export function expectType(expectedType: MimeType | string): Middleware {
  return (adapter: Adapter): Adapter => {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      const response = await adapter(request);
      const responseType =
        response.headers.contentType() ?? MimeType.APPLICATION_OCTET_STREAM;
      if (!MimeType.of(expectedType).matches(responseType)) {
        response.abort();
        throw new UnsupportedMediaTypeError();
      }
      return response;
    };
  };
}
