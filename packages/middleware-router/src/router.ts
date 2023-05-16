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
  private readonly _prefix: Prefix | null;
  private readonly _caseSensitive: boolean;
  private readonly _matchTrailingSlash: boolean;
  private readonly _middleware: Array<Middleware<RouterState>> = [];
  private readonly _paramMiddlewareByName = new Map<string, ParamMiddleware>();
  private readonly _routesByName = new Map<string, Route>();
  private readonly _root = new Node();

  constructor({
    prefix = "",
    caseSensitive = true,
    matchTrailingSlash = true,
  }: RouterOptions = {}) {
    this._prefix = prefix ? new Prefix(prefix) : null;
    this._caseSensitive = caseSensitive;
    this._matchTrailingSlash = matchTrailingSlash;
  }

  use(...middleware: readonly Middleware<RouterState>[]): Router<StateT> {
    this._middleware.push(...middleware);
    return this;
  }

  param(param: string, middleware: ParamMiddleware): Router<StateT> {
    this._paramMiddlewareByName.set(param, middleware);
    return this;
  }

  get(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  get(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
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
      const [name, path, ...middleware] = args;
      this.register({
        name,
        path,
        method: "GET",
        middleware,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middleware] = args;
      this.register({
        path,
        method: "GET",
        middleware,
      });
      return this;
    }
    throw new TypeError();
  }

  post(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  post(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
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
      const [name, path, ...middleware] = args;
      this.register({
        name,
        path,
        method: "POST",
        middleware: middleware,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middleware] = args;
      this.register({
        path,
        method: "POST",
        middleware,
      });
      return this;
    }
    throw new TypeError();
  }

  put(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  put(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
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
      const [name, path, ...middleware] = args;
      this.register({
        name,
        path,
        method: "PUT",
        middleware: middleware,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middleware] = args;
      this.register({
        path,
        method: "PUT",
        middleware: middleware,
      });
      return this;
    }
    throw new TypeError();
  }

  delete(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  delete(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
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
      const [name, path, ...middleware] = args;
      this.register({
        name,
        path,
        method: "DELETE",
        middleware: middleware,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middleware] = args;
      this.register({
        path,
        method: "DELETE",
        middleware: middleware,
      });
      return this;
    }
    throw new TypeError();
  }

  patch(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  patch(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
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
      const [name, path, ...middleware] = args;
      this.register({
        name,
        path,
        method: "PATCH",
        middleware: middleware,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middleware] = args;
      this.register({
        path,
        method: "PATCH",
        middleware: middleware,
      });
      return this;
    }
    throw new TypeError();
  }

  any(
    name: string,
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
  ): Router<StateT>;
  any(
    path: string,
    ...middleware: readonly Middleware<RouterState>[]
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
      const [name, path, ...middleware] = args;
      this.register({
        name,
        path,
        method: "*",
        middleware: middleware,
      });
      return this;
    }
    if (args.length > 1 && typeof args[0] === "string") {
      const [path, ...middleware] = args;
      this.register({
        path,
        method: "*",
        middleware: middleware,
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

  register(options: RouteOptions): Route {
    let { name = null, path, method, middleware } = options;
    if (!Array.isArray(middleware)) {
      middleware = [middleware] as Middleware<RouterState>[];
    }
    const route = new Route({ name, path, method, middleware });
    if (name != null) {
      if (this._routesByName.has(name)) {
        throw new Error(`Duplicate route name "${name}"`);
      }
      this._routesByName.set(name, route);
    }
    Node.insert(this._root, route);
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
      if (this._prefix != null) {
        const match = this._prefix.match(path, params);
        if (match != null) {
          path = match.suffix;
        } else {
          return next();
        }
      }

      // Find route.
      const match = Node.find(this._root, path, method, params);
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
      return compose([...this._middleware, ...route.middleware])(ctx, next);
    };
  }

  private async convertParams(
    params: MatchedPathParams,
    ctx: Context,
  ): Promise<Params> {
    const result = Object.create(null);
    for (const [name, value] of Object.entries(params)) {
      const middleware = this._paramMiddlewareByName.get(name);
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
    const route = this._routesByName.get(name);
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
    if (this._prefix != null) {
      return (
        this._prefix.makePath(params) + route.makePath(params).substring(1)
      );
    } else {
      return route.makePath(params);
    }
  }

  get [Symbol.toStringTag]() {
    return "Router";
  }
}
