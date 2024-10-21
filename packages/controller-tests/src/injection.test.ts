import { controller, http, use } from "@fastr/controller";
import {
  Context,
  type HandlerObject,
  type Next,
  Request,
  Response,
} from "@fastr/core";
import { injectable } from "@fastr/invert";
import { Router } from "@fastr/middleware-router";
import test, { registerCompletionHandler } from "ava";
import { helper } from "./helper.js";

registerCompletionHandler(() => {
  process.exit();
});

test("inject arbitrary dependencies", async (t) => {
  // Arrange.

  @injectable()
  class Service1 {
    run() {}
  }

  @injectable()
  class Handler1 implements HandlerObject {
    constructor(private readonly service1: Service1) {}

    async handle(ctx: Context, next: Next) {
      this.service1.run();
      await next();
    }
  }

  @injectable()
  @controller()
  @use(Handler1)
  class Controller1 {
    constructor(private readonly service1: Service1) {}

    @http.GET("/")
    async index() {
      if (!(this.service1 instanceof Service1)) {
        throw new Error();
      }
      return "ok";
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act.

  const { body } = await req.GET("/").send();

  // Assert.

  t.is(await body.text(), "ok");
});

test("inject framework objects", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    constructor(
      private readonly ctx: Context,
      private readonly req: Request,
      private readonly res: Response,
      private readonly router: Router,
    ) {}

    @http.GET("/")
    async index() {
      if (
        this.ctx.request !== this.req ||
        this.ctx.response !== this.res ||
        this.ctx.state.router !== this.router
      ) {
        throw new Error();
      }
      return "ok";
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act.

  const { body } = await req.GET("/").send();

  // Assert.

  t.is(await body.text(), "ok");
});
