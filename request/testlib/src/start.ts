import {
  Adapter,
  HttpRequest,
  HttpResponse,
  Middleware,
} from "@webfx-request/node";
import http, { createServer, RequestListener } from "http";
import https from "https";
import net, { AddressInfo } from "net";

export function start(
  what: http.Server | https.Server | RequestListener,
): Middleware {
  const server = startServer(what);
  const serverUrl = baseUrl(server);
  return (adapter: Adapter): Adapter => {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      return adapter({
        ...request,
        url: String(new URL(request.url, serverUrl)),
      });
    };
  };
}

function startServer(
  what: http.Server | https.Server | RequestListener,
): http.Server | https.Server {
  if (what instanceof http.Server) {
    return what;
  }
  if (what instanceof https.Server) {
    return what;
  }
  return createServer(what);
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
