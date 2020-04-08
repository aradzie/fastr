import { Router } from "@webfx-middleware/router";
import { BuildableRequest, request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import { Builder } from "@webfx/controller";
import { MiddlewareId } from "@webfx/middleware";
import { Container } from "inversify";
import Koa from "koa";

type Constructor = { new (...args: any[]): object };

export function makeHelper({
  container,
  middlewares = [],
  controllers = [],
}: {
  container: Container;
  middlewares?: MiddlewareId[];
  controllers?: Constructor[];
}): {
  request: BuildableRequest;
} {
  const app = new Koa();
  const router = new Router();
  new Builder(container)
    .add(router, ...controllers)
    .use(app, ...middlewares)
    .use(app, router.middleware())
    .build();
  return { request: request.use(start(app.listen())) };
}
