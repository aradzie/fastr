import { type Context, type Middleware, type Next } from "@fastr/core";

export function canonical(
  canonicalUrl: string,
  methods: readonly string[] = ["GET", "HEAD"],
): Middleware {
  const { protocol, hostname, port } = new URL(canonicalUrl);

  return async (ctx: Context, next: Next): Promise<void> => {
    if (!methods.includes(ctx.request.method) && !methods.includes("*")) {
      return await next();
    }
    if (ctx.request.href === "") {
      return await next();
    }
    const url = new URL(ctx.request.href);
    if (
      url.protocol === protocol &&
      url.hostname === hostname &&
      url.port === port
    ) {
      return await next();
    }
    url.protocol = protocol;
    url.hostname = hostname;
    url.port = port;
    ctx.response.redirect(String(url), 301);
  };
}
