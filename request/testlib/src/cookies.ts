import { HeadersBuilder } from "@webfx-http/headers";
import {
  Adapter,
  HttpRequest,
  HttpResponse,
  Middleware,
} from "@webfx-request/node";
import { CookieJar } from "./cookiejar";

/**
 * Returns a new middleware which remembers cookies sent in responses and
 * attaches these cookies to requests.
 *
 * This makes the client behave like a web browser and allows testing stateful
 * HTTP sessions.
 *
 * @param jar A cookie jar which keeps cookies received in responses.
 *            It can also be used to examine the cookie contents.
 */
export function cookies(jar = new CookieJar()): Middleware {
  return (adapter: Adapter): Adapter => {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      // Append cookies to request.
      const builder = HeadersBuilder.from(request.headers ?? {});
      for (const cookie of jar) {
        builder.appendCookie(cookie);
      }
      const headers = builder.build();

      // Make request.
      const response = await adapter({
        ...request,
        headers,
      });

      // Save cookies from response.
      jar.addAll(response.headers.allSetCookies());
      return response;
    };
  };
}
