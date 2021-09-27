import type { interfaces } from "inversify";
import type Koa from "koa";

export type Type<T> = { new (...args: any[]): T };

export type MiddlewareId = interfaces.ServiceIdentifier<any> | Koa.Middleware;

export interface IMiddleware {
  handle(ctx: Koa.Context, next: Koa.Next): any;
}

export function isMiddlewareClass(target: any): target is Type<IMiddleware> {
  return typeof target?.prototype?.handle === "function";
}

export function isMiddlewareObject(target: any): target is IMiddleware {
  return typeof target?.handle === "function";
}
