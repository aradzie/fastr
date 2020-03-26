import { type Newable } from "@fastr/lang";
import { type Context } from "./context.js";

export type Next = () => Promise<void>;

export type BaseMiddleware<T extends Context> = (
  context: T,
  next: Next,
) => void | Promise<void>;

export type Middleware<StateT = unknown> = BaseMiddleware<Context<StateT>>;

export type HandlerObject<StateT = unknown> = {
  readonly handle: Middleware<StateT>;
};

export type HandlerClass<StateT = unknown> = Newable<HandlerObject<StateT>> & {
  readonly prototype: HandlerObject<StateT>;
};

export type AnyMiddleware<T = unknown> =
  | Middleware<T>
  | HandlerObject<T>
  | HandlerClass<T>;

export const isMiddleware = (target: any): target is Middleware => {
  return (
    typeof target === "function" && //
    typeof target?.handle !== "function" &&
    typeof target?.prototype?.handle !== "function"
  );
};

export const isHandlerObject = (target: any): target is HandlerObject => {
  return (
    typeof target !== "function" && //
    typeof target?.handle === "function"
  );
};

export const isHandlerClass = (target: any): target is HandlerClass => {
  return (
    typeof target === "function" && //
    typeof target?.prototype?.handle === "function"
  );
};

export const toMiddleware = (target: AnyMiddleware): Middleware => {
  if (isHandlerObject(target)) {
    return (ctx, next) => target.handle(ctx, next);
  }

  if (isHandlerClass(target)) {
    return (ctx, next) => ctx.container.get(target).handle(ctx, next);
  }

  if (isMiddleware(target)) {
    return target;
  }

  throw new TypeError(
    `Invalid middleware type ${Object.prototype.toString.call(target)}`,
  );
};
