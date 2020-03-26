import { type Context, type Middleware, type Next } from "@fastr/core";

export function canonical(canonicalUrl: string): Middleware {
  const { protocol, hostname, port } = new URL(canonicalUrl);

  return async (ctx: Context, next: Next): Promise<void> => {
    const url = new URL(ctx.request.href);
    if (
      url.protocol !== protocol ||
      url.hostname !== hostname ||
      url.port !== port
    ) {
      url.protocol = protocol;
      url.hostname = hostname;
      url.port = port;
      ctx.response.redirect(String(url), 301);
    } else {
      await next();
    }
  };
}
