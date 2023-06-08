import { throwError } from "@fastr/errors";
import { isClientError, isServerError, isSuccess } from "@fastr/status";
import {
  type Adapter,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "../types.js";

export interface HandleErrorOptions {
  /**
   * Whether to accept only successful HTTP statuses.
   * But default the handle errors middleware rejects only error HTTP statuses
   * such as 4XX and 5XX. This option allows to reject more HTTP statuses
   * such as 1XX, 3XX, 4XX and 5XX.
   * The default value is `true`.
   */
  readonly okOnly?: boolean;
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
 * with an HTTP error instance if the response status if either client or server
 * error.
 */
export function handleErrors({
  okOnly = true,
}: HandleErrorOptions = {}): Middleware {
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    const response = await adapter(request);
    const { status, statusText } = response;
    if (isClientError(status) || isServerError(status)) {
      response.abort();
      throwError(status, statusText);
    }
    if (okOnly && !isSuccess(status)) {
      response.abort();
      throw new TypeError(`Excepted successful HTTP status but got ${status}.`);
    }
    return response;
  };
}
