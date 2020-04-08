import { Router, RouterContext } from "@webfx-middleware/router";
import { request } from "@webfx-request/node";
import {
  controller,
  http,
  kContext,
  kRequest,
  kResponse,
  kRouter,
  use,
} from "@webfx/controller";
import { IMiddleware } from "@webfx/middleware";
import test from "ava";
import { Container, inject, injectable } from "inversify";
import Koa from "koa";
import { makeHelper } from "./helper";

test("should inject arbitrary dependencies", async (t) => {
  // Arrange.

  @injectable()
  class Service1 {
    run() {}
  }

  @injectable()
  class Middleware1 implements IMiddleware {
    constructor(private readonly service1: Service1) {}

    async handle(ctx: RouterContext, next: Koa.Next) {
      this.service1.run();
      await next();
    }
  }

  @injectable()
  @controller()
  @use(Middleware1)
  class Controller1 {
    constructor(private readonly service1: Service1) {}

    @http.get("/")
    async index() {
      if (!(this.service1 instanceof Service1)) {
        throw new Error();
      }
      return "ok";
    }
  }

  const container = new Container();
  container.bind(Service1).toSelf();
  const { server } = makeHelper({
    container,
    middlewares: [],
    controllers: [Controller1],
  });

  // Act.

  const { body } = await request.get("/").use(server).send();

  // Assert.

  t.is(await body.text(), "ok");
});

test("should inject framework objects", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    constructor(
      @inject(kContext) private readonly ctx: Koa.Context,
      @inject(kRequest) private readonly request: Koa.Request,
      @inject(kResponse) private readonly response: Koa.Response,
      @inject(kRouter) private readonly router: Router,
    ) {}

    @http.get("/")
    async index() {
      if (
        this.ctx.request !== this.request ||
        this.ctx.response !== this.response ||
        this.ctx.router !== this.router
      ) {
        throw new Error();
      }
      return "ok";
    }
  }

  const container = new Container();
  const { server } = makeHelper({
    container,
    middlewares: [],
    controllers: [Controller1],
  });

  // Act.

  const { body } = await request.get("/").use(server).send();

  // Assert.

  t.is(await body.text(), "ok");
});
