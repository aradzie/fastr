import { type Newable } from "@fastr/metadata";
import { type Context } from "./context.js";

export type Next = () => Promise<void>;

export type BaseMiddleware<T extends Context> = (
  context: T,
  next: Next,
) => void | Promise<void>;

export type Middleware<StateT = unknown> = BaseMiddleware<Context<StateT>>;

export type HandlerClass<StateT = unknown> = Newable<Handler<StateT>> & {
  prototype: Handler<StateT>;
};

export type Handler<StateT = unknown> = {
  handle(ctx: Context<StateT>, next: Next): void | Promise<void>;
};

export type AnyMiddleware<T = any> =
  | HandlerClass<T>
  | Handler<T>
  | Middleware<T>;

export function isHandlerClass(target: any): target is HandlerClass {
  return typeof target?.prototype?.handle === "function";
}

export function isHandlerObject(target: any): target is Handler {
  return typeof target?.handle === "function";
}

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
