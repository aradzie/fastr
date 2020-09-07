import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import type net from "net";
import type { AddressInfo } from "net";

export type AsyncRequestListener = (
  req: IncomingMessage,
  res: ServerResponse,
) => any;

export interface Route {
  readonly method: string;
  readonly url: string;
  readonly listener: AsyncRequestListener;
}

export class Router {
  readonly #routes: Route[] = [];

  add(method: string, url: string, listener: AsyncRequestListener): this {
    this.#routes.push({ method, url, listener });
    return this;
  }

  handle(req: IncomingMessage, res: ServerResponse): void {
    const method = req.method ?? "GET";
    let url = req.url ?? "/";
    const i = url.indexOf("?");
    if (i !== -1) {
      url = url.substring(0, i);
    }
    for (const route of this.#routes) {
      if (
        (route.method === "*" || route.method === method) &&
        route.url === url
      ) {
        const result = route.listener(req, res);
        if (result instanceof Promise) {
          result.catch((err) => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain");
            res.end(String(err));
          });
        }
        return;
      }
    }
    this.notFound(req, res);
  }

  notFound(req: IncomingMessage, res: ServerResponse): void {
    const { method, url } = req;
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end(`Resource not found: ${method}:${url}`);
  }
}

export class TestServer {
  readonly baseUrl: string;

  constructor(readonly server: net.Server, readonly router: Router) {
    this.baseUrl = baseUrl(server);
  }

  url(url: string): string {
    return String(new URL(url, this.baseUrl));
  }

  addRoute(method: string, url: string, listener: AsyncRequestListener): this {
    this.router.add(method, url, listener);
    return this;
  }

  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export function startServer({ port = 8080 } = {}): TestServer {
  const router = new Router();
  const server = http.createServer((req, res) => {
    router.handle(req, res);
  });
  server.on("error", (err) => {
    console.error("Server error", err);
  });
  server.listen(port);
  const testServer = new TestServer(server, router);
  console.log(`Server is listening on ${testServer.baseUrl}`);
  return testServer;
}

function baseUrl(server: net.Server): string {
  const { address, family, port } = server.address() as AddressInfo;
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
