import { controller, http, response } from "@webfx/controller";
import test from "ava";
import { Container, injectable } from "inversify";
import Koa from "koa";
import { newSuperTest } from "./util";

test("should handle HTTP methods", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.del("/")
    executeDelete(@response() response: Koa.Response) {
      response.set("X-Result", "delete");
    }

    @http.get({ name: "index" })
    executeGet(@response() response: Koa.Response) {
      response.set("X-Result", "get");
    }

    @http.patch("/")
    executePatch(@response() response: Koa.Response) {
      response.set("X-Result", "patch");
    }

    @http.post("/")
    executePost(@response() response: Koa.Response) {
      response.set("X-Result", "post");
    }

    @http.put("/")
    executePut(@response() response: Koa.Response) {
      response.set("X-Result", "put");
    }
  }

  const container = new Container();
  const { agent } = newSuperTest({
    container,
    middlewares: [],
    controllers: [Controller1],
  });

  // Act. Assert.

  t.is((await agent.delete("/").send()).get("X-Result"), "delete");
  t.is((await agent.get("/").send()).get("X-Result"), "get");
  t.is((await agent.patch("/").send()).get("X-Result"), "patch");
  t.is((await agent.post("/").send()).get("X-Result"), "post");
  t.is((await agent.put("/").send()).get("X-Result"), "put");
});
