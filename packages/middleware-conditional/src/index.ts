import { type Context, type Middleware, type Next } from "@fastr/core";
import { ETag, IfNoneMatch, RequestCacheControl } from "@fastr/headers";
import { isSuccess } from "@fastr/status";

export function conditional(): Middleware {
  return async (ctx: Context, next: Next) => {
    await next();

    if (isCacheable(ctx) && isFresh(ctx)) {
      ctx.response.status = 304;
    }
  };
}

export function isCacheable({ request, response }: Context): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }
  if (!isSuccess(response.status)) {
    return false;
  }
  const cacheControl = RequestCacheControl.tryGet(request.headers);
  return cacheControl == null || !cacheControl.noCache;
}

export function isFresh({ request, response }: Context): boolean {
  const ifNoneMatch = IfNoneMatch.tryGet(request.headers);
  const eTag = ETag.tryGet(response.headers);
  if (ifNoneMatch == null || eTag == null) {
    return false;
  }
  return !ifNoneMatch.any && ifNoneMatch.matches(eTag);
}
