import type { RouterContext } from "@webfx-middleware/router";
import type { IMiddleware } from "@webfx/middleware";
import { inject, injectable } from "inversify";
import type Koa from "koa";
import { URL } from "url";

@injectable()
export class Canonical implements IMiddleware {
  private readonly canonicalUrl: URL;

  constructor(@inject("canonicalUrl") canonicalUrl: string) {
    this.canonicalUrl = new URL(canonicalUrl);
  }

  async handle(ctx: RouterContext, next: Koa.Next): Promise<any> {
    const { protocol, hostname, port } = this.canonicalUrl;
    let url = ctx.request.URL as URL;
    if (
      url.protocol !== protocol ||
      url.hostname !== hostname ||
      url.port !== port
    ) {
      url = new URL(String(url));
      url.protocol = protocol;
      url.hostname = hostname;
      url.port = port;
      ctx.response.redirect(String(url));
      // The koa.redirect method uses status 302, moved temporarily,
      // but we want 301, moved permanently.
      ctx.response.status = 301;
    } else {
      return next();
    }
  }
}
