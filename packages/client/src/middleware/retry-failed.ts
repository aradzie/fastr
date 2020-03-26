import { Payload } from "@fastr/body";
import { isServerError } from "@fastr/status";
import { Readable } from "stream";
import { HttpHeaders } from "../headers.js";
import {
  type Adapter,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "../types.js";

export interface RetryFailedOptions {
  /**
   * The maximal number of retries.
   * The default value is three.
   */
  readonly maxRetries?: number;
  /**
   * The callback which decides whether to retry a response.
   * The default action is to retry on the server error status codes except for
   * status code 501 `Not Implemented`.
   */
  readonly shouldRetry?: (response: HttpResponse) => boolean;
  /**
   * Whether to cache the request body if it is a stream.
   * The default is true.
   */
  readonly cacheRequestBody?: boolean;
}

/**
 * Returns a new middleware which retries failed requests.
 * @param options The middleware options.
 */
export function retryFailed({
  maxRetries = 3,
  shouldRetry = retryFailed.shouldRetry,
  cacheRequestBody = true,
}: RetryFailedOptions = {}): Middleware {
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    // Cache request body if it is a stream.
    const { body = null, headers = null } = request;
    const payload = new Payload(body, new HttpHeaders(headers));
    if (payload.body instanceof Readable) {
      if (cacheRequestBody) {
        request = { ...request, body: await payload.readStream() };
      } else {
        throw new TypeError("Cannot retry with stream bodies");
      }
    }

    // Repeatedly send requests until success.
    let retryIndex = 0;
    while (true) {
      const response = await adapter(request);
      if (!shouldRetry(response)) {
        return response;
      }
      if (retryIndex === maxRetries) {
        return response;
      }
      retryIndex += 1;
    }
  };
}

retryFailed.shouldRetry = (response: HttpResponse): boolean => {
  const { status } = response;
  return status !== 501 && isServerError(status);
};
