import { Router } from "@webfx-middleware/router";
import { Builder } from "@webfx/controller";
import { MiddlewareId } from "@webfx/middleware";
import { Container } from "inversify";
import Koa from "koa";
import supertest from "supertest";

type Constructor = { new (...args: any[]): object };

export function newSuperTest({
  container,
  middlewares = [],
  controllers = [],
}: {
  container: Container;
  middlewares?: MiddlewareId[];
  controllers?: Constructor[];
}) {
  const app = new Koa();
  const router = new Router();
  new Builder(container)
    .add(router, ...controllers)
    .use(app, ...middlewares)
    .use(app, router.middleware())
    .build();
  const agent = supertest.agent(app.listen());
  return { app, agent };
}
