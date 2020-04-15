import { isServerError } from "@webfx-http/status";
import { isStreamBody } from "../body/send";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

export interface RetryFailedOptions {
  /**
   * The maximal number of retries.
   *
   * The default value is three.
   */
  readonly maxRetries?: number;
  /**
   * The callback which decides whether to retry a response.
   *
   * The default action is to retry on the server error status codes except for
   * status code 501 `Not Implemented`.
   */
  readonly shouldRetry?: (response: HttpResponse) => boolean;

  // TODO Add pause between failed requests.
}

/**
 * Returns a new middleware which retries failed requests.
 * @param options The middleware options.
 */
export function retryFailed(options: RetryFailedOptions = {}): Middleware {
  const { maxRetries = 3, shouldRetry = retryFailed.shouldRetry } = options;
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    // TODO Cache stream body.
    if (isStreamBody(request.body ?? null)) {
      throw new TypeError("Cannot retry with stream bodies");
    }

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
