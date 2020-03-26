import { UnsupportedMediaTypeError } from "@fastr/errors";
import { Accept, MediaType } from "@fastr/headers";
import { isSuccess } from "@fastr/status";
import { HttpHeaders } from "../headers.js";
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
    const response = await adapter({
      ...request,
      headers: new HttpHeaders(request.headers).set("Accept", accept),
    });

    // Check response.
    if (!isSuccess(response.status)) {
      return response;
    }
    const responseType =
      response.headers.map("Content-Type", MediaType.parse) ??
      new MediaType("application", "octet-stream");
    if (accept.accepts(responseType.essence)) {
      return response;
    }
    response.abort();
    throw new UnsupportedMediaTypeError();
  };
}
