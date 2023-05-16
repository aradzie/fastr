import { type Context } from "./context.js";
import {
  type AnyMiddleware,
  type Handler,
  type HandlerClass,
  isHandlerClass,
  isHandlerObject,
  type Middleware,
  type Next,
} from "./middleware.js";

export function toMiddleware(middleware: HandlerClass): Middleware;
export function toMiddleware(middleware: Handler): Middleware;
export function toMiddleware(middleware: Middleware): Middleware;
export function toMiddleware(middleware: AnyMiddleware): Middleware;
export function toMiddleware(middleware: AnyMiddleware): Middleware {
  if (isHandlerClass(middleware)) {
    return (ctx: Context, next: Next): void | Promise<void> =>
      ctx.container.get(middleware).handle(ctx, next);
  }

  if (isHandlerObject(middleware)) {
    return (ctx: Context, next: Next): void | Promise<void> =>
      middleware.handle(ctx, next);
  }

  if (typeof middleware === "function") {
    return middleware as Middleware;
  }

  throw new TypeError();
}
