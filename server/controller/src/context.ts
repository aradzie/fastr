import { RouterContext } from "@webfx-middleware/router";

export function getContext(ctx: RouterContext) {
  return ctx;
}

export function getRequest(ctx: RouterContext) {
  return ctx.request;
}

export function getResponse(ctx: RouterContext) {
  return ctx.response;
}

export function getBody(ctx: RouterContext) {
  // TODO type signature
  const request = ctx.request as any;
  return (
    request.body ??
    request.buffer ??
    request.text ??
    request.json ??
    request.from ??
    null
  );
}

export function getPathParam(ctx: RouterContext, key: string | null) {
  return ctx.params[key!] ?? null;
}

export function getQueryParam(ctx: RouterContext, key: string | null) {
  return ctx.request.query[key!] ?? null;
}

export function getHeaderParam(ctx: RouterContext, key: string | null) {
  return ctx.request.headers[key!] ?? null;
}

export function getCookieParam(ctx: RouterContext, key: string | null) {
  return ctx.cookies.get(key!) ?? null;
}
