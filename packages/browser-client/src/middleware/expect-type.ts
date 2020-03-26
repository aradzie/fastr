import { UnsupportedMediaTypeError } from "@fastr/errors";
import { Accept, ContentType, type MediaType } from "@fastr/headers";
import { isSuccess } from "@fastr/status";
import {
  type Adapter,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "../types.js";

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
    const headers = new Headers(request.headers ?? []);
    headers.set("Accept", String(accept));
    const response = await adapter({ ...request, headers });

    // Check response.
    if (!isSuccess(response.status)) {
      return response;
    }
    const { type } = ContentType.get(response.headers) ?? ContentType.generic;
    if (accept.accepts(type.essence)) {
      return response;
    }
    response.abort();
    throw new UnsupportedMediaTypeError();
  };
}
