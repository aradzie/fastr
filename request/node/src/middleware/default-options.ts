import type {
  Adapter,
  HttpRequest,
  HttpRequestOptions,
  HttpResponse,
  Middleware,
} from "../types";

/**
 * Returns a new middleware which sets the specified request options if not
 * provided explicitly by the caller. The caller may override any of the
 * individual default options properties.
 *
 * @param options The default options to use if not provided explicitly.
 */
export function defaultOptions(options: HttpRequestOptions): Middleware {
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    return adapter({
      ...request,
      options: {
        ...options,
        ...request.options,
      },
    });
  };
}
