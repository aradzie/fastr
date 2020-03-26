import { controller, http, use } from "@fastr/controller";
import {
  Context,
  type Handler,
  type Next,
  Request,
  Response,
} from "@fastr/core";
import { Router, type RouterState } from "@fastr/middleware-router";
import { injectable } from "@sosimple/inversify";
import test from "ava";
import { helper } from "./helper.js";

test("inject arbitrary dependencies", async (t) => {
  // Arrange.

  @injectable()
  class Service1 {
    run() {}
  }

  @injectable()
  class Handler1 implements Handler {
    constructor(private readonly service1: Service1) {}

    async handle(ctx: Context<RouterState>, next: Next) {
      this.service1.run();
      await next();
    }
  }

  @injectable()
  @controller()
  @use(Handler1)
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

  const req = helper(null, [], [Controller1]);

  // Act.

  const { body } = await req.get("/").send();

  // Assert.

  t.is(await body.text(), "ok");
});

test("inject framework objects", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    constructor(
      private readonly ctx: Context<RouterState>,
      private readonly req: Request,
      private readonly res: Response,
      private readonly router: Router,
    ) {}

    @http.get("/")
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

  const { body } = await req.get("/").send();

  // Assert.

  t.is(await body.text(), "ok");
});
