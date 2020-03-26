import { discardBody, Payload, TEXT_TYPE } from "@fastr/body";
import { Container } from "@fastr/invert";
import { statusMessage } from "@fastr/status";
import { EventEmitter } from "events";
import { type IncomingMessage, type ServerResponse } from "http";
import { type Http2ServerRequest, type Http2ServerResponse } from "http2";
import { compose } from "./compose.js";
import { Context } from "./context.js";
import { inspectError } from "./errors.js";
import {
  type AnyMiddleware,
  type HandlerClass,
  type HandlerObject,
  type Middleware,
  toMiddleware,
} from "./middleware.js";
import { type ProxyOptions, Request } from "./request.js";
import { Response } from "./response.js";
import { type DefaultState } from "./state.js";

export interface ApplicationOptions extends ProxyOptions {
  readonly defaultState: DefaultState;
}

export class Application<StateT = unknown> extends EventEmitter {
  readonly #middleware: Middleware[] = [];
  readonly #container: Container;
  readonly #options: ApplicationOptions;

  constructor(
    container: Container | null = null,
    {
      behindProxy = false,
      defaultState = Object.create(null),
    }: Partial<ApplicationOptions> = {},
  ) {
    super();
    this.#container =
      container ??
      new Container({
        autoBindInjectable: true,
      });
    this.#options = {
      behindProxy,
      defaultState,
    };
  }

  get container(): Container {
    return this.#container;
  }

  get options(): ApplicationOptions {
    return this.#options;
  }

  useAll(middleware: readonly AnyMiddleware[]): this {
    for (const item of middleware) {
      this.use(item);
    }
    return this;
  }

  use<NewStateT = unknown>(
    middleware: HandlerClass<StateT & NewStateT>,
  ): Application<StateT & NewStateT>;
  use<NewStateT = unknown>(
    middleware: HandlerObject<StateT & NewStateT>,
  ): Application<StateT & NewStateT>;
  use<NewStateT = unknown>(
    middleware: Middleware<StateT & NewStateT>,
  ): Application<StateT & NewStateT>;
  use(middleware: AnyMiddleware): Application;
  use(middleware: AnyMiddleware): this {
    this.#middleware.push(toMiddleware(middleware));
    return this;
  }

  callback(): (
    req: IncomingMessage | Http2ServerRequest,
    res: ServerResponse | Http2ServerResponse,
  ) => void {
    const middleware = compose(this.#middleware);

    return (_req, _res) => {
      const req = _req as IncomingMessage;
      const res = _res as ServerResponse;

      const handleError = (err: Error): void => {
        this.handleError(req, res, err);
      };

      req.on("error", handleError);
      res.on("error", handleError);

      const exec = async (): Promise<void> => {
        let ctx: Context;

        try {
          ctx = this.createContext(req, res);
        } catch (err) {
          handleError(err as Error);
          return;
        }

        try {
          await middleware(ctx, async () => {});
        } catch (err) {
          handleError(err as Error);
          return;
        }

        if (!ctx.response.hasStatus && !ctx.response.hasBody) {
          ctx.response.status = 404;
          ctx.response.body = "Not found";
        }

        try {
          await respond(ctx, req, res);
        } catch (err) {
          handleError(err as Error);
          return;
        }
      };

      exec().catch((err) => {
        console.error(err); // Error in the error handler.
      });
    };
  }

  createContext(req: IncomingMessage, res: ServerResponse): Context {
    const container = this.#container.createChild();
    const request = new Request(req, this.#options);
    const response = new Response(res);
    const state = this.createState();
    const context = new Context(container, request, response, state);
    container.bind(Context).toValue(context);
    container.bind(Request).toValue(request);
    container.bind(Response).toValue(response);
    return context;
  }

  createState(): DefaultState {
    return Object.assign(Object.create(null), {
      ...this.#options.defaultState,
      params: Object.create(null),
    });
  }

  protected handleError(
    req: IncomingMessage,
    res: ServerResponse,
    err: Error,
  ): void {
    if ("code" in err && err.code === "ECONNRESET") {
      req.destroy();
      res.destroy();
      return;
    }

    const { name, message, status, expose } = inspectError(err);
    if (res.writable && !res.headersSent) {
      for (const name of res.getHeaderNames()) {
        res.removeHeader(name);
      }
      res.statusCode = status;
      const body = expose
        ? `${name}: ${message}`
        : `${status} - ${statusMessage(status)}`;
      res.setHeader("Connection", "close");
      res.setHeader("Content-Type", TEXT_TYPE);
      res.setHeader("Content-Length", Buffer.byteLength(body));
      res.end(body);
    }

    req.destroy();
    res.destroy();

    if (!expose) {
      // Server-side non-recoverable error.
      if (this.listenerCount("error") > 0) {
        this.emit("error", err);
      } else {
        console.error(err);
      }
    }
  }

  get [Symbol.toStringTag](): string {
    return "Application";
  }
}

function respond(
  ctx: Context,
  req: IncomingMessage,
  res: ServerResponse,
): void {
  const payload = new Payload(ctx.response.body, ctx.response.headers);
  if (!res.writable || ctx.response.hijacked) {
    discardBody(payload.body);
  } else if (req.method === "HEAD" || res.statusCode === 304) {
    discardBody(payload.body);
    payload.sendHeaders(res);
    res.end();
  } else {
    payload.send(res);
  }
}
