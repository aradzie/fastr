import { Cookie } from "@fastr/headers";
import {
  type Adapter,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "../types.js";

export interface XsrfOptions {
  /**
   * The default value is `"XSRF-TOKEN"`.
   */
  readonly cookieName?: string;
  /**
   * The default value is `"X-XSRF-TOKEN"`.
   */
  readonly headerName?: string;
  /**
   * Obtains the XSRF token to use with a request.
   */
  readonly cookieReader?: (cookieName: string) => string | null;
}

/**
 * @see https://owasp.org/www-community/attacks/csrf
 */
export function xsrf(options: XsrfOptions = {}): Middleware {
  const {
    cookieName = "XSRF-TOKEN",
    headerName = "X-XSRF-TOKEN",
    cookieReader = documentCookieReader,
  } = options;
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    const { url, method } = request;
    const urlLc = url.toLowerCase();
    const methodUc = (method ?? "GET").toUpperCase();
    if (
      methodUc === "GET" ||
      methodUc === "HEAD" ||
      urlLc.startsWith("http://") ||
      urlLc.startsWith("https://")
    ) {
      return adapter(request);
    }
    const headers = new Headers(request.headers ?? []);
    if (headers.has(headerName)) {
      return adapter(request);
    }
    const token = cookieReader(cookieName);
    if (token == null) {
      return adapter(request);
    }
    headers.set(headerName, token);
    return adapter({ ...request, headers });
  };
}

function documentCookieReader(cookieName: string): string | null {
  return Cookie.parse(window.document.cookie).get(cookieName) || null;
}
