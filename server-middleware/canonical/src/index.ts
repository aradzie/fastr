import { RouterContext } from "@webfx-middleware/router";
import { IMiddleware } from "@webfx/middleware";
import { inject, injectable } from "inversify";
import Koa from "koa";

@injectable()
export class Canonical implements IMiddleware {
  private readonly protocol: string;
  private readonly hostname: string;
  private readonly port: string;

  constructor(@inject("canonicalUrl") canonicalUrl: string) {
    const url = new URL(canonicalUrl);
    const { protocol, hostname, port } = url;
    this.protocol = protocol;
    this.hostname = hostname;
    this.port = port;
  }

  async handle(ctx: RouterContext, next: Koa.Next): Promise<any> {
    const { protocol, hostname, port } = this;
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
    } else {
      return next();
    }
  }
}
