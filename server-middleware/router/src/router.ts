import { MethodNotAllowedError } from "@webfx-http/error";
import { compose } from "@webfx/middleware";
import Koa from "koa";
import { kMethodNotAllowed, kNotFound, Node } from "./node";
import { MatchedPathParams } from "./path";
import { Prefix } from "./prefix";
import { Route } from "./route";
import { ParamMiddleware, RouterContext, RouterMiddleware } from "./types";

// TODO Improve pattern parsing.
// TODO Hierarchical router and merge routes.
// TODO Case sensitivity.
// TODO Trailing slash.
// TODO Trailing star.
// TODO Parameter middlewares.
// TODO Escape URI components.

const kRouter = Symbol("kRouter");
const kRouterPath = Symbol("kRouterPath");
const kRouterMethod = Symbol("kRouterMethod");

export interface RouterOptions {
  readonly prefix?: string;
  readonly caseSensitive?: boolean;
  readonly matchTrailingSlash?: boolean;
}

export class Router<StateT = any, CustomT = {}> {
  private readonly prefix: Prefix | null;
  private readonly caseSensitive: boolean;
  private readonly matchTrailingSlash: boolean;
  private readonly middlewares: Array<RouterMiddleware> = [];
  private readonly paramMiddlewaresByName = new Map<string, ParamMiddleware>();
  private readonly routesByName = new Map<string, Route>();
  private readonly root = new Node();

  constructor(options: RouterOptions = {}) {
    const {
      prefix = "",
      caseSensitive = true,
      matchTrailingSlash = true,
    } = options;
    if (prefix != "") {
    }
    this.prefix = prefix ? new Prefix(prefix) : null;
    this.caseSensitive = caseSensitive;
    this.matchTrailingSlash = matchTrailingSlash;
  }

  use(
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT> {
    this.middlewares.push(
      ...((middlewares as Array<any>) as Array<RouterMiddleware>),
    );
    return this;
  }

  param(param: string, middleware: ParamMiddleware): Router<StateT, CustomT> {
    this.paramMiddlewaresByName.set(param, middleware);
    return this;
  }

  get(
    name: string,
    path: string,
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  get(
    path: string,
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  get<T, U>(
    name: string,
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  get<T, U>(
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  get(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] == "string" &&
      typeof args[1] == "string"
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
    if (args.length > 1 && typeof args[0] == "string") {
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
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  post(
    path: string,
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  post<T, U>(
    name: string,
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  post<T, U>(
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  post(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] == "string" &&
      typeof args[1] == "string"
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
    if (args.length > 1 && typeof args[0] == "string") {
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
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  put(
    path: string,
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  put<T, U>(
    name: string,
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  put<T, U>(
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  put(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] == "string" &&
      typeof args[1] == "string"
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
    if (args.length > 1 && typeof args[0] == "string") {
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
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  delete(
    path: string,
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  delete<T, U>(
    name: string,
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  delete<T, U>(
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  delete(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] == "string" &&
      typeof args[1] == "string"
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
    if (args.length > 1 && typeof args[0] == "string") {
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
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  patch(
    path: string,
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  patch<T, U>(
    name: string,
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  patch<T, U>(
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  patch(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] == "string" &&
      typeof args[1] == "string"
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
    if (args.length > 1 && typeof args[0] == "string") {
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
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  any(
    path: string,
    ...middlewares: Array<RouterMiddleware<StateT, CustomT>>
  ): Router<StateT, CustomT>;
  any<T, U>(
    name: string,
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  any<T, U>(
    path: string,
    middleware: Koa.Middleware<T, U>,
    routeHandler: RouterMiddleware<StateT & T, CustomT & U>,
  ): Router<StateT, CustomT>;
  any(...args: any[]): this {
    if (
      args.length > 2 &&
      typeof args[0] == "string" &&
      typeof args[1] == "string"
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
    if (args.length > 1 && typeof args[0] == "string") {
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

  redirect(
    from: string,
    to: string,
    code: number = 301,
  ): Router<StateT, CustomT> {
    if (!(code >= 300 && code < 400)) {
      throw new Error("Invalid redirect status code");
    }
    this.any(from, (ctx) => {
      ctx.response.status = code;
      ctx.response.redirect(to);
    });
    return this;
  }

  register(config: {
    readonly name?: string | null;
    readonly path: string;
    readonly method: string;
    readonly middlewares: RouterMiddleware | readonly RouterMiddleware[];
  }): Route {
    let { name = null, path, method, middlewares } = config;
    if (!Array.isArray(middlewares)) {
      middlewares = [middlewares] as readonly RouterMiddleware[];
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

  middleware(): RouterMiddleware<StateT, CustomT> {
    const router = async (ctx: Koa.Context, next: Koa.Next) => {
      let { path, method } = ctx.request;
      const {
        [kRouterPath]: routerPath,
        [kRouterMethod]: routerMethod,
      } = ctx as any;
      if (typeof routerPath == "string") {
        path = routerPath;
      } else {
        (ctx as any)[kRouterPath] = path; // TODO Fix context type signature to allow symbols.
      }
      if (typeof routerMethod == "string") {
        method = routerMethod;
      } else {
        (ctx as any)[kRouterMethod] = method; // TODO Fix context type signature to allow symbols.
      }

      const params: MatchedPathParams = Object.create(null);

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
      if (match == kNotFound) {
        return next();
      }
      if (match == kMethodNotAllowed) {
        throw new MethodNotAllowedError();
      }

      const updatedParams = await this.convertParams(params, ctx);
      const { route } = match;

      // Update context.
      ctx.router = this;
      const ctxParams = ctx.params;
      if (ctxParams == null) {
        ctx.params = updatedParams;
      } else {
        Object.assign(ctxParams, updatedParams);
      }

      // Call route middleware.
      return compose([...this.middlewares, ...route.middlewares])(
        ctx as RouterContext,
      );
    };
    Object.defineProperty(router, kRouter, {
      value: this,
    });
    Object.defineProperty(router, "name", {
      value: "router",
    });
    return router;
  }

  private async convertParams(
    params: MatchedPathParams,
    ctx: Koa.Context,
  ): Promise<any> {
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
  makePath(name: string, params: { readonly [key: string]: any }): string {
    const route = this.namedRoute(name);
    if (this.prefix != null) {
      return this.prefix.makePath(params) + route.makePath(params).substring(1);
    } else {
      return route.makePath(params);
    }
  }
}
