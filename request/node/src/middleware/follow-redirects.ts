import { HttpHeaders } from "@webfx-http/headers";
import { RequestError } from "@webfx-request/error";
import { cacheStreamBody, isStreamBody } from "../body/send";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

export interface FollowRedirectOptions {
  /**
   * The mode for how redirects are handled.
   * The default is `"follow"`.
   */
  readonly redirect?: "manual" | "follow" | "error";
  /**
   * The number of redirects to follow before throwing error.
   * Zero to not follow redirects.
   * The default is three.
   */
  readonly follow?: number;
  /**
   * Whether to cache the request body if it is a stream.
   * The default is true.
   */
  readonly cacheRequestBody?: boolean;
}

/**
 * Returns a new middleware which checks the response status and follows
 * redirect responses in necessary.
 * @param expectedType The MIME type to expect in the responses.
 */
export function followRedirects({
  redirect = "follow",
  follow = 3,
  cacheRequestBody = true,
}: FollowRedirectOptions = {}): Middleware {
  if (redirect === "manual") {
    follow = 0;
  } else if (follow === 0) {
    redirect = "manual";
  }
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    // Cache request body if it is a stream.
    let { body } = request;
    if (body != null && isStreamBody(body)) {
      if (cacheRequestBody) {
        body = await cacheStreamBody(body);
        request = {
          ...request,
          body,
          headers: new HttpHeaders(request.headers)
            .set("Content-Length", body.byteLength)
            .delete("Transfer-Encoding"),
        };
      } else {
        throw new TypeError("Cannot follow redirects with stream bodies");
      }
    }

    // The current url to visit which is updated after each redirect response.
    let url = new URL(request.url);
    // The set of already visited urls for the loop detection purposes.
    const visited = new Set<string>();
    // Requesting a new host in a redirect?
    let changesOrigin = false;

    while (true) {
      // Send request with a new url.
      const response = await adapter({
        ...request,
        url: String(url),
      });

      // Test if we got a redirect response.
      // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
      const { status } = response;
      if (
        status === 301 ||
        status === 302 ||
        status === 303 ||
        status === 307 ||
        status === 308
      ) {
        switch (redirect) {
          case "manual":
            return response;
          case "error":
            response.abort();
            throw new RequestError("Redirect response detected", "REDIRECT");
          case "follow":
          default:
            response.abort();
            followLocation(response);
            if (status === 303) {
              // Update request, change method to GET and delete body.
              const headers = new HttpHeaders(request.headers)
                .delete("Host")
                .delete("Content-Type")
                .delete("Content-Length")
                .delete("Transfer-Encoding");
              if (changesOrigin) {
                headers.delete("Authorization").delete("Cookie");
              }
              request = {
                url: String(url),
                method: "GET",
                headers,
              };
            }
            break;
        }
      } else {
        // Not a redirect response.
        return response;
      }
    }

    function followLocation(response: HttpResponse): void {
      const location = response.headers.get("Location");
      if (location == null) {
        throw new RequestError("Redirect has no location", "REDIRECT");
      }
      const newUrl = new URL(location, url);
      if (!changesOrigin) {
        if (url.host !== url.host) {
          changesOrigin = true;
        }
      }
      url = newUrl;
      const str = String(url);
      if (visited.has(str)) {
        throw new RequestError("Redirect loop detected", "REDIRECT");
      }
      if (visited.size === follow) {
        throw new RequestError("Too many redirects", "REDIRECT");
      }
      visited.add(str);
    }
  };
}
