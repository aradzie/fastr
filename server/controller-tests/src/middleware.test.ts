import { RouterContext } from "@webfx-middleware/router";
import { request } from "@webfx-request/node";
import { controller, http, use } from "@webfx/controller";
import { IMiddleware } from "@webfx/middleware";
import test from "ava";
import { Container, injectable } from "inversify";
import Koa from "koa";
import { makeHelper } from "./helper";

test("should use injectable middlewares", async (t) => {
  // Arrange.

  @injectable()
  class Middleware1 implements IMiddleware {
    async handle(ctx: RouterContext, next: Koa.Next) {
      await next();
      ctx.response.body = `1>${ctx.response.body}`;
    }
  }

  @injectable()
  class Middleware2 implements IMiddleware {
    async handle(ctx: RouterContext, next: Koa.Next) {
      await next();
      ctx.response.body = `2>${ctx.response.body}`;
    }
  }

  @injectable()
  class Middleware3 implements IMiddleware {
    async handle(ctx: RouterContext, next: Koa.Next) {
      await next();
      ctx.response.body = `3>${ctx.response.body}`;
    }
  }

  @injectable()
  class Middleware4 implements IMiddleware {
    async handle(ctx: RouterContext, next: Koa.Next) {
      await next();
      ctx.response.body = `4>${ctx.response.body}`;
    }
  }

  @injectable()
  class Middleware5 implements IMiddleware {
    async handle(ctx: RouterContext, next: Koa.Next) {
      await next();
      ctx.response.body = `5>${ctx.response.body}`;
    }
  }

  @injectable()
  @controller()
  @use(Middleware2, Middleware3)
  @use(Middleware4)
  class Controller1 {
    @http.get("/")
    @use(Middleware5)
    async index() {
      return "result";
    }
  }

  const container = new Container();
  const { server } = makeHelper({
    container,
    middlewares: [Middleware1],
    controllers: [Controller1],
  });

  // Act.

  const { body } = await request.get("/").use(server).send();

  // Assert.

  t.is(await body.text(), "1>2>3>4>5>result");
});

test("should use function middlewares", async (t) => {
  // Arrange.

  async function middleware1(ctx: RouterContext, next: Koa.Next) {
    await next();
    ctx.response.body = `1>${ctx.response.body}`;
  }

  async function middleware2(ctx: RouterContext, next: Koa.Next) {
    await next();
    ctx.response.body = `2>${ctx.response.body}`;
  }

  async function middleware3(ctx: RouterContext, next: Koa.Next) {
    await next();
    ctx.response.body = `3>${ctx.response.body}`;
  }

  @injectable()
  @controller()
  @use(middleware2)
  class Controller1 {
    @http.get("/")
    @use(middleware3)
    async index() {
      return "result";
    }
  }

  const container = new Container();
  const { server } = makeHelper({
    container,
    middlewares: [middleware1],
    controllers: [Controller1],
  });

  // Act.

  const { body } = await request.get("/").use(server).send();

  // Assert.

  t.is(await body.text(), "1>2>3>result");
});
