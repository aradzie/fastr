import { HeadersBuilder } from "@webfx-http/headers";
import {
  Adapter,
  HttpRequest,
  HttpResponse,
  Middleware,
} from "@webfx-request/node";
import { CookieJar } from "./cookiejar";

export function cookies(jar: CookieJar): Middleware {
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
