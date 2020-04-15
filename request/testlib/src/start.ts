import {
  Adapter,
  HttpRequest,
  HttpResponse,
  Middleware,
} from "@webfx-request/node";
import http, { createServer, RequestListener } from "http";
import https from "https";
import net, { AddressInfo } from "net";

/**
 * Returns a new middleware which redirects all requests to the given server.
 * The middleware will make sure that the server is listening for requests,
 * and will rewrite relative URLs in the incoming requests to match the server
 * address.
 *
 * Unlike the fake request implementation which is used in unit tests this
 * middleware employs the real HTTP stack from node and allows writing
 * integration tests.
 *
 * Example:
 *
 * ```typescript
 * import { request } from "@webfx-request/node";
 * import { start } from "@webfx-request/testlib";
 *
 * const tester = request.use(start((req, res) => {
 *   res.end("it works!");
 * }));
 *
 * const response = await tester.get("/relative/url").send();
 * const body = await response.body.text();
 * assert(body === "it works!");
 * ```
 *
 * @param target If a HTTP or HTTPS sever then it will be started to accept
 *               requests. If a request listener callback function then a new
 *               HTTP server will be created and started for it.
 */
export function start(
  target: http.Server | https.Server | RequestListener,
): Middleware {
  const server = toServer(target);
  const serverUrl = baseUrl(server);
  return async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    return adapter({
      ...request,
      url: String(new URL(request.url, serverUrl)),
    });
  };
}

function toServer(
  target: http.Server | https.Server | RequestListener,
): http.Server | https.Server {
  if (target instanceof http.Server) {
    return target;
  }
  if (target instanceof https.Server) {
    return target;
  }
  return createServer(target);
}

function baseUrl(server: net.Server): string {
  let a = server.address() as AddressInfo;
  if (a == null) {
    server.listen();
    a = server.address() as AddressInfo;
    if (a == null) {
      throw new Error(); // Unreachable.
    }
  }
  const { address, family, port } = a;
  const protocol = serverProtocol(server);
  switch (family) {
    case "IPv4":
      return `${protocol}://${address}:${port}/`;
    case "IPv6":
      return `${protocol}://[${address}]:${port}/`;
    default:
      throw new Error(); // Unreachable.
  }
}

function serverProtocol(server: net.Server): string {
  if (server instanceof http.Server) {
    return "http";
  }
  if (server instanceof https.Server) {
    return "https";
  }
  throw new Error(); // Unreachable.
}
