import { controller, http, response } from "@webfx/controller";
import test from "ava";
import { Container, injectable } from "inversify";
import Koa from "koa";
import { newSuperTest } from "./util";

test("should handle HTTP methods", async (t) => {
  // Arrange.

  @injectable()
  @controller("/x")
  class Controller1 {
    @http.get("/")
    @http.header("X-Result", "/x/index")
    index(@response() response: Koa.Response) {
      response.set("X-Result", "/x/index");
    }

    @http.get("/a")
    @http.header("X-Result", "/x/a")
    a(@response() response: Koa.Response) {
      response.set("X-Result", "/x/a");
    }
  }

  @injectable()
  @controller("/y")
  class Controller2 {
    @http.get("/")
    @http.header("X-Result", "/y/index")
    index(@response() response: Koa.Response) {
      response.set("X-Result", "/y/index");
    }

    @http.get("/b")
    @http.header("X-Result", "/y/b")
    b(@response() response: Koa.Response) {
      response.set("X-Result", "/y/b");
    }
  }

  const container = new Container();
  const { agent } = newSuperTest({
    container,
    middlewares: [],
    controllers: [Controller1, Controller2],
  });

  // Act. Assert.

  t.is((await agent.get("/x").send()).get("X-Result"), "/x/index");
  t.is((await agent.get("/x/a").send()).get("X-Result"), "/x/a");
  t.is((await agent.get("/y").send()).get("X-Result"), "/y/index");
  t.is((await agent.get("/y/b").send()).get("X-Result"), "/y/b");
});
