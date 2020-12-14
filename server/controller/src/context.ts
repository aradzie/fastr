import type { RouterContext } from "@webfx-middleware/router";
import type Koa from "koa";

export function getContext(ctx: RouterContext): RouterContext {
  return ctx;
}

export function getRequest(ctx: RouterContext): Koa.Request {
  return ctx.request;
}

export function getResponse(ctx: RouterContext): Koa.Response {
  return ctx.response;
}

export function getBody(ctx: RouterContext): any {
  // TODO type signature
  const request = ctx.request as any;
  return (
    request.body ??
    request.buffer ??
    request.text ??
    request.json ??
    request.form ??
    null
  );
}

export function getPathParam(
  ctx: RouterContext,
  key: string | null,
): string | null {
  return ctx.params[key!] ?? null;
}

export function getQueryParam(
  ctx: RouterContext,
  key: string | null,
): string | null {
  return ctx.request.query[key!] ?? null;
}

export function getHeaderParam(
  ctx: RouterContext,
  key: string | null,
): string | null {
  return ctx.request.headers[key!] ?? null;
}

export function getCookieParam(
  ctx: RouterContext,
  key: string | null,
): string | null {
  return ctx.cookies.get(key!) ?? null;
}
