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
// TODO Parameter middlewares.
// TODO Escape URI components.

const kRouterPath = Symbol("kRouterPath");
const kRouterMethod = Symbol("kRouterMethod");

export interface RouterOptions {
  readonly prefix?: string;
  readonly caseSensitive?: boolean;
  readonly matchTrailingSlash?: boolean;
}

export class Router<StateT = unknown> {
  private readonly prefix: Prefix | null;
  private readonly caseSensitive: boolean;
  private readonly matchTrailingSlash: boolean;
  private readonly middlewares: Array<Middleware<RouterState>> = [];
  private readonly paramMiddlewaresByName = new Map<string, ParamMiddleware>();
  private readonly routesByName = new Map<string, Route>();
  private readonly root = new Node();

  constructor({
    prefix = "",
    caseSensitive = true,
    matchTrailingSlash = true,
  }: RouterOptions = {}) {
    this.prefix = prefix ? new Prefix(prefix) : null;
    this.caseSensitive = caseSensitive;
    this.matchTrailingSlash = matchTrailingSlash;
  }

  use(...middlewares: readonly Middleware<RouterState>[]): Router<StateT> {
    this.middlewares.push(
      ...(middlewares as ReadonlyArray<Middleware<RouterState>>),
    );
    return this;
  }

  param(param: string, middleware: ParamMiddleware): Router<StateT> {
    this.paramMiddlewaresByName.set(param, middleware);
    return this;
  }

  get(
    name: string,
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  get(
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  get(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  get(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  get(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] === "string" &&
      typeof args[1] === "string"
    ) {
      const [name, path, ...middlewares] = args;
      this.register({
        name,
        path,
        method: "GET",
        middlewares,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middlewares] = args;
      this.register({
        path,
        method: "GET",
        middlewares,
      });
      return this;
    }
    throw new TypeError();
  }

  post(
    name: string,
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  post(
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  post(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  post(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  post(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] === "string" &&
      typeof args[1] === "string"
    ) {
      const [name, path, ...middlewares] = args;
      this.register({
        name,
        path,
        method: "POST",
        middlewares,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middlewares] = args;
      this.register({
        path,
        method: "POST",
        middlewares,
      });
      return this;
    }
    throw new TypeError();
  }

  put(
    name: string,
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  put(
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  put(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  put(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  put(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] === "string" &&
      typeof args[1] === "string"
    ) {
      const [name, path, ...middlewares] = args;
      this.register({
        name,
        path,
        method: "PUT",
        middlewares,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middlewares] = args;
      this.register({
        path,
        method: "PUT",
        middlewares,
      });
      return this;
    }
    throw new TypeError();
  }

  delete(
    name: string,
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  delete(
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  delete(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  delete(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  delete(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] === "string" &&
      typeof args[1] === "string"
    ) {
      const [name, path, ...middlewares] = args;
      this.register({
        name,
        path,
        method: "DELETE",
        middlewares,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middlewares] = args;
      this.register({
        path,
        method: "DELETE",
        middlewares,
      });
      return this;
    }
    throw new TypeError();
  }

  patch(
    name: string,
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  patch(
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  patch(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  patch(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  patch(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] === "string" &&
      typeof args[1] === "string"
    ) {
      const [name, path, ...middlewares] = args;
      this.register({
        name,
        path,
        method: "PATCH",
        middlewares,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middlewares] = args;
      this.register({
        path,
        method: "PATCH",
        middlewares,
      });
      return this;
    }
    throw new TypeError();
  }

  any(
    name: string,
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  any(
    path: string,
    ...middlewares: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  any(
    name: string,
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  any(
    path: string,
    middleware: Middleware<RouterState>,
    routeHandler: Middleware<RouterState>,
  ): Router<StateT>;
  any(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] === "string" &&
      typeof args[1] === "string"
    ) {
      const [name, path, ...middlewares] = args;
      this.register({
        name,
        path,
        method: "*",
        middlewares,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middlewares] = args;
      this.register({
        path,
        method: "*",
        middlewares,
      });
      return this;
    }
    throw new TypeError();
  }

  redirect(from: string, to: string, code = 301): Router<StateT> {
    this.any(from, (ctx) => {
      ctx.response.redirect(to, code);
    });
    return this;
  }

  register(config: {
    readonly name?: string | null;
    readonly path: string;
    readonly method: string;
    readonly middlewares:
      | Middleware<RouterState>
      | readonly Middleware<RouterState>[];
  }): Route {
    let { name = null, path, method, middlewares } = config;
    if (!Array.isArray(middlewares)) {
      middlewares = [middlewares] as readonly Middleware<RouterState>[];
    }
    const route = new Route({ name, path, method, middlewares });
    if (name != null) {
      if (this.routesByName.has(name)) {
        throw new Error(`Duplicate route name "${name}"`);
      }
      this.routesByName.set(name, route);
    }
    Node.insert(this.root, route);
    return route;
  }

  middleware(): Middleware<RouterState> {
    return async (ctx: Context<RouterState>, next: Next): Promise<void> => {
      ctx.container.bind(Router).toConstantValue(this);

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
      if (this.prefix != null) {
        const match = this.prefix.match(path, params);
        if (match != null) {
          path = match.suffix;
        } else {
          return next();
        }
      }

      // Find route.
      const match = Node.find(this.root, path, method, params);
      if (match === kNotFound) {
        return next();
      }
      if (match === kMethodNotAllowed) {
        throw new MethodNotAllowedError();
      }

      const updatedParams = await this.convertParams(params, ctx);
      const { route } = match;

      // Update context.
      ctx.state.router = this;
      Object.assign((ctx.state.params ??= {}), updatedParams);

      // Call route middleware.
      return compose([...this.middlewares, ...route.middlewares])(ctx, next);
    };
  }

  private async convertParams(
    params: MatchedPathParams,
    ctx: Context,
  ): Promise<Params> {
    const result = Object.create(null);
    for (const [name, value] of Object.entries(params)) {
      const middleware = this.paramMiddlewaresByName.get(name);
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
    const route = this.routesByName.get(name);
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
    if (this.prefix != null) {
      return this.prefix.makePath(params) + route.makePath(params).substring(1);
    } else {
      return route.makePath(params);
    }
  }

  get [Symbol.toStringTag]() {
    return "Router";
  }
}
