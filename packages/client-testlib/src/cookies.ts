import {
  type Adapter,
  HttpHeaders,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "@fastr/client";
import { Cookie, SetCookie } from "@fastr/headers";
import { CookieJar } from "./cookiejar.js";

/**
 * Returns a new middleware which remembers cookies sent in the responses and
 * attaches these cookies to the following requests.
 *
 * This makes the client behave like a web browser and allows testing stateful
 * HTTP sessions.
 *
 * @param jar A cookie jar which keeps cookies received in responses.
 *            It can also be used to examine the cookie contents.
 */
export function cookies(jar = new CookieJar()): Middleware {
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    const headers = new HttpHeaders(request.headers);

    // Compute cookies to send.
    const cookie = new Cookie();

    // Remembered cookies.
    for (const [name, value] of jar) {
      cookie.set(name, value);
    }

    // User specified cookies.
    for (const [name, value] of Cookie.get(headers) ?? []) {
      cookie.set(name, value);
    }

    // Append cookies to request.
    headers.set("Cookie", cookie);

    const response = await adapter({ ...request, headers });

    // Save cookies from response.
    jar.addAll(SetCookie.getAll(response.headers));

    return response;
  };
}
