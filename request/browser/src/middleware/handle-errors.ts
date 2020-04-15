import { throwError } from "@webfx-http/error";
import { isClientError, isServerError } from "@webfx-http/status";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

export interface HandleErrorOptions {
  /**
   * Whether to ignore response body in case of a failed response.
   */
  readonly ignoreBody?: boolean;
}

/**
 * Returns a new middleware which checks the response status and throws HTTP
 * errors in case of client of server error statuses.
 *
 * By default this request library does not reject the returned promises if
 * the response status is not successful, it lets the callers to manually
 * examine the status and decide what to do with it. In some cases the callers
 * might expect to receive an un-successful response status, for example to
 * check if a page is not found, so this is the right thing to do.
 *
 * This middleware automates error handling and rejects the returned promises
 * with an HTTP error instance if the response status if not successful.
 */
export function handleErrors(options: HandleErrorOptions = {}): Middleware {
  const { ignoreBody = true } = options;
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    const response = await adapter(request);
    const { status, statusText } = response;
    if (isClientError(status) || isServerError(status)) {
      if (ignoreBody) {
        response.abort(); // TODO Do we need this?
      }
      throwError(status, statusText);
    }
    return response;
  };
}
