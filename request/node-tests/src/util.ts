import baseTest, { TestInterface } from "ava"; // eslint-disable-line
import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import net, { AddressInfo } from "net";

export const test = baseTest as TestInterface<Context>;

test.beforeEach(async (t) => {
  t.context = {
    server: await startServer(),
  };
});

test.afterEach(async (t) => {
  await t.context.server.close();
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
  readonly #routes: Route[] = [];

  add(method: string, url: string, listener: AsyncRequestListener): this {
    this.#routes.push({ method, url, listener });
    return this;
  }

  handle(req: IncomingMessage, res: ServerResponse): void {
    const { method, url } = req;
    for (const route of this.#routes) {
      if (route.method === method && route.url === url) {
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
    const { address, family, port } = this.server.address() as AddressInfo;
    const protocol = (() => {
      if (server instanceof http.Server) {
        return "http";
      }
      if (server instanceof https.Server) {
        return "https";
      }
      throw new Error(); // Unreachable.
    })();
    switch (family) {
      case "IPv4":
        this.baseUrl = `${protocol}://${address}:${port}/`;
        break;
      case "IPv6":
        this.baseUrl = `${protocol}://[${address}]:${port}/`;
        break;
      default:
        throw new Error(); // Unreachable.
    }
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

export function startServer(): Promise<TestServer> {
  const router = new Router();
  return new Promise<TestServer>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      router.handle(req, res);
    });
    try {
      server.listen();
      resolve(new TestServer(server, router));
    } catch (err) {
      reject(err);
    }
  });
}
