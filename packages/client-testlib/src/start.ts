import {
  type Adapter,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "@fastr/client";
import http, { createServer, type RequestListener } from "http";
import https from "https";
import type net from "net";
import { type AddressInfo } from "net";

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
 * import { request } from "@fastr/client";
 * import { start } from "@fastr/client-testlib";
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
): Middleware & {
  readonly server: http.Server | https.Server;
  readonly origin: string;
} {
  const server = toServer(target);
  const origin = originOf(server);
  const result = async (
    request: HttpRequest,
    adapter: Adapter,
  ): Promise<HttpResponse> => {
    return adapter({
      ...request,
      url: String(new URL(request.url, origin)),
    });
  };
  result.server = server;
  result.origin = origin;
  return result;
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

function originOf(server: net.Server): string {
  let a = server.address() as AddressInfo;
  if (a == null) {
    server.listen();
    a = server.address() as AddressInfo;
    if (a == null) {
      throw new Error(); // Unreachable.
    }
  }
  const { address, family, port } = a;
  const protocol = protocolOf(server);
  switch (family) {
    case "IPv4":
      return `${protocol}://${address}:${port}/`;
    case "IPv6":
      return `${protocol}://[${address}]:${port}/`;
    default:
      throw new Error(); // Unreachable.
  }
}

function protocolOf(server: net.Server): string {
  if (server instanceof http.Server) {
    return "http";
  }
  if (server instanceof https.Server) {
    return "https";
  }
  throw new Error(); // Unreachable.
}
