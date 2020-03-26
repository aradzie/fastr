import { controller, http, use } from "@fastr/controller";
import { type Context, type Handler, type Next } from "@fastr/core";
import { type RouterState } from "@fastr/middleware-router";
import { injectable } from "@sosimple/inversify";
import test from "ava";
import { helper } from "./helper.js";

test("use injectable middlewares", async (t) => {
  // Arrange.

  @injectable()
  class Handler1 implements Handler {
    async handle(ctx: Context<RouterState>, next: Next) {
      await next();
      ctx.response.body = `1>${ctx.response.body}`;
    }
  }

  @injectable()
  class Handler2 implements Handler {
    async handle(ctx: Context<RouterState>, next: Next) {
      await next();
      ctx.response.body = `2>${ctx.response.body}`;
    }
  }

  @injectable()
  class Handler3 implements Handler {
    async handle(ctx: Context<RouterState>, next: Next) {
      await next();
      ctx.response.body = `3>${ctx.response.body}`;
    }
  }

  @injectable()
  class Handler4 implements Handler {
    async handle(ctx: Context<RouterState>, next: Next) {
      await next();
      ctx.response.body = `4>${ctx.response.body}`;
    }
  }

  @injectable()
  class Handler15 implements Handler {
    async handle(ctx: Context<RouterState>, next: Next) {
      await next();
      ctx.response.body = `5>${ctx.response.body}`;
    }
  }

  @injectable()
  @controller()
  @use(Handler2, Handler3)
  @use(Handler4)
  class Controller1 {
    @http.get("/")
    @use(Handler15)
    async index() {
      return "result";
    }
  }

  const req = helper(null, [Handler1], [Controller1]);

  // Act.

  const { body } = await req.get("/").send();

  // Assert.

  t.is(await body.text(), "1>2>3>4>5>result");
});

test("use function middlewares", async (t) => {
  // Arrange.

  async function middleware1(ctx: Context<RouterState>, next: Next) {
    await next();
    ctx.response.body = `1>${ctx.response.body}`;
  }

  async function middleware2(ctx: Context<RouterState>, next: Next) {
    await next();
    ctx.response.body = `2>${ctx.response.body}`;
  }

  async function middleware3(ctx: Context<RouterState>, next: Next) {
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

  const req = helper(null, [middleware1], [Controller1]);

  // Act.

  const { body } = await req.get("/").send();

  // Assert.

  t.is(await body.text(), "1>2>3>result");
});
