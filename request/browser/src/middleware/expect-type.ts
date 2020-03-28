import { UnsupportedMediaTypeError } from "@webfx-http/error";
import { MimeType } from "@webfx-http/headers";
import { isSuccess } from "@webfx-http/status";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

/**
 * Returns a new middleware which checks the `Content-Type` header in responses
 * and throws the `UnsupportedMediaTypeError` error if it does not match the
 * expected type.
 *
 * It only checks successful responses.
 *
 * @param expectedType The content type to expect in the responses.
 * @throws UnsupportedMediaTypeError If response content type does not match
 *         the expected type.
 */
export function expectType(
  ...expectedType: readonly (MimeType | string)[]
): Middleware {
  const types = [...expectedType].map((v) => MimeType.of(v));
  if (types.length === 0) {
    throw new TypeError();
  }
  return (adapter: Adapter): Adapter => {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      const response = await adapter(request);
      if (!isSuccess(response.status)) {
        return response;
      }
      const responseType =
        response.headers.contentType() ?? MimeType.APPLICATION_OCTET_STREAM;
      if (types.some((type) => type.matches(responseType))) {
        return response;
      }
      response.abort();
      throw new UnsupportedMediaTypeError();
    };
  };
}
