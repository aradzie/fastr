import type Koa from "koa";

export function conditional(): Koa.Middleware {
  return async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
    await next();
    if (ctx.request.fresh) {
      ctx.response.status = 304;
      ctx.response.body = null;
    }
  };
}
