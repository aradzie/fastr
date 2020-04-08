import baseTest, { TestInterface } from "ava"; // eslint-disable-line
import http, { IncomingMessage, RequestListener, ServerResponse } from "http";
import https from "https";
import net, { AddressInfo } from "net";

export const test = baseTest as TestInterface<Context>;

test.beforeEach((t) => {
  t.context = {
    server: new TestServer(),
  };
});

test.afterEach(async ({ context }) => {
  await context.server.close();
});

export interface Context {
  readonly server: TestServer;
}

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
  readonly routes: Route[] = [];

  add(method: string, url: string, listener: AsyncRequestListener): this {
    this.routes.push({ method, url, listener });
    return this;
  }

  listen(): RequestListener {
    return (req: IncomingMessage, res: ServerResponse): void => {
      const { method, url } = req;
      for (const route of this.routes) {
        if (route.method === method && route.url === url) {
          const result = route.listener(req, res);
          if (result instanceof Promise) {
            result.catch((err) => {
              this.status500(req, res, err);
            });
          }
          return;
        }
      }
      this.status404(req, res);
    };
  }

  status404(req: IncomingMessage, res: ServerResponse): void {
    const { method, url } = req;
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end(`Not Found: ${method}:${url}`);
  }

  status500(req: IncomingMessage, res: ServerResponse, err: Error): void {
    const { method, url } = req;
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(`Internal Server Error: ${method}:${url}: ${String(err)}`);
  }
}

export class TestServer {
  readonly server: net.Server;
  readonly baseUrl: string;
  readonly router: Router;

  constructor() {
    const router = new Router();
    const server = http.createServer(router.listen());
    this.server = server;
    this.baseUrl = baseUrl(server);
    this.router = router;
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
