import { HttpHeaders } from "@webfx-http/headers";
import { isServerError } from "@webfx-http/status";
import { cacheStreamBody, isStreamBody } from "../body/send.js";
import type {
  Adapter,
  HttpRequest,
  HttpResponse,
  Middleware,
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
    let { body } = request;
    if (body != null && isStreamBody(body)) {
      if (cacheRequestBody) {
        body = await cacheStreamBody(body);
        request = {
          ...request,
          body,
          headers: new HttpHeaders(request.headers)
            .set("Content-Length", body.byteLength)
            .delete("Transfer-Encoding"),
        };
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
