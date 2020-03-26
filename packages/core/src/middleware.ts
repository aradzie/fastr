import { type Context } from "./context.js";

export type Newable<T = unknown> = { new (...args: any[]): T };

export type Next = () => Promise<void>;

export type DefaultParams = {
  [key: string | symbol]: unknown;
};

export type DefaultState = {
  [key: string | symbol]: unknown;
  params: DefaultParams;
};

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
