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
    // Compute cookies to send.
    const cookie = new Cookie([
      // Remembered cookies.
      ...jar,
      // User specified cookies.
      ...(request.headers?.map("Cookie", Cookie.parse) ?? []),
    ]);

    // Append cookies to request.
    const response = await adapter({
      ...request,
      headers: new HttpHeaders(request.headers).set("Cookie", cookie),
    });

    // Save cookies from response.
    jar.addAll(response.headers.mapAll("Set-Cookie", SetCookie.parse));
    return response;
  };
}
