import { compose, type Context, type Middleware, type Next } from "@fastr/core";
import { MethodNotAllowedError } from "@fastr/errors";
import { kMethodNotAllowed, kNotFound, Node } from "./node.js";
import { type MatchedPathParams } from "./path.js";
import { Prefix } from "./prefix.js";
import { Route } from "./route.js";
import {
  type ParamMiddleware,
  type Params,
  type RouterState,
} from "./types.js"; // TODO Percent-decode path components

// TODO Percent-decode path components
// TODO Improve pattern parsing.
// TODO Hierarchical router and merge routes.
// TODO Case sensitivity.
// TODO Trailing slash.
// TODO Trailing star.
// TODO Parameter middleware.
// TODO Escape URI components.

const kRouterPath = Symbol("kRouterPath");
const kRouterMethod = Symbol("kRouterMethod");

export interface RouterOptions {
  readonly prefix?: string;
  readonly caseSensitive?: boolean;
  readonly matchTrailingSlash?: boolean;
}

export type RouteOptions = {
  readonly name?: string | null;
  readonly path: string;
  readonly method: string;
  readonly middleware:
    | Middleware<RouterState>
    | readonly Middleware<RouterState>[];
};

export class Router<StateT = unknown> {
  readonly #prefix: Prefix | null;
  readonly #caseSensitive: boolean;
  readonly #matchTrailingSlash: boolean;
  readonly #middleware: Array<Middleware<RouterState>> = [];
  readonly #paramMiddlewareByName = new Map<string, ParamMiddleware>();
  readonly #routesByName = new Map<string, Route>();
  readonly #root = new Node();

  constructor({
    prefix = "",
    caseSensitive = true,
    matchTrailingSlash = true,
  }: RouterOptions = {}) {
    this.#prefix = prefix ? new Prefix(prefix) : null;
    this.#caseSensitive = caseSensitive;
    this.#matchTrailingSlash = matchTrailingSlash;
  }

  use(...middleware: readonly Middleware<RouterState>[]): Router<StateT> {
    this.#middleware.push(...middleware);
    return this;
  }

  param(param: string, middleware: ParamMiddleware): Router<StateT> {
    this.#paramMiddlewareByName.set(param, middleware);
    return this;
  }

  GET(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  GET(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  GET(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  GET(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  GET(...args: any[]): this {
    return this.#addRoute("GET", args);
  }

  POST(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  POST(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  POST(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  POST(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  POST(...args: any[]): this {
    return this.#addRoute("POST", args);
  }

  PUT(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  PUT(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  PUT(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  PUT(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  PUT(...args: any[]): this {
    return this.#addRoute("PUT", args);
  }

  DELETE(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  DELETE(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  DELETE(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  DELETE(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  DELETE(...args: any[]): this {
    return this.#addRoute("DELETE", args);
  }

  PATCH(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  PATCH(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  PATCH(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  PATCH(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  PATCH(...args: any[]): this {
    return this.#addRoute("PATCH", args);
  }

  ANY(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  ANY(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  ANY(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  ANY(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  ANY(...args: any[]): this {
    return this.#addRoute("*", args);
  }

  addRoute(
    method: string,
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  addRoute(
    method: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  addRoute(
    method: string,
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  addRoute(
    method: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  addRoute(method: string, ...args: any[]): this {
    return this.#addRoute(method, args);
  }

  #addRoute(method: string, args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] === "string" &&
      typeof args[1] === "string"
    ) {
      const [name, path, ...middleware] = args;
      this.register({
        name,
        path,
        method,
        middleware,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middleware] = args;
      this.register({
        path,
        method,
        middleware,
      });
      return this;
    }
    throw new TypeError();
  }

  redirect(from: string, to: string, code = 301): Router<StateT> {
    this.ANY(from, (ctx) => {
      ctx.response.redirect(to, code);
    });
    return this;
  }

  register(options: RouteOptions): Route {
    let { name = null, path, method, middleware } = options;
    if (!Array.isArray(middleware)) {
      middleware = [middleware] as Middleware<RouterState>[];
    }
    const route = new Route({ name, path, method, middleware });
    if (name != null) {
      if (this.#routesByName.has(name)) {
        throw new Error(`Duplicate route name "${name}"`);
      }
      this.#routesByName.set(name, route);
    }
    Node.insert(this.#root, route);
    return route;
  }

  registerAll(list: Iterable<RouteOptions>): this {
    for (const options of list) {
      this.register(options);
    }
    return this;
  }

  middleware(): Middleware<RouterState> {
    return async (ctx: Context<RouterState>, next: Next): Promise<void> => {
      ctx.container.bind(Router).toValue(this);

      let { path, method } = ctx.request;
      const {
        [kRouterPath]: routerPath, //
        [kRouterMethod]: routerMethod,
      } = ctx.state;
      if (typeof routerPath === "string") {
        path = routerPath;
      } else {
        ctx.state[kRouterPath] = path;
      }
      if (typeof routerMethod === "string") {
        method = routerMethod;
      } else {
        ctx.state[kRouterMethod] = method;
      }

      const params = Object.create(null) as MatchedPathParams;

      // Match prefix.
      if (this.#prefix != null) {
        const match = this.#prefix.match(path, params);
        if (match != null) {
          path = match.suffix;
        } else {
          return next();
        }
      }

      // Find route.
      const match = Node.find(this.#root, path, method, params);
      if (match === kNotFound) {
        return next();
      }
      if (match === kMethodNotAllowed) {
        throw new MethodNotAllowedError();
      }

      const updatedParams = await this.#convertParams(params, ctx);
      const { route } = match;

      // Update context.
      ctx.state.router = this;
      Object.assign((ctx.state.params ??= {}), updatedParams);

      // Call the route middleware.
      return compose([...this.#middleware, ...route.middleware])(ctx, next);
    };
  }

  async #convertParams(
    params: MatchedPathParams,
    ctx: Context,
  ): Promise<Params> {
    const result = Object.create(null);
    for (const [name, value] of Object.entries(params)) {
      const middleware = this.#paramMiddlewareByName.get(name);
      if (middleware != null) {
        result[name] = await middleware(value, ctx);
      } else {
        result[name] = value;
      }
    }
    return result;
  }

  /**
   * Returns named route with the given name.
   *
   * @throws Error If route with the given name does not exist.
   */
  namedRoute(name: string): Route {
    const route = this.#routesByName.get(name);
    if (route == null) {
      throw new Error(`Unknown route name "${name}"`);
    }
    return route;
  }

  /**
   * Generates path by replacing parameter placeholders with the given values.
   *
   * The generated path is prepended with the configured prefix, if any.
   *
   * Example:
   *
   * ```
   * const router = new Router().get("myName", "/path/{param}", ...);
   * const path = router.makePath("myName", { param: "value" });
   * assert.ok(path == "/path/value");
   * ```
   *
   * @param name Unique route name.
   * @param params Parameters to replace placeholders in the path.
   * @return Generated path.
   *
   * @throws Error If route with the given name does not exist.
   */
  makePath(name: string, params: Params): string {
    const route = this.namedRoute(name);
    if (this.#prefix != null) {
      return (
        this.#prefix.makePath(params) + route.makePath(params).substring(1)
      );
    } else {
      return route.makePath(params);
    }
  }

  get [Symbol.toStringTag]() {
    return "Router";
  }
}
