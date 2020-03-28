import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

export interface XsrfOptions {
  readonly cookieName?: string;
  readonly headerName?: string;
  readonly cookieReader?: (cookieName: string) => string | null;
}

/**
 * See https://owasp.org/www-community/attacks/csrf
 */
export function xsrf(options: XsrfOptions = {}): Middleware {
  const {
    cookieName = "XSRF-TOKEN",
    headerName = "X-XSRF-TOKEN",
    cookieReader = documentCookieReader,
  } = options;
  return (adapter: Adapter): Adapter => {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      // TODO Implement me.
      return adapter(request);
    };
  };
}

function documentCookieReader(cookieName: string): string | null {
  return null;
}
